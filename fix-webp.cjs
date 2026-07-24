const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

let count = 0;

async function walkAndConvert(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkAndConvert(full);
    } else if (/\.png$/i.test(entry.name)) {
      const webpPath = full.replace(/\.png$/i, '.webp');
      if (fs.existsSync(webpPath)) continue; // 已有 webp
      try {
        await sharp(full).webp({ quality: 85 }).toFile(webpPath);
        count++;
      } catch (e) {
        console.error(`  失败: ${path.relative(assetsDir, full)}: ${e.message}`);
      }
    }
  }
}

const assetsDir = path.join(__dirname, 'public', 'assets');

(async () => {
  console.log('扫描并补转缺失的 WebP...\n');
  await walkAndConvert(assetsDir);
  console.log(`\n补转了 ${count} 个文件`);
})();
