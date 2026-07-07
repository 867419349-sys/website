import { useRef } from 'react';

/* Figma Frame 50: 5106×2342 */
const FW = 5106;
const FH = 2342;
const pct = (v: number, base: number) => `${((v / base) * 100).toFixed(3)}%`;
const A = '/assets/contact-page';

interface Img { file: string; x: number; y: number; iw: number; ih: number }
const IMGS: Img[] = [
  { file: '背景.png', x: 0, y: 3, iw: 5106, ih: 2339 },
  { file: '人物卡片.png', x: 365, y: 25, iw: 4223, ih: 2317 },
  { file: '二维码卡片.png', x: 630, y: 0, iw: 4221, ih: 2342 },
  { file: 'conntact装饰.png', x: 537, y: 319, iw: 548, ih: 190 },
  { file: 'Contact Me.png', x: 507, y: 803, iw: 1356, ih: 191 },
  { file: '联系方式.png', x: 525, y: 532, iw: 1426, ih: 349 },
  { file: '我是AI体验设计师，如果你也在探索 AI 如何进入真实产品体验，欢迎和我交流！.png', x: 547, y: 1054, iw: 1321, ih: 145 },
  { file: '邮箱.png', x: 696, y: 1365, iw: 960, ih: 146 },
  { file: '电话.png', x: 696, y: 1536, iw: 960, ih: 141 },
  { file: '微信.png', x: 696, y: 1702, iw: 960, ih: 166 },
  { file: '邮箱icon.png', x: 553, y: 1368, iw: 131, ih: 131 },
  { file: '电话icon.png', x: 553, y: 1535, iw: 131, ih: 131 },
  { file: '微信icon.png', x: 553, y: 1702, iw: 131, ih: 131 },
  { file: '查看完整作品集.png', x: 547, y: 1943, iw: 770, ih: 193 },
  { file: '联系我合作.png', x: 1372, y: 1943, iw: 770, ih: 193 },
];

export default function SectionContactNew() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section ref={sectionRef} className="relative w-full overflow-hidden bg-white">
      <div className="relative w-full overflow-visible" style={{ aspectRatio: `${FW} / ${FH}` }}>
        {IMGS.map((img, i) => (
          <img key={i} src={`${A}/${img.file}`} alt="" className="absolute" draggable={false}
            style={{
              left: pct(img.x, FW), top: pct(img.y, FH),
              width: pct(img.iw, FW), height: pct(img.ih, FH),
            }} />
        ))}
      </div>
    </section>
  );
}
