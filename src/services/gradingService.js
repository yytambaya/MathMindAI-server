import { env } from '../config/env.js';
import { GoogleGenAI } from '@google/genai';

let ai = null;

function getClient() {
  if (!env.geminiApiKey) return null;
  if (!ai) ai = new GoogleGenAI({ apiKey: env.geminiApiKey });
  return ai;
}

export async function gradeSubmissionWithAI(assignment, { solution, answers = [] }) {
  const hasQuestions = assignment.questionIds?.length > 0;

  if (hasQuestions) {
    return gradeMcqWithAI(assignment, answers);
  }

  if (!solution?.trim()) {
    return { score: 0, maxScore: 100, feedback: 'No solution was provided.' };
  }

  const client = getClient();
  if (!client) {
    return {
      score: 0,
      maxScore: 100,
      feedback: 'AI grading is unavailable. Your teacher will review your submission.',
    };
  }

  const prompt = `You are grading a math assignment for a school student.

Assignment title: ${assignment.title}
Topic: ${assignment.topic}
Difficulty: ${assignment.difficulty}
Instructions from teacher:
${assignment.description || 'No additional instructions.'}

Student's submitted solution:
${solution}

Grade the submission fairly for a ${assignment.difficulty} level ${assignment.topic} assignment.
Consider correctness, method shown, and completeness.

Return JSON with exactly these fields:
{
  "score": <number 0-100>,
  "maxScore": 100,
  "feedback": "<constructive feedback for the student, 2-4 sentences>"
}`;

  try {
    const response = await client.models.generateContent({
      model: env.geminiModel,
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    const parsed = JSON.parse(response.text ?? '{}');
    return {
      score: Math.min(Math.max(Number(parsed.score) || 0, 0), 100),
      maxScore: 100,
      feedback: parsed.feedback || 'Submission reviewed by AI.',
    };
  } catch {
    return {
      score: 0,
      maxScore: 100,
      feedback: 'AI grading encountered an error. Your teacher will review your submission.',
    };
  }
}

async function gradeMcqWithAI(assignment, answers) {
  const questions = assignment.questionIds;
  const gradedAnswers = answers.map((a) => {
    const question = questions.find((q) => q._id.toString() === a.questionId);
    return {
      questionId: a.questionId,
      answer: a.answer,
      isCorrect: question ? a.answer === question.correctAnswer : false,
    };
  });

  const correctCount = gradedAnswers.filter((a) => a.isCorrect).length;
  const maxScore = questions.length;
  let score = correctCount;
  let feedback = `You answered ${correctCount} of ${maxScore} questions correctly.`;

  const client = getClient();
  if (client && answers.length) {
    const prompt = `You graded a multiple-choice math assignment. Results: ${correctCount}/${maxScore} correct.
Topic: ${assignment.topic}, Difficulty: ${assignment.difficulty}

Return JSON:
{
  "feedback": "<brief encouraging feedback for the student, 1-2 sentences>"
}`;

    try {
      const response = await client.models.generateContent({
        model: env.geminiModel,
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });
      const parsed = JSON.parse(response.text ?? '{}');
      if (parsed.feedback) feedback = parsed.feedback;
    } catch {
      // keep default feedback
    }
  }

  return { score, maxScore, feedback, gradedAnswers };
}
