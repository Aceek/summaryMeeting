import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs/promises';
import path from 'path';

async function generateVisuals(text) {
  const wordFrequency = getWordFrequency(text);
  const chartBuffer = await createWordFrequencyChart(wordFrequency);
  
  const outputDir = path.join(process.cwd(), 'output');
  await fs.mkdir(outputDir, { recursive: true });
  const chartPath = path.join(outputDir, 'word_frequency_chart.png');
  await fs.writeFile(chartPath, chartBuffer);

  return `Word frequency chart generated: ${chartPath}`;
}

function getWordFrequency(text) {
  const words = text.toLowerCase().match(/\b\w+\b/g);
  const frequency = {};
  for (const word of words) {
    if (word.length > 3) { // Ignore short words
      frequency[word] = (frequency[word] || 0) + 1;
    }
  }
  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10); // Get top 10 words
}

async function createWordFrequencyChart(wordFrequency) {
  const width = 800;
  const height = 600;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Set background
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, width, height);

  // Draw title
  ctx.fillStyle = 'black';
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Top 10 Most Frequent Words in Meeting', width / 2, 30);

  // Draw bars
  const barWidth = 60;
  const startX = 50;
  const startY = height - 50;
  const maxFrequency = Math.max(...wordFrequency.map(([, count]) => count));

  wordFrequency.forEach(([word, count], index) => {
    const barHeight = (count / maxFrequency) * (height - 100);
    const x = startX + index * (barWidth + 20);
    const y = startY - barHeight;

    ctx.fillStyle = 'rgba(54, 162, 235, 0.8)';
    ctx.fillRect(x, y, barWidth, barHeight);

    // Draw word
    ctx.fillStyle = 'black';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(word, x + barWidth / 2, startY + 15);

    // Draw count
    ctx.fillText(count.toString(), x + barWidth / 2, y - 5);
  });

  // Draw axes
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(startX, 50);
  ctx.moveTo(startX, startY);
  ctx.lineTo(width - 50, startY);
  ctx.strokeStyle = 'black';
  ctx.stroke();

  return canvas.toBuffer('image/png');
}

export { generateVisuals };
