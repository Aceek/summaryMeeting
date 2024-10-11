import fs from 'fs';
import { promisify } from 'util';
import { transcribeAudio, FileTooLargeError } from './transcribeAudio.js';
import { logger } from './logger.js';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

async function processLargeAudioFile(filePath, maxChunkSize) {
  const buffer = await readFile(filePath);
  const totalSize = buffer.length;
  const chunks = [];
  
  // Determine chunk size based on total file size
  const chunkSize = Math.min(maxChunkSize, Math.ceil(totalSize / 10)); // Divide into at least 10 chunks

  for (let i = 0; i < totalSize; i += chunkSize) {
    chunks.push(buffer.slice(i, i + chunkSize));
  }

  logger.info(`File size: ${totalSize} bytes. Divided into ${chunks.length} chunks of approximately ${chunkSize} bytes each.`);

  let fullTranscription = '';

  for (let i = 0; i < chunks.length; i++) {
    logger.info(`Processing chunk ${i + 1} of ${chunks.length}...`);
    const tempFilePath = `temp_chunk_${i}.mp3`;
    await writeFile(tempFilePath, chunks[i]);

    try {
      const chunkTranscription = await transcribeAudio(tempFilePath);
      fullTranscription += chunkTranscription + ' ';
      logger.info(`Successfully transcribed chunk ${i + 1}`);
    } catch (error) {
      if (error instanceof FileTooLargeError) {
        logger.warn(`Chunk ${i + 1} is still too large. Attempting to split further.`);
        const subChunks = splitChunk(chunks[i]);
        for (let j = 0; j < subChunks.length; j++) {
          const subTempFilePath = `temp_subchunk_${i}_${j}.mp3`;
          await writeFile(subTempFilePath, subChunks[j]);
          try {
            const subChunkTranscription = await transcribeAudio(subTempFilePath);
            fullTranscription += subChunkTranscription + ' ';
            logger.info(`Successfully transcribed sub-chunk ${j + 1} of chunk ${i + 1}`);
          } catch (subError) {
            logger.error(`Error transcribing sub-chunk ${j + 1} of chunk ${i + 1}:`, subError);
          } finally {
            fs.unlinkSync(subTempFilePath);
          }
        }
      } else {
        logger.error(`Error transcribing chunk ${i + 1}:`, error);
      }
    } finally {
      fs.unlinkSync(tempFilePath);
    }
  }

  if (fullTranscription.trim() === '') {
    throw new Error('Failed to transcribe any part of the audio file.');
  }

  return fullTranscription.trim();
}

function splitChunk(chunk) {
  const subChunkSize = Math.ceil(chunk.length / 2);
  return [
    chunk.slice(0, subChunkSize),
    chunk.slice(subChunkSize)
  ];
}

export { processLargeAudioFile };
