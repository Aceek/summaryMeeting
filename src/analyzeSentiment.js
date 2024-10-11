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

async function analyzeSentiment(text) {
  logger.info('Starting sentiment analysis');
  const template = `
  Analysez le sentiment général et le ton des participants dans le texte suivant, qui est une transcription de réunion :

  {text}

  Fournissez une analyse détaillée qui inclut :
  1. Le sentiment général de la réunion (positif, négatif, neutre, ou mixte)
  2. Les changements de ton au cours de la réunion
  3. Les sujets ou moments qui ont suscité des réactions émotionnelles fortes
  4. Toute tension ou désaccord notable
  5. Les moments de consensus ou d'enthousiasme

  Analyse du sentiment :
  `;

  const prompt = PromptTemplate.fromTemplate(template);

  try {
    const chain = prompt.pipe(model);
    const result = await chain.invoke({ text: text });
    logger.info('Sentiment analysis completed successfully');
    return result.content;
  } catch (error) {
    logger.error('Error during sentiment analysis:', error);
    throw error;
  }
}

export { analyzeSentiment };
