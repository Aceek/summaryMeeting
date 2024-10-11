import fs from 'fs/promises';
import path from 'path';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { logger } from './logger.js';

async function exportResults(results) {
  logger.info('Starting export of results');
  const outputDir = path.join(process.cwd(), 'output');
  await fs.mkdir(outputDir, { recursive: true });

  logger.info('Creating summary document');
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          children: [new TextRun({ text: "Résumé de la Réunion", bold: true, size: 28 })],
        }),
        new Paragraph({
          children: [new TextRun({ text: "Résumé:", bold: true })],
        }),
        new Paragraph({
          children: [new TextRun({ text: results.summary || "Aucun résumé disponible" })],
        }),
        new Paragraph({
          children: [new TextRun({ text: "Analyse de Sentiment:", bold: true })],
        }),
        new Paragraph({
          children: [new TextRun({ text: results.sentiment || "Aucune analyse de sentiment disponible" })],
        }),
        new Paragraph({
          children: [new TextRun({ text: "Transcription avec Identification des Interlocuteurs:", bold: true })],
        }),
        new Paragraph({
          children: [new TextRun({ text: results.speakerRecognition || "Aucune transcription avec identification des interlocuteurs disponible" })],
        }),
      ],
    }],
  });

  logger.info('Saving document to file');
  try {
    const buffer = await Packer.toBuffer(doc);
    const docxPath = path.join(outputDir, 'resume_reunion.docx');
    await fs.writeFile(docxPath, buffer);
    logger.info(`Document saved successfully to ${docxPath}`);
  } catch (error) {
    logger.error('Error saving document:', error);
    throw error;
  }

  logger.info('Checking for word frequency chart');
  const chartPath = path.join(outputDir, 'word_frequency_chart.png');
  try {
    await fs.access(chartPath);
    await fs.copyFile(chartPath, path.join(outputDir, 'word_frequency_chart.png'));
    logger.info('Word frequency chart copied successfully');
  } catch (error) {
    logger.warn('Word frequency chart not found or could not be copied:', error.message);
  }

  logger.info(`Results exported to ${outputDir}`);
  return `Results exported to ${outputDir}`;
}

export { exportResults };
