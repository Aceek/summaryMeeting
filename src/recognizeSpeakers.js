import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import * as dotenv from 'dotenv';
import { logger } from './logger.js';

dotenv.config();

const model = new ChatOpenAI({
  modelName: "gpt-4",
  temperature: 0.3,
  openAIApiKey: process.env.OPENROUTER_API_KEY,
  configuration: {
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "Agent de Résumé Automatique des Réunions",
    },
  },
});

async function recognizeSpeakers(text) {
  logger.info('Starting speaker recognition');
  const template = `
  Analysez le texte suivant, qui est une transcription de réunion, et identifiez les différents interlocuteurs. 
  Attribuez à chaque interlocuteur un identifiant unique (par exemple, Speaker1, Speaker2, etc.) et structurez la transcription en conséquence.

  Texte original :
  {text}

  Instructions :
  1. Identifiez les changements d'interlocuteurs basés sur le contenu et le style de parole.
  2. Attribuez un identifiant unique à chaque interlocuteur.
  3. Restructurez la transcription en indiquant clairement qui parle à chaque moment.
  4. Si possible, identifiez les rôles probables des interlocuteurs (par exemple, animateur, participant, expert).

  Transcription structurée avec identification des interlocuteurs :
  `;

  const prompt = PromptTemplate.fromTemplate(template);

  try {
    const chain = prompt.pipe(model);
    const result = await chain.invoke({ text: text });
    logger.info('Speaker recognition completed successfully');
    return result.content;
  } catch (error) {
    logger.error('Error during speaker recognition:', error);
    throw error;
  }
}

export { recognizeSpeakers };
