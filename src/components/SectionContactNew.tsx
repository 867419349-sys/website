import { useRef, useState, useLayoutEffect } from 'react';
import { motion, useMotionValue } from 'motion/react';
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

/* 悬挂工牌钟摆（拖拽驱动）：默认静止，鼠标拖动卡片时，带子+卡片作为一个刚体、
   以带子最顶端为同一固定支点整体跟手旋转；松手后按单摆物理方程惯性摆动、衰减回静止。
   支点(带子顶端中心)在运行时实测，并换算成卡片盒内的比例作为卡片 transformOrigin，
   确保卡片与带子绕完全相同的世界点旋转、始终连在一起。位置静止时不变。*/
function usePendulumDrag() {
  const swing = useMotionValue(0);
  const cardRef = useRef<HTMLImageElement>(null);
  const strapRef = useRef<HTMLImageElement>(null);
  const frac = useRef({ fx: 0.5, fy: 0 });
  const [origin, setOrigin] = useState('50% 0%');
  const st = useRef({ dragging: false, ax: 0, ay: 0, lastA: 0, lastT: 0, vel: 0, raf: 0 });

  // 实测带子顶端中心(真实支点)，换算成卡片盒内比例；仅在静止(swing≈0)时测量才准确
  useLayoutEffect(() => {
    const measure = () => {
      const card = cardRef.current, strap = strapRef.current;
      if (!card || !strap || Math.abs(swing.get()) > 0.5) return;
      const c = card.getBoundingClientRect();
      const s = strap.getBoundingClientRect();
      if (!c.width || !s.width) return;
      const anchorX = s.left + s.width / 2;
      const anchorY = s.top;
      const fx = (anchorX - c.left) / c.width;
      const fy = (anchorY - c.top) / c.height;
      frac.current = { fx, fy };
      setOrigin(`${(fx * 100).toFixed(3)}% ${(fy * 100).toFixed(3)}%`);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [swing]);

  const onPointerDown = (e: React.PointerEvent) => {
    const card = cardRef.current;
    if (!card) return;
    cancelAnimationFrame(st.current.raf);
    // 支点视口坐标 = 卡片盒内比例点（与卡片 transformOrigin 完全一致，静止时 rect 准确）
    const r = card.getBoundingClientRect();
    const ax = r.left + r.width * frac.current.fx;
    const ay = r.top + r.height * frac.current.fy;
    const deg = -Math.atan2(e.clientX - ax, Math.max(1, e.clientY - ay)) * (180 / Math.PI);
    st.current = { dragging: true, ax, ay, lastA: deg, lastT: performance.now(), vel: 0, raf: 0 };
    swing.set(deg);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const s = st.current;
    if (!s.dragging) return;
    let deg = -Math.atan2(e.clientX - s.ax, Math.max(1, e.clientY - s.ay)) * (180 / Math.PI);
    deg = Math.max(-75, Math.min(75, deg));
    const now = performance.now();
    const dt = (now - s.lastT) / 1000;
    if (dt > 0) s.vel = (deg - s.lastA) / dt;   // 记录角速度(度/秒)，作松手初速度
    s.lastA = deg;
    s.lastT = now;
    swing.set(deg);
  };
  const onPointerUp = () => {
    const s = st.current;
    if (!s.dragging) return;
    s.dragging = false;
    // 从当前角度+角速度开始单摆物理衰减：端点减速、中段加速，摆几下自然停下
    let angle = swing.get();
    let vel = s.vel;
    const K = 12, damping = 1.8, DEG = 180 / Math.PI;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.032, (now - last) / 1000);
      last = now;
      const acc = -K * Math.sin(angle / DEG) * DEG - damping * vel;
      vel += acc * dt;
      angle += vel * dt;
      swing.set(angle);
      if (Math.abs(angle) < 0.15 && Math.abs(vel) < 1) { swing.set(0); return; }
      s.raf = requestAnimationFrame(loop);
    };
    s.raf = requestAnimationFrame(loop);
  };
  return { swing, cardRef, strapRef, origin, onPointerDown, onPointerMove, onPointerUp };
}

export default function SectionContactNew() {
  const sectionRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (label: string, value: string) => {
    sounds.playChime();
    navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  // 两张悬挂工牌：带子+卡片一体，默认静止，拖动卡片才绕带子顶端钟摆（松手惯性回落）
  const person = usePendulumDrag();
  const qr = usePendulumDrag();

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

        {/* 人物卡片 - 拖动才动，带子+卡片一体绕带子顶端钟摆，松手惯性回落 */}
        <div className="absolute" style={{
          left: pct(2312, FW), top: pct(444, FH),
          width: pct(1082, FW), height: pct(1622, FH),
          zIndex: 2, pointerEvents: 'auto',
        }}>
          <motion.img ref={person.cardRef} src={`${A}/人物卡片.png`} alt="" className="absolute" draggable={false}
            onPointerDown={person.onPointerDown}
            onPointerMove={person.onPointerMove}
            onPointerUp={person.onPointerUp}
            style={{
              left: 0, top: 0,
              width: '100%', height: '100%',
              rotate: person.swing,
              transformOrigin: person.origin,
              cursor: 'grab', touchAction: 'none',
              willChange: 'transform',
            }}
          />
        </div>

        {/* 人物带子 - 与卡片一体，绕带子顶端同步旋转 */}
        <motion.img ref={person.strapRef} src={`${A}/人物带子.png`} alt="" className="absolute" draggable={false}
          style={{
            left: pct(2586, FW), top: pct(-64, FH),
            width: pct(478, FW), height: pct(734, FH),
            zIndex: 2, pointerEvents: 'none',
            rotate: person.swing,
            transformOrigin: '50% 0%', willChange: 'transform',
          }} />

        {/* 二维码卡片 - 拖动才动，带子+卡片一体绕带子顶端钟摆，松手惯性回落 */}
        <div className="absolute" style={{
          left: pct(3444, FW), top: pct(720, FH),
          width: pct(1087, FW), height: pct(1610, FH),
          zIndex: 2, pointerEvents: 'auto',
        }}>
          <motion.img ref={qr.cardRef} src={`${A}/二维码卡片.png`} alt="" className="absolute" draggable={false}
            onPointerDown={qr.onPointerDown}
            onPointerMove={qr.onPointerMove}
            onPointerUp={qr.onPointerUp}
            style={{
              left: 0, top: 0,
              width: '100%', height: '100%',
              rotate: qr.swing,
              transformOrigin: qr.origin,
              cursor: 'grab', touchAction: 'none',
              willChange: 'transform',
            }}
          />
        </div>

        {/* 二维码带子 - 与卡片一体，绕带子顶端同步旋转 */}
        <motion.img ref={qr.strapRef} src={`${A}/二维码带子.png`} alt="" className="absolute" draggable={false}
          style={{
            left: pct(3680, FW), top: pct(0, FH),
            width: pct(478, FW), height: pct(976, FH),
            zIndex: 2, pointerEvents: 'none',
            rotate: qr.swing,
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
