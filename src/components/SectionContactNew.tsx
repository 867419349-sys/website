import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { sounds } from '../utils/audio';

/* Figma Frame 50: 5106×2342 */
const FW = 5106;
const FH = 2342;
const pct = (v: number, base: number) => `${((v / base) * 100).toFixed(3)}%`;
const A = '/assets/contact-page';

interface Img { file: string; x: number; y: number; iw: number; ih: number }

const BG_IMGS: Img[] = [
  { file: 'conntact装饰.png', x: 537, y: 319, iw: 548, ih: 190 },
  { file: 'Contact Me.png', x: 507, y: 803, iw: 1356, ih: 191 },
  { file: '联系方式.png', x: 525, y: 532, iw: 1426, ih: 349 },
  { file: '我是AI体验设计师，如果你也在探索 AI 如何进入真实产品体验，欢迎和我交流！.png', x: 547, y: 1054, iw: 1321, ih: 145 },
];

const HOVER_IMGS: Img[] = [
  { file: '邮箱icon.png', x: 553, y: 1368, iw: 131, ih: 131 },
  { file: '邮箱.png', x: 696, y: 1365, iw: 960, ih: 146 },
  { file: '电话icon.png', x: 553, y: 1535, iw: 131, ih: 131 },
  { file: '电话.png', x: 696, y: 1536, iw: 960, ih: 141 },
  { file: '微信icon.png', x: 553, y: 1702, iw: 131, ih: 131 },
  { file: '微信.png', x: 696, y: 1702, iw: 960, ih: 166 },
  { file: '查看完整作品集.png', x: 547, y: 1943, iw: 770, ih: 193 },
];

const COPY_ITEMS = [
  { label: '邮箱', value: '867419349@qq.com', x: 1660, y: 1368, size: 131 },
  { label: '电话', value: '18038344629', x: 1660, y: 1535, size: 131 },
  { label: '微信', value: 'abc18038344629', x: 1660, y: 1702, size: 131 },
];

const cardDrag = {
  drag: true,
  dragMomentum: true,
  dragElastic: 0.15,
  dragTransition: { power: 0.3, timeConstant: 200 },
  whileDrag: { scale: 1.03, cursor: 'grabbing' as const, zIndex: 10 },
  style: { cursor: 'grab' } as React.CSSProperties,
};

export default function SectionContactNew() {
  const sectionRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (label: string, value: string) => {
    sounds.playChime();
    navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <section ref={sectionRef} className="relative w-full overflow-hidden bg-white">
      <div className="relative w-full overflow-visible" style={{ aspectRatio: `${FW} / ${FH}` }}>

        {/* 背景 */}
        <img src={`${A}/背景.png`} alt="" className="absolute" draggable={false}
          style={{
            left: pct(0, FW), top: pct(3, FH),
            width: pct(5106, FW), height: pct(2339, FH),
            zIndex: 1,
          }} />

        {/* 人物卡片 - 可拖拽 */}
        <motion.img src={`${A}/人物卡片.png`} alt="" className="absolute"
          {...cardDrag}
          style={{
            left: pct(365, FW), top: pct(25, FH),
            width: pct(4223, FW), height: pct(2317, FH),
            zIndex: 2, cursor: 'grab',
          }}
        />

        {/* 二维码卡片 - 可拖拽 */}
        <motion.img src={`${A}/二维码卡片.png`} alt="" className="absolute"
          {...cardDrag}
          style={{
            left: pct(630, FW), top: pct(0, FH),
            width: pct(4221, FW), height: pct(2342, FH),
            zIndex: 2, cursor: 'grab',
          }}
        />

        {/* 静态前景 */}
        {BG_IMGS.map((img, i) => (
          <img key={`s-${i}`} src={`${A}/${img.file}`} alt="" className="absolute" draggable={false}
            style={{
              left: pct(img.x, FW), top: pct(img.y, FH),
              width: pct(img.iw, FW), height: pct(img.ih, FH),
              zIndex: 3,
            }} />
        ))}

        {/* 邮箱/电话/微信/按钮 - hover 上浮动效 */}
        {HOVER_IMGS.map((img, i) => (
          <motion.img key={`h-${i}`} src={`${A}/${img.file}`} alt="" className="absolute" draggable={false}
            whileHover={{ y: -4, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{
              left: pct(img.x, FW), top: pct(img.y, FH),
              width: pct(img.iw, FW), height: pct(img.ih, FH),
              zIndex: 3, cursor: 'pointer', opacity: 0.7,
            }}
          />
        ))}

        {/* 复制圆点 - 邮箱/电话/微信 */}
        {COPY_ITEMS.map((item) => {
          const isCopied = copied === item.label;
          return (
            <motion.div key={item.label} className="absolute rounded-full"
              whileHover={{ scale: 1.15 }}
              onClick={() => handleCopy(item.label, item.value)}
              style={{
                left: pct(item.x + item.size * 0.15, FW), top: pct(item.y + item.size * 0.15, FH),
                width: pct(item.size * 0.7, FW), height: pct(item.size * 0.7, FH),
                zIndex: 4, cursor: 'pointer',
                backgroundColor: isCopied ? '#22c55e' : '#000',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <span style={{
                color: '#fff',
                fontSize: pct(28, FW),
                fontWeight: 900,
                fontFamily: 'monospace',
                lineHeight: 1,
              }}>
                {isCopied ? '✓' : 'COPY'}
              </span>
            </motion.div>
          );
        })}

        {/* 联系我合作按钮 - hover + 点击弹窗 */}
        <motion.img src={`${A}/联系我合作.png`} alt="" className="absolute" draggable={false}
          whileHover={{ y: -4, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          onClick={() => { sounds.playChime(); alert('💌 期待您的合作提案\n\n杨芷琳 / 智能座舱 AIGC 设计与 3D 概念设计师\n上海·中国\n867419349@qq.com'); }}
          style={{
            left: pct(1372, FW), top: pct(1943, FH),
            width: pct(770, FW), height: pct(193, FH),
            zIndex: 3, cursor: 'pointer', opacity: 0.7,
          }}
        />

      </div>
    </section>
  );
}
