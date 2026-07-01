import { execSync } from 'child_process';
const files = ['base-plate.png', 'name-text.png', 'name-text-ref.png', 'bottom-bg.png', 'homepage-ref.png', 'stroke-ref.png'];
files.forEach(f => {
  const p = `public/assets/home/${f}`;
  const cmd = `powershell -NoProfile -Command "[System.Drawing.Image]::FromFile('${p}') | Select-Object Width,Height | Format-List"`;
  const r = execSync(cmd, { encoding: 'utf8' });
  console.log(f, '->', r.trim().replace(/\r?\n/g, ' '));
});
