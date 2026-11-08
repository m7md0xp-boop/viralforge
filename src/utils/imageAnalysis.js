// Local thumbnail checks on raw pixels. Pure functions (no DOM) so they can be tested in Node.
// Input: { data: Uint8ClampedArray RGBA, width, height } (like canvas ImageData).
// These are heuristics: they measure what can be measured without a model (light, contrast, colour,
// sharpness, clutter, legibility at small size, an estimate of the face/skin area). The vision model
// judges what needs understanding (expression, text, story).

const clamp = (v, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));

// 0 at `bad`, 100 at `good`, linear in between (works in both directions)
export const ramp = (value, bad, good) => clamp(((value - bad) / (good - bad)) * 100);

// 100 inside [lo, hi], falling to 0 at the outer limits
export const band = (value, outerLo, lo, hi, outerHi) => {
  if (value < lo) return ramp(value, outerLo, lo);
  if (value > hi) return ramp(value, outerHi, hi);
  return 100;
};

const luma = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;

// Grayscale copy (Float32Array), one value per pixel
export function toGray({ data, width, height }) {
  const gray = new Float32Array(width * height);
  for (let i = 0, p = 0; p < gray.length; i += 4, p++) gray[p] = luma(data[i], data[i + 1], data[i + 2]);
  return gray;
}

// Nearest-neighbour downscale of RGBA pixels (used for the "small size" checks)
export function downscale({ data, width, height }, w, h) {
  const out = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const sx = Math.min(width - 1, Math.floor(((x + 0.5) * width) / w));
      const sy = Math.min(height - 1, Math.floor(((y + 0.5) * height) / h));
      const si = (sy * width + sx) * 4;
      const di = (y * w + x) * 4;
      out[di] = data[si];
      out[di + 1] = data[si + 1];
      out[di + 2] = data[si + 2];
      out[di + 3] = 255;
    }
  }
  return { data: out, width: w, height: h };
}

// Mean brightness and contrast (standard deviation of luminance), 0-255
export function luminanceStats(gray) {
  let sum = 0;
  for (const v of gray) sum += v;
  const mean = sum / gray.length;
  let sq = 0;
  for (const v of gray) sq += (v - mean) ** 2;
  return { mean, contrast: Math.sqrt(sq / gray.length) };
}

// Colourfulness (Hasler & Süsstrunk 2003): ~0 grey, 15-33 dull, 45-60 colourful, 80+ very colourful
export function colorfulness({ data }) {
  let n = 0;
  let sumRg = 0;
  let sumYb = 0;
  let sqRg = 0;
  let sqYb = 0;
  for (let i = 0; i < data.length; i += 4) {
    const rg = data[i] - data[i + 1];
    const yb = 0.5 * (data[i] + data[i + 1]) - data[i + 2];
    sumRg += rg;
    sumYb += yb;
    sqRg += rg * rg;
    sqYb += yb * yb;
    n++;
  }
  const mRg = sumRg / n;
  const mYb = sumYb / n;
  const sdRg = Math.sqrt(Math.max(0, sqRg / n - mRg * mRg));
  const sdYb = Math.sqrt(Math.max(0, sqYb / n - mYb * mYb));
  return Math.sqrt(sdRg ** 2 + sdYb ** 2) + 0.3 * Math.sqrt(mRg ** 2 + mYb ** 2);
}

// Sharpness: variance of the Laplacian. Blurry images score low.
export function sharpness(gray, width, height) {
  let sum = 0;
  let sq = 0;
  let n = 0;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      const lap = gray[i - 1] + gray[i + 1] + gray[i - width] + gray[i + width] - 4 * gray[i];
      sum += lap;
      sq += lap * lap;
      n++;
    }
  }
  if (!n) return 0;
  const mean = sum / n;
  return sq / n - mean * mean;
}

// Share of pixels on an edge (gradient above `threshold`). Very low = flat, very high = cluttered.
export function edgeDensity(gray, width, height, threshold = 40) {
  let edges = 0;
  let n = 0;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      const gx = gray[i + 1] - gray[i - 1];
      const gy = gray[i + width] - gray[i - width];
      if (Math.hypot(gx, gy) > threshold) edges++;
      n++;
    }
  }
  return n ? edges / n : 0;
}

// Skin-coloured pixels (YCbCr rule of thumb), as a mask
export function skinMask({ data, width, height }) {
  const mask = new Uint8Array(width * height);
  for (let i = 0, p = 0; p < mask.length; i += 4, p++) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
    const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
    mask[p] = cb >= 77 && cb <= 127 && cr >= 133 && cr <= 173 && r > 60 ? 1 : 0;
  }
  return mask;
}

