import { env } from '../config/env.js';
import { AppError } from '../middleware/errorHandler.js';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

function toGroqMessages(contents, systemInstruction, jsonMode = false) {
  const messages = [];
  let systemContent = systemInstruction || '';

  if (jsonMode) {
    systemContent += systemContent
      ? '\n\nRespond with valid JSON only. No markdown fences or extra text.'
      : 'Respond with valid JSON only. No markdown fences or extra text.';
  }

  if (systemContent) {
    messages.push({ role: 'system', content: systemContent });
  }

  if (typeof contents === 'string') {
    messages.push({ role: 'user', content: contents });
    return messages;
  }

  if (Array.isArray(contents)) {
    for (const item of contents) {
      const role = item.role === 'model' ? 'assistant' : 'user';
      const text = item.parts?.[0]?.text ?? item.content ?? '';
      if (text) messages.push({ role, content: text });
    }
  }

  return messages;
}

function handleGroqError(err) {
  const status = err?.status ?? err?.statusCode;
  if (status === 429) {
    throw new AppError('AI service is temporarily busy. Please try again in a minute.', 429);
  }
  if (status === 400) {
    throw new AppError('AI request could not be processed. Please try again.', 400);
  }
  if (err?.message?.includes('fetch failed')) {
    throw new AppError('Could not reach AI service. Check your network connection.', 503);
  }
  throw err;
}

export async function generateWithGroq({ contents, config = {} }) {
  if (!env.groqApiKey) {
    throw new AppError('Groq API key not configured', 503);
  }

  const jsonMode = config.responseMimeType === 'application/json';
  const messages = toGroqMessages(contents, config.systemInstruction, jsonMode);

  const body = {
    model: env.groqModel,
    messages,
    temperature: 0.7,
  };

  if (jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  let response;
  try {
    response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    handleGroqError(err);
  }

  if (!response.ok) {
    let message = `Groq API error (${response.status})`;
    try {
      const errorBody = await response.json();
      message = errorBody?.error?.message || message;
    } catch {
      // ignore parse errors
    }
    handleGroqError({ status: response.status, message });
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? '';
}
