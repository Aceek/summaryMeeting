import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import * as dotenv from 'dotenv';
import { logger } from './logger.js';

dotenv.config();

const model = new ChatOpenAI({
  modelName: "gpt-4-32k",
  temperature: 0.7,
  openAIApiKey: process.env.OPENROUTER_API_KEY,
  configuration: {
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "Agent de Résumé Automatique des Réunions",
    },
  },
});

async function generateSummary(text, type = 'global') {
  logger.info(`Generating ${type} summary`);
  const template = `
  Vous êtes un assistant expert en résumé de réunions. Votre tâche est de générer un résumé {type} de la réunion suivante :

  {text}

  Veuillez inclure les éléments suivants dans votre résumé :
  1. Les principaux points discutés
  2. Les décisions prises
  3. Les actions à entreprendre
  4. Les points de désaccord ou les questions en suspens

  Si le type de résumé est 'global', fournissez un aperçu concis des points clés.
  Si le type est 'detaille', élaborez davantage sur chaque point important.

  Résumé :
  `;

  const prompt = PromptTemplate.fromTemplate(template);

  try {
    const chain = prompt.pipe(model);
    const result = await chain.invoke({ type: type, text: text });
    logger.info('Summary generated successfully');
    return result.content;
  } catch (error) {
    logger.error('Error generating summary:', error);
    throw error;
  }
}

export { generateSummary };