// Largest connected skin region: its share of the frame and the share of its bounding box.
// A close-up face gives a large, compact region; an estimate only (skin-coloured walls also count).
export function largestRegion(mask, width, height) {
  const seen = new Uint8Array(mask.length);
  let best = { pixels: 0, box: 0, x: 0, y: 0, w: 0, h: 0 };
  const stack = [];
  for (let start = 0; start < mask.length; start++) {
    if (!mask[start] || seen[start]) continue;
    let pixels = 0;
    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;
    stack.push(start);
    seen[start] = 1;
    while (stack.length) {
      const p = stack.pop();
      const x = p % width;
      const y = (p - x) / width;
      pixels++;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      const next = [x > 0 ? p - 1 : -1, x < width - 1 ? p + 1 : -1, y > 0 ? p - width : -1, y < height - 1 ? p + width : -1];
      for (const q of next) {
        if (q >= 0 && mask[q] && !seen[q]) {
          seen[q] = 1;
          stack.push(q);
        }
      }
    }
    if (pixels > best.pixels) {
      const w = maxX - minX + 1;
      const h = maxY - minY + 1;
      best = { pixels, box: (w * h) / mask.length, x: minX / width, y: minY / height, w: w / width, h: h / height };
    }
  }
  return { ...best, share: best.pixels / mask.length };
}

// Runs every check. `source` is the original size (for resolution and aspect ratio);
// `pixels` the analysis copy (about 320 px wide).
export function analyzePixels(pixels, source) {
  const { width, height } = pixels;
  const gray = toGray(pixels);
  const { mean, contrast } = luminanceStats(gray);
  const small = downscale(pixels, 168, 94); // size of a thumbnail in the YouTube sidebar
  const smallGray = toGray(small);
  const smallContrast = luminanceStats(smallGray).contrast;
  const strongEdgesSmall = edgeDensity(smallGray, small.width, small.height, 90);
  const grid = downscale(pixels, 80, 45);
  const face = largestRegion(skinMask(grid), grid.width, grid.height);

  return {
    resolution: { width: source.width, height: source.height },
    aspect: source.width / source.height,
    brightness: mean,
    contrast,
    colorfulness: colorfulness(pixels),
    sharpness: sharpness(gray, width, height),
    clutter: edgeDensity(gray, width, height),
    smallContrast,
    strongEdgesSmall,
    face
  };
}

// Weights of the local checks in the local score (they add up to 1)
const WEIGHTS = {
  resolution: 0.1,
  aspect: 0.1,
  brightness: 0.1,
  contrast: 0.17,
  color: 0.13,
  sharpness: 0.12,
  clutter: 0.1,
  smallSize: 0.1,
  face: 0.08
};

const status = (score) => (score >= 75 ? 'good' : score >= 45 ? 'warn' : 'bad');

// Turns the metrics into scored checks (0-100 each) and a weighted local score.
// Each check has an id that the UI translates ("lab.checks.<id>") and a value to show.
export function scoreMetrics(m) {
  const pixels = m.resolution.width * m.resolution.height;
  const checks = [
    { id: 'resolution', score: ramp(pixels, 320 * 180, 1280 * 720), value: `${m.resolution.width}×${m.resolution.height}` },
    { id: 'aspect', score: ramp(-Math.abs(m.aspect - 16 / 9), -0.25, -0.02), value: m.aspect.toFixed(2) },
    { id: 'brightness', score: band(m.brightness, 25, 70, 185, 235), value: Math.round(m.brightness) },
    { id: 'contrast', score: ramp(m.contrast, 25, 60), value: Math.round(m.contrast) },
    { id: 'color', score: ramp(m.colorfulness, 15, 50), value: Math.round(m.colorfulness) },
    { id: 'sharpness', score: ramp(Math.log10(m.sharpness + 1), 1.6, 2.6), value: Math.round(m.sharpness) },
    { id: 'clutter', score: band(m.clutter, 0.005, 0.04, 0.22, 0.4), value: `${Math.round(m.clutter * 100)}%` },
    { id: 'smallSize', score: Math.min(ramp(m.smallContrast, 20, 50), ramp(m.strongEdgesSmall, 0.01, 0.05)), value: Math.round(m.smallContrast) },
    // A face that fills 8-45 % of the frame reads well on a phone; none found is a soft warning
    { id: 'face', score: m.face.share < 0.01 ? 40 : band(m.face.box, 0.01, 0.08, 0.45, 0.8), value: `${Math.round(m.face.box * 100)}%` }
  ].map((c) => ({ ...c, score: Math.round(c.score), status: status(c.score) }));

  const score = Math.round(checks.reduce((sum, c) => sum + c.score * WEIGHTS[c.id], 0));
  return { score, checks };
}

// Final score: the vision model counts more when it is available (it sees what pixels cannot)
export function combineScores(localScore, aiScore) {
  if (typeof aiScore !== 'number' || Number.isNaN(aiScore)) return localScore;
  return Math.round(localScore * 0.4 + clamp(aiScore) * 0.6);
}

export const scoreGrade = (score) => (score >= 85 ? 'excellent' : score >= 70 ? 'good' : score >= 50 ? 'fair' : 'weak');
