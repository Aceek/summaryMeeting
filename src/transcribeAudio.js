import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class FileTooLargeError extends Error {
  constructor(message) {
    super(message);
    this.name = 'FileTooLargeError';
  }
}

// Transcription function using OpenAI Whisper
async function transcribeAudio(filePath) {
  try {
    const response = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: 'whisper-1',
    });
    return response.text;
  } catch (error) {
    if (error.message.includes('Maximum content size limit')) {
      throw new FileTooLargeError('File size exceeds the maximum limit for direct transcription.');
    }
    console.error('Erreur lors de la transcription :', error);
    throw error;
  }
}

export { transcribeAudio, FileTooLargeError };
