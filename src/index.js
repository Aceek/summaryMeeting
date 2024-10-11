#!/usr/bin/env node

import { program } from 'commander';
import path from 'path';
import fs from 'fs-extra';
import dotenv from 'dotenv';
import { ChatOpenAI } from '@langchain/openai';
import { DynamicTool } from '@langchain/core/tools';
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";

import { transcribeAudio, FileTooLargeError } from './transcribeAudio.js';
import { cleanText } from './cleanText.js';
import { generateSummary } from './generateSummary.js';
import { analyzeSentiment } from './analyzeSentiment.js';
import { recognizeSpeakers } from './recognizeSpeakers.js';
import { generateVisuals } from './generateVisuals.js';
import { exportResults } from './exportResults.js';
import { processLargeAudioFile } from './processLargeAudioFile.js';
import { logger } from './logger.js';

dotenv.config();

program
  .version('1.0.0')
  .description('Agent de Résumé Automatique des Réunions avec Langchain')
  .argument('<file>', 'Fichier audio ou texte à traiter')
  .option('--summary-type <type>', 'Type de résumé (global, detaille)', 'global')
  .parse(process.argv);

const options = program.opts();
const inputFile = program.args[0];

if (!inputFile) {
  logger.error('Veuillez fournir un fichier en entrée.');
  process.exit(1);
}

const model = new ChatOpenAI({
  modelName: "gpt-3.5-turbo",
  temperature: 0,
  openAIApiKey: process.env.OPENAI_API_KEY,
});

const tools = [
  new DynamicTool({
    name: "FileProcessor",
    description: "Processes the input file and returns the text content",
    func: async () => {
      const ext = path.extname(inputFile).toLowerCase();
      const isAudio = ['.mp3', '.wav'].includes(ext);
      let textContent = '';

      if (isAudio) {
        logger.info('Transcription en cours...');
        try {
          textContent = await transcribeAudio(inputFile);
        } catch (error) {
          if (error instanceof FileTooLargeError) {
            logger.info('Large audio file detected. Processing in chunks...');
            const maxChunkSize = 10 * 1024 * 1024; // 10MB in bytes
            textContent = await processLargeAudioFile(inputFile, maxChunkSize);
          } else {
            throw error;
          }
        }
      } else {
        logger.info('Lecture du fichier texte...');
        textContent = await fs.readFile(inputFile, 'utf-8');
      }

      return textContent;
    }
  }),
  new DynamicTool({
    name: "TextCleaner",
    description: "Cleans and preprocesses the text",
    func: async (text) => {
      logger.info('Nettoyage du texte...');
      return cleanText(text);
    }
  }),
  new DynamicTool({
    name: "SummaryGenerator",
    description: "Generates a summary of the text",
    func: async (text) => {
      logger.info('Génération du résumé...');
      return generateSummary(text, options.summaryType);
    }
  }),
  new DynamicTool({
    name: "SentimentAnalyzer",
    description: "Analyzes the sentiment of the text",
    func: async (text) => {
      logger.info('Analyse du sentiment...');
      return analyzeSentiment(text);
    }
  }),
  new DynamicTool({
    name: "SpeakerRecognizer",
    description: "Recognizes and separates speakers in the text",
    func: async (text) => {
      logger.info('Reconnaissance des interlocuteurs...');
      return recognizeSpeakers(text);
    }
  }),
  new DynamicTool({
    name: "VisualGenerator",
    description: "Generates visuals based on the text content",
    func: async (text) => {
      logger.info('Génération des visuels...');
      return generateVisuals(text);
    }
  }),
  new DynamicTool({
    name: "ResultsExporter",
    description: "Exports all results to a folder",
    func: async (results) => {
      logger.info('Exportation des résultats...');
      return exportResults(results);
    }
  }),
];

const prompt = ChatPromptTemplate.fromMessages([
  ["system", `You are an AI assistant designed to process meeting recordings or transcripts. 
  Your task is to analyze the input, generate a summary, perform sentiment analysis, 
  recognize speakers, generate visuals, and export the results. Follow these steps:

  1. Process the input file to get the text content.
  2. Clean and preprocess the text.
  3. Generate a summary of the text.
  4. Analyze the sentiment of the text.
  5. Recognize and separate speakers in the text.
  6. Generate visuals based on the text content.
  7. Export all results to a folder.

  Use the appropriate tool for each step and provide the results.`],
  ["human", "{input}"],
  new MessagesPlaceholder("agent_scratchpad"),
]);

const agent = await createOpenAIFunctionsAgent({
  llm: model,
  tools,
  prompt,
});

const executor = new AgentExecutor({
  agent,
  tools,
  verbose: true,
});

logger.info("Agent de Résumé Automatique des Réunions initialisé...");

async function processFile() {
  try {
    const result = await executor.invoke({
      input: `Process the file ${inputFile}, generate a summary, analyze sentiment, recognize speakers, generate visuals, and export all results.`,
    });

    logger.info("Traitement terminé. Résultats enregistrés dans le dossier 'output'.");
    logger.info("Résultat final:", result.output);
  } catch (error) {
    logger.error("Une erreur s'est produite lors du traitement:", error);
  } finally {
    logger.info(`Logs saved in: ${logger.getSessionDir()}`);
  }
}

processFile();
