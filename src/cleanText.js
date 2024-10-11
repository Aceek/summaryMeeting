import { CharacterTextSplitter } from 'langchain/text_splitter';

function cleanText(text) {
  // Remove redundancies, pauses, and hesitations
  let cleanedText = text
    .replace(/(\b\w+\b)(?:\s+\1\b)+/gi, '$1') // Remove repeated words
    .replace(/\b(um|uh|er|ah|like|you know|i mean)\b/gi, '') // Remove filler words
    .replace(/\.{3,}/g, '...') // Replace multiple periods with ellipsis
    .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
    .trim();

  // Split the text into chunks
  const splitter = new CharacterTextSplitter({
    separator: '\n',
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const chunks = splitter.splitText(cleanedText);

  return chunks;
}

export { cleanText };
