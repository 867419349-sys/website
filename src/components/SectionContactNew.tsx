import { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
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

const cardBase: React.CSSProperties = {
  cursor: 'grab',
  transformStyle: 'preserve-3d',
  willChange: 'transform',
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

  // 二维码卡片拖拽位移（与带子共享）：卡片自由拖，带子头部固定、尾部跟随、中段拉伸
  const qrX = useMotionValue(0);
  const qrY = useMotionValue(0);
  const strapImgRef = useRef<HTMLImageElement>(null);
  const strapLenRef = useRef(360); // 带子渲染高度(px)，运行时测量
  // 带子以弹簧跟随卡片，产生柔性甩动手感
  const fx = useSpring(qrX, { stiffness: 240, damping: 24, mass: 0.7 });
  const fy = useSpring(qrY, { stiffness: 240, damping: 24, mass: 0.7 });
  const strapRotate = useTransform([fx, fy], (v: number[]) => {
    const L = strapLenRef.current, x = v[0], y = Math.max(-L * 0.6, v[1]);
    return -Math.atan2(x, L + y) * (180 / Math.PI);
  });
  const strapScaleY = useTransform([fx, fy], (v: number[]) => {
    const L = strapLenRef.current, x = v[0], y = Math.max(-L * 0.6, v[1]);
    return Math.max(0.4, Math.hypot(x, L + y) / L);
  });
  // 卡片拖拽时轻微倾斜，增强悬挂摆动感
  const cardTilt = useTransform(qrX, (x) => Math.max(-9, Math.min(9, x * 0.03)));

  useEffect(() => {
    const el = strapImgRef.current;
    if (!el) return;
    const measure = () => { if (el.offsetHeight) strapLenRef.current = el.offsetHeight; };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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

        {/* 人物卡片 - 3D 透视倾斜 + 拖拽 */}
        <div className="absolute" style={{
          left: pct(365, FW), top: pct(25, FH),
          width: pct(4223, FW), height: pct(2317, FH),
          zIndex: 2, perspective: 1200,
          pointerEvents: 'auto',
        }}>
          <motion.img src={`${A}/人物卡片.png`} alt="" className="absolute"
            drag dragMomentum dragElastic={0.15}
            dragTransition={{ power: 0.3, timeConstant: 200 }}
            whileHover={{ rotateX: -8, rotateY: 3, y: -12, scale: 1.02 }}
            whileDrag={{ scale: 1.03, cursor: 'grabbing' as const, zIndex: 10 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            style={{
              left: 0, top: 0,
              width: '100%', height: '100%',
              cursor: 'grab', transformOrigin: 'center bottom',
              ...cardBase,
            }}
          />
        </div>

        {/* 二维码卡片 - 拖拽后弹回原位（钟摆回落），带子跟随 */}
        <div className="absolute" style={{
          left: pct(3444, FW), top: pct(720, FH),
          width: pct(1087, FW), height: pct(1610, FH),
          zIndex: 2, perspective: 1400,
          pointerEvents: 'auto',
        }}>
          <motion.img src={`${A}/二维码卡片.png`} alt="" className="absolute"
            drag dragElastic={0.6} dragSnapToOrigin
            whileHover={{ scale: 1.015 }}
            whileDrag={{ cursor: 'grabbing' as const, zIndex: 10 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
            style={{
              left: 0, top: 0,
              width: '100%', height: '100%',
              x: qrX, y: qrY, rotateZ: cardTilt,
              cursor: 'grab', transformOrigin: 'center top',
              ...cardBase,
            }}
          />
        </div>

        {/* 二维码带子 - 头部固定，尾部随卡片旋转+拉伸 */}
        <motion.img ref={strapImgRef} src={`${A}/二维码带子.png`} alt="" className="absolute" draggable={false}
          style={{
            left: pct(3680, FW), top: pct(0, FH),
            width: pct(478, FW), height: pct(976, FH),
            zIndex: 2, pointerEvents: 'none',
            rotate: strapRotate, scaleY: strapScaleY,
            transformOrigin: '50% 0%', willChange: 'transform',
          }} />

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
