// Comprehensive template matching for all about section PNG layers
// Matches each layer PNG against the reference image

const fs = require('fs');
const zlib = require('zlib');

// ---------- PNG parser ----------
function readPNG(path) {
  const raw = fs.readFileSync(path);
  let pos = 8; // skip signature
  const chunks = {};
  let idat = Buffer.alloc(0);
  while (pos < raw.length) {
    const len = raw.readUInt32BE(pos);
    const type = raw.toString('ascii', pos + 4, pos + 8);
    const data = raw.slice(pos + 8, pos + 8 + len);
    pos += 12 + len;
    if (type === 'IHDR') { chunks.IHDR = data; }
    if (type === 'IDAT') { idat = Buffer.concat([idat, data]); }
  }
  const w = chunks.IHDR.readUInt32BE(0);
  const h = chunks.IHDR.readUInt32BE(4);
  const rawData = zlib.inflateSync(idat);
  const bpp = 4;
  const stride = w * bpp + 1;
  const pixels = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    const filter = rawData[y * stride];
    const row = rawData.slice(y * stride + 1, y * stride + stride);
    const prevRow = y > 0 ? pixels.slice((y - 1) * w * 4, y * w * 4) : null;
    for (let x = 0; x < w; x++) {
      for (let c = 0; c < 4; c++) {
        const idx = x * 4 + c;
        const a = x > 0 ? pixels.slice(y * w * 4 + (x - 1) * 4, y * w * 4 + x * 4).readUInt8(c) : 0;
        const b = prevRow ? prevRow.readUInt8(idx) : 0;
        const ab = prevRow && x > 0 ? prevRow.readUInt8((x - 1) * 4 + c) : 0;
        let val = row[idx];
        switch (filter) {
          case 0: break;
          case 1: val += a; break;
          case 2: val += b; break;
          case 3: val += Math.floor((a + b) / 2); break;
          case 4: {
            const p = a + b - ab;
            const pa = Math.abs(p - a), pb = Math.abs(p - b), pab = Math.abs(p - ab);
            val += (pa <= pb && pa <= pab) ? a : (pb <= pab) ? b : ab;
            break;
          }
        }
        pixels.writeUInt8(val & 255, y * w * 4 + idx);
      }
    }
  }
  return { w, h, pixels };
}

function samplePixel(pixels, w, x, y) {
  const idx = (y * w + x) * 4;
  return [pixels[idx], pixels[idx + 1], pixels[idx + 2], pixels[idx + 3]];
}

// ---------- Template Matching ----------
function matchTemplate(refPath, tplPath, searchZone, step = 2) {
  const ref = readPNG(refPath);
  const tpl = readPNG(tplPath);
  const { x: sx, y: sy, w: sw, h: sh } = searchZone;

  let bestScore = -1, bestX = 0, bestY = 0;
  const samples = 200;

  for (let ay = sy; ay < sy + sh - tpl.h; ay += step) {
    for (let ax = sx; ax < sx + sw - tpl.w; ax += step) {
      let score = 0;
      let count = 0;
      // Sparse sampling
      for (let i = 0; i < samples; i++) {
        const ty = Math.floor((i / 20) * tpl.h / (samples / 20));
        const tx = Math.floor((i % 20) * tpl.w / 20);
        const tAlpha = tpl.pixels[(ty * tpl.w + tx) * 4 + 3];
        if (tAlpha < 30) continue;
        const tc = samplePixel(tpl.pixels, tpl.w, tx, ty);
        const rc = samplePixel(ref.pixels, ref.w, ax + tx, ay + ty);
        const dr = tc[0] - rc[0], dg = tc[1] - rc[1], db = tc[2] - rc[2];
        score += 255 - Math.abs(dr) * 0.3 - Math.abs(dg) * 0.5 - Math.abs(db) * 0.2;
        count++;
      }
      if (count > 10 && score > bestScore) {
        bestScore = score;
        bestX = ax;
        bestY = ay;
      }
    }
  }
  return { x: bestX, y: bestY, score: bestScore };
}

// ---------- Config ----------
const REF_PATH = 'd:/网站设计/自我介绍/文字分层/参考效果.png';
const ASSETS = 'C:/Users/zhilin/Downloads/Claude code/first CC/yang-zhilin-portfolio-&-ai-sandbox/public/assets/about';
const ref = readPNG(REF_PATH);
console.log('Reference:', ref.w, 'x', ref.h);

const layers = [
  { name: 'design.png',   searchZone: { x: 0, y: 0, w: ref.w, h: 800 }, step: 4 },
  { name: 'education.png', searchZone: { x: 2400, y: 100, w: 2000, h: 500 }, step: 2 },
  { name: 'work.png',     searchZone: { x: 2400, y: 400, w: 2000, h: 700 }, step: 2 },
  { name: 'skills.png',   searchZone: { x: 2400, y: 1000, w: 600, h: 600 }, step: 2 },
  { name: 'tools.png',    searchZone: { x: 2900, y: 1000, w: 800, h: 600 }, step: 2 },
  { name: 'hello.png',    searchZone: { x: 300, y: 300, w: 800, h: 600 }, step: 2 },
  { name: 'name.png',     searchZone: { x: 600, y: 400, w: 1000, h: 500 }, step: 2 },
  { name: 'title.png',    searchZone: { x: 400, y: 700, w: 1000, h: 300 }, step: 2 },
  { name: 'ai-deco.png',  searchZone: { x: 1800, y: 400, w: 800, h: 600 }, step: 2 },
  { name: 'icon-edu.png', searchZone: { x: 2400, y: 150, w: 800, h: 400 }, step: 1 },
  { name: 'icon-work.png',searchZone: { x: 2400, y: 500, w: 800, h: 400 }, step: 1 },
  { name: 'icon-skills.png',searchZone: { x: 2400, y: 1000, w: 600, h: 400 }, step: 1 },
  { name: 'icon-tools.png',searchZone: { x: 2900, y: 1000, w: 800, h: 400 }, step: 1 },
];

for (const layer of layers) {
  const tplPath = `${ASSETS}/${layer.name}`;
  if (!fs.existsSync(tplPath)) { console.log(`MISSING: ${layer.name}`); continue; }
  const tpl = readPNG(tplPath);
  const result = matchTemplate(REF_PATH, tplPath, layer.searchZone, layer.step);
  console.log(`${layer.name} (${tpl.w}x${tpl.h}): pos=(${result.x},${result.y}), score=${result.score.toFixed(0)}`);
  console.log(`  current code: cx=${result.x}, cy=${result.y}`);
}
