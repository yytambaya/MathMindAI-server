import { Assignment, Submission, StudentProfile } from '../models/index.js';
import { CURRICULUM } from '../config/constants.js';
import { createNotification } from '../services/notificationService.js';
import { gradeSubmissionWithAI } from '../services/gradingService.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

export const createAssignment = asyncHandler(async (req, res) => {
  const { title, topic, category, difficulty, deadline, description = '', studentIds = [] } = req.body;

  const resolvedCategory = category || Object.entries(CURRICULUM).find(([, topics]) => topics.includes(topic))?.[0];
  if (!resolvedCategory) throw new AppError('Invalid topic selected', 400);

  const parsedDeadline = new Date(deadline);
  if (Number.isNaN(parsedDeadline.getTime())) throw new AppError('Invalid deadline', 400);

  const assignment = await Assignment.create({
    teacherId: req.user._id,
    title,
    topic,
    category: resolvedCategory,
    difficulty,
    description,
    deadline: parsedDeadline,
    questionIds: [],
    studentIds,
  });

  for (const sid of studentIds) {
    await createNotification(
      sid, 'assignment', 'New Assignment',
      `New assignment: ${title} - Due ${new Date(deadline).toLocaleDateString()}`,
      { assignmentId: assignment._id },
      req.io
    );
  }

  res.status(201).json({ success: true, data: assignment });
});

export const getAssignments = asyncHandler(async (req, res) => {
  let filter = {};
  if (req.user.role === 'teacher') {
    filter.teacherId = req.user._id;
  } else if (req.user.role === 'student') {
    filter.$or = [
      { studentIds: req.user._id },
      { studentIds: { $size: 0 } },
    ];
    filter.isActive = true;
  }

  const assignments = await Assignment.find(filter)
    .populate('teacherId', 'firstName lastName')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: assignments });
});

export const getAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id)
    .populate('questionIds')
    .populate('teacherId', 'firstName lastName');
  if (!assignment) throw new AppError('Assignment not found', 404);
  res.json({ success: true, data: assignment });
});

export const updateAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findOneAndUpdate(
    { _id: req.params.id, teacherId: req.user._id },
    req.body,
    { new: true }
  );
  if (!assignment) throw new AppError('Assignment not found', 404);
  res.json({ success: true, data: assignment });
});

export const deleteAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findOneAndUpdate(
    { _id: req.params.id, teacherId: req.user._id },
    { isActive: false },
    { new: true }
  );
  if (!assignment) throw new AppError('Assignment not found', 404);
  res.json({ success: true, data: assignment });
});

export const submitAssignment = asyncHandler(async (req, res) => {
  const { assignmentId, solution, answers = [] } = req.body;
  const studentId = req.user._id;

  const assignment = await Assignment.findById(assignmentId).populate('questionIds');
  if (!assignment) throw new AppError('Assignment not found', 404);

  const hasQuestions = assignment.questionIds?.length > 0;

  if (hasQuestions) {
    if (!answers.length) throw new AppError('Please answer all questions', 400);
  } else if (!solution?.trim()) {
    throw new AppError('Please submit your solution', 400);
  }

  const aiResult = await gradeSubmissionWithAI(assignment, { solution, answers });

  const existing = await Submission.findOne({ assignmentId, studentId });

  const submissionData = {
    solution: solution?.trim() || '',
    answers: aiResult.gradedAnswers || [],
    aiScore: aiResult.score,
    aiFeedback: aiResult.feedback,
    score: aiResult.score,
    maxScore: aiResult.maxScore,
    submittedAt: new Date(),
    graded: false,
    feedback: '',
  };

  const submission = await Submission.findOneAndUpdate(
    { assignmentId, studentId },
    submissionData,
    { upsert: true, new: true }
  );

  if (!existing) {
    await StudentProfile.findOneAndUpdate(
      { userId: studentId },
      { $inc: { assignmentsCompleted: 1 } }
    );
  }

  await createNotification(
    assignment.teacherId, 'grade', 'Assignment Submitted',
    `A student submitted assignment: ${assignment.title}`,
    { submissionId: submission._id },
    req.io
  );

  res.json({ success: true, data: submission });
});

export const gradeSubmission = asyncHandler(async (req, res) => {
  const { feedback, score } = req.body;

  const submission = await Submission.findById(req.params.id).populate('assignmentId');
  if (!submission) throw new AppError('Submission not found', 404);

  const assignment = submission.assignmentId;
  if (assignment.teacherId.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to grade this submission', 403);
  }

  const update = { graded: true, feedback: feedback ?? '' };
  if (score !== undefined && score !== null && score !== '') {
    update.score = Number(score);
  }

  const updated = await Submission.findByIdAndUpdate(
    req.params.id,
    update,
    { new: true }
  ).populate('studentId', 'firstName lastName');

  await createNotification(
    updated.studentId._id, 'grade', 'Assignment Graded',
    `Your assignment has been graded. Score: ${updated.score}/${updated.maxScore}`,
    { submissionId: updated._id },
    req.io
  );

  res.json({ success: true, data: updated });
});

export const getSubmissions = asyncHandler(async (req, res) => {
  const { assignmentId } = req.query;
  const filter = {};

  if (assignmentId) {
    filter.assignmentId = assignmentId;
    if (req.user.role === 'teacher') {
      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) throw new AppError('Assignment not found', 404);
      if (assignment.teacherId.toString() !== req.user._id.toString()) {
        throw new AppError('Not authorized', 403);
      }
    }
  }

  if (req.user.role === 'student') filter.studentId = req.user._id;

  const submissions = await Submission.find(filter)
    .populate('studentId', 'firstName lastName')
    .populate('assignmentId', 'title topic teacherId')
    .populate('answers.questionId', 'question options correctAnswer');

  res.json({ success: true, data: submissions });
});
