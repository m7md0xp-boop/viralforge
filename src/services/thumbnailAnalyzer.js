// Browser side of the thumbnail evaluator: loads an image, reads its pixels on a canvas,
// runs the local checks (utils/imageAnalysis.js) and prepares a compressed copy for the vision model.
import { analyzePixels, scoreMetrics } from '../utils/imageAnalysis';
import { parseDataUrl } from './imageRequests';

const ANALYSIS_WIDTH = 320;
const MAX_AI_WIDTH = 1280; // the YouTube thumbnail size; larger images are scaled down before upload

export const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('The image could not be read'));
    img.src = src;
  });

export const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const canvasFor = (img, width) => {
  const height = Math.max(1, Math.round((img.naturalHeight / img.naturalWidth) * width));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, width, height);
  return { canvas, ctx, width, height };
};

// Local analysis of an image (data URL or object URL). Returns { score, checks, metrics, source }.
export async function analyzeImage(src) {
  const img = await loadImage(src);
  const { ctx, width, height } = canvasFor(img, ANALYSIS_WIDTH);
  const pixels = ctx.getImageData(0, 0, width, height);
  const source = { width: img.naturalWidth, height: img.naturalHeight };
  const metrics = analyzePixels(pixels, source);
  return { ...scoreMetrics(metrics), metrics, source };
}

// JPEG copy (at most 1280 px wide) for the vision model, as { mime, base64 }
export async function prepareForVision(src) {
  const img = await loadImage(src);
  const { canvas } = canvasFor(img, Math.min(MAX_AI_WIDTH, img.naturalWidth));
  return parseDataUrl(canvas.toDataURL('image/jpeg', 0.85));
}
