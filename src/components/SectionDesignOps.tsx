import { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring, animate } from 'motion/react';
import { sounds } from '../utils/audio';

const CARD_IMAGES = [
  '/assets/design-thinking/AI-selection.webp',
  '/assets/design-thinking/AI-ui.webp',
  '/assets/design-thinking/AI-operation.webp',
  '/assets/design-thinking/AI-gain.webp',
  '/assets/design-thinking/AI-operation-1.webp',
  '/assets/design-thinking/AI-gesture.webp',
  '/assets/design-thinking/AI-design-system.webp',
];

/* 卡片缩略图 → 点击弹出的详情大图 */
const POPUP_MAP: Record<string, string> = {
  '/assets/design-thinking/AI-selection.webp': '/assets/design-thinking/content/设计风格提取内容.png',
  '/assets/design-thinking/AI-gain.webp': '/assets/design-thinking/content/01.webp',        // 增益
  '/assets/design-thinking/AI-operation-1.webp': '/assets/design-thinking/content/02.webp',  // 运营-1
  '/assets/design-thinking/AI-design-system.webp': '/assets/design-thinking/content/03.webp',// 设计系统
  '/assets/design-thinking/AI-gesture.webp': '/assets/design-thinking/content/04.webp',      // 手势
  '/assets/design-thinking/AI-operation.webp': '/assets/design-thinking/content/ip内容.png',    // IP
  '/assets/design-thinking/AI-ui.webp': '/assets/design-thinking/content/宠物IP内容.png',            // UI设计
};

/* 椭圆轨道参数 — 中心对齐 Figma 圆圈，半径匹配 Figma 卡片分布范围 */
const ORBIT_CX = 54;       // 轨道中心 X %
const ORBIT_CY = 45;       // 轨道中心 Y %
const ORBIT_RX = 34;      // 水平半径 %（Figma 卡片 X: 17~79%, 轨道 12~80%）
const ORBIT_RY = 16;      // 垂直半径 %（Figma 卡片 Y: 34~74%, 轨道 38~70%）
const DURATION = 50;      // 一圈秒数
const ITEM_W = 16;        // 卡片宽度 %
const ITEM_H = 38;        // 卡片高度 %
const TILT = -9;          // 轨道倾斜角 °（Figma 圆圈 rotate）

function OrbitCard({
  src,
  alt,
  index,
  total,
  paused,
  onHover,
  onOpen,
}: {
  src: string;
  alt: string;
  index: number;
  total: number;
  paused: boolean;
  onHover: (v: boolean) => void;
  onOpen: (popupSrc: string) => void;
}) {
  const popupSrc = POPUP_MAP[src];
  const rawAngle = useMotionValue(0);
  const angle = useSpring(rawAngle, { stiffness: 100, damping: 16, mass: 0.2 });
  const phase = (index / total) * Math.PI * 2;
  const [hovered, setHovered] = useState(false);
  const hoveredRef = useRef(false);

  /* 悬停放大 + 提亮弹簧 */
  const hoverScale = useMotionValue(1);
  const hoverValue = useMotionValue(0);
  useEffect(() => {
    if (hovered) {
      const cs = animate(hoverScale, [1.04, 1.08, 1.04], {
        duration: 2.5,
        ease: 'easeInOut',
        repeat: Infinity,
      });
      const cv = animate(hoverValue, 1, {
        type: 'spring', stiffness: 300, damping: 20,
      });
      return () => { cs.stop(); cv.stop(); };
    }
    const cs = animate(hoverScale, 1, {
      type: 'spring', stiffness: 300, damping: 20,
    });
    const cv = animate(hoverValue, 0, {
      type: 'spring', stiffness: 300, damping: 20,
    });
    return () => { cs.stop(); cv.stop(); };
  }, [hovered, hoverScale, hoverValue]);

  useEffect(() => {
    if (paused) {
      // 平滑减速停止：用 easeOut 在 0.4s 内自然停下
      const current = rawAngle.get();
      const controls = animate(rawAngle, current + 0.015, {
        duration: 0.4,
        ease: 'easeOut',
      });
      return () => controls.stop();
    }
    // 连续递增避免 wrap-around 跳跃导致弹簧回弹
    const start = rawAngle.get();
    const controls = animate(rawAngle, start + Math.PI * 2 * 100, {
      duration: DURATION * 100,
      ease: 'linear',
    });
    return () => controls.stop();
  }, [paused, rawAngle]);

  const left = useTransform(
    angle,
    (a) => {
      const xo = ORBIT_RX * Math.cos(a + phase);
      const yo = ORBIT_RY * Math.sin(a + phase);
      const rad = TILT * Math.PI / 180;
      return `${ORBIT_CX + xo * Math.cos(rad) - yo * Math.sin(rad)}%`;
    },
  );
  const top = useTransform(
    angle,
    (a) => {
      const xo = ORBIT_RX * Math.cos(a + phase);
      const yo = ORBIT_RY * Math.sin(a + phase);
      const rad = TILT * Math.PI / 180;
      return `${ORBIT_CY + xo * Math.sin(rad) + yo * Math.cos(rad)}%`;
    },
  );

  /* 深度透视：sin 值越大越靠近观众，卡片越大越亮 */
  const depthScale = useTransform(
    angle,
    (a) => 0.9 + 0.1 * Math.sin(a + phase),
  );
  const scale = useTransform(
    [depthScale, hoverScale] as const,
    ([ds, hs]) => ds * hs,
  );
  const depthOpacity = useTransform(
    angle,
    (a) => 0.6 + 0.4 * ((Math.sin(a + phase) + 1) / 2),
  );
  const opacity = useTransform(
    [depthOpacity, hoverValue] as const,
    ([d, h]) => d + (1 - d) * h,
  );

  /* z-index 按深度排序，悬停时强制置顶 */
  const zIndex = useMotionValue(0);
  useEffect(() => {
    const onAngle = (a: number) => {
      if (hoveredRef.current) return;
      zIndex.set(Math.round(4 + 4 * Math.sin(a + phase)));
    };
    onAngle(angle.get());
    const unsub = angle.on('change', onAngle);
    return unsub;
  }, [angle, phase]);
  useEffect(() => {
    if (hovered) {
      hoveredRef.current = true;
      zIndex.set(10);
    } else {
      hoveredRef.current = false;
      zIndex.set(Math.round(4 + 4 * Math.sin(angle.get() + phase)));
    }
  }, [hovered, angle, phase]);

  return (
    <motion.div
      className="absolute"
      style={{
        left,
        top,
        scale,
        opacity,
        width: `${ITEM_W}%`,
        height: `${ITEM_H}%`,
        x: '-50%',
        y: '-50%',
        zIndex,
        cursor: popupSrc ? 'pointer' : 'default',
      }}
      onMouseOver={() => { setHovered(true); onHover(true); sounds.playHoverDesign(); }}
      onMouseOut={() => { setHovered(false); onHover(false); }}
      onClick={() => {
        if (!popupSrc) return;
        if (popupSrc.startsWith('download:')) {
          sounds.playChime();
          const path = popupSrc.replace('download:', '');
          if (confirm('是否要下载 AIGC 工具分享 PPT？')) {
            window.open(path, '_blank');
          }
        } else {
          sounds.playPop();
          onOpen(popupSrc);  // openPopup -> setPopup + reset imgLoaded
        }
      }}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-contain"
        draggable={false}
      />
    </motion.div>
  );
}

export default function SectionDesignOps() {
  const sectionRef = useRef<HTMLElement>(null);
  const [paused, setPaused] = useState(false);
  const [popup, setPopup] = useState<string | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  /* 弹窗打开时重置加载状态 */
  const openPopup = (src: string) => { setImgLoaded(false); setPopup(src); };
  const closePopup = () => { setPopup(null); setImgLoaded(false); };

  /* 预加载弹窗大图：组件挂载时就开始加载，点击时直接显示 */
  useEffect(() => {
    const imgs = Object.values(POPUP_MAP);
    imgs.forEach(src => { const img = new Image(); img.src = src; });
  }, []);

  const hoverCount = useRef(0);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleHover = (enter: boolean) => {
    if (enter) {
      hoverCount.current += 1;
      if (resumeTimer.current) { clearTimeout(resumeTimer.current); resumeTimer.current = null; }
      setPaused(true);
    } else {
      hoverCount.current -= 1;
      if (hoverCount.current <= 0) {
        hoverCount.current = 0;
        resumeTimer.current = setTimeout(() => setPaused(false), 80);
      }
    }
  };

  // 弹窗打开时锁定滚动 + Esc 关闭
  useEffect(() => {
    if (!popup) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closePopup(); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [popup]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full text-white overflow-x-hidden"
      style={{ background: '#03020c', paddingTop: 'clamp(24px, 5vw, 80px)' }}
    >
      {/* 按 Figma 4500:2453 比例缩放 */}
      <div className="relative w-full overflow-visible" style={{ aspectRatio: '4500 / 2453' }}>

        {/* 圆圈 — Figma 坐标: left=103(2.29%) top=685.32(27.94%) w=3957(87.93%) h=1298.76(52.95%) */}
        <div
          className="absolute flex items-center justify-center pointer-events-none"
          style={{
            left: '16%',
            top: '29%',
            width: '72%',
            height: '36%',
          }}
        >
          <img
            src="/assets/design-thinking/circle.webp"
            alt=""
            className="w-full h-full object-contain opacity-30"
            draggable={false}
            style={{ transform: `rotate(${TILT}deg)`, objectFit: 'fill' }}
          />
        </div>

        {/* 标题图 */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: '0%',
            top: '-4.85%',
            width: '29.69%',
            height: '37.87%',
            overflow: 'hidden',
          }}
        >
          <img
            src="/assets/design-thinking/design-thinking-font.webp"
            alt="设计碎片与思考"
            className="w-full h-full object-contain object-left"
            draggable={false}
          />
        </div>

        {/* 8 张卡片 — 3D 椭圆轨道旋转 */}
        <div
          className="absolute inset-0"
          style={{ perspective: '1000px' }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              transformStyle: 'preserve-3d',
              rotateX: 45,
              rotateY: 5,
            }}
          >
            {CARD_IMAGES.map((src, i) => (
              <OrbitCard
                key={src}
                src={src}
                alt={`卡片 ${i + 1}`}
                index={i}
                total={CARD_IMAGES.length}
                paused={paused || !!popup}
                onHover={handleHover}
                onOpen={openPopup}
              />
            ))}
          </div>
        </div>

      </div>

      {/* 底部滚动字条 */}
      <div className="relative z-10 w-full border-t border-white/[0.04] py-3 overflow-hidden select-none">
        <div className="flex font-mono text-[9px] font-black tracking-[0.25em] uppercase text-white/20">
          <div className="flex gap-12 whitespace-nowrap animate-marquee">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="flex items-center gap-12">
                <span>Design Thinking</span>
                <span className="text-[#9e55e4]">◆</span>
                <span>Structured Prompts</span>
                <span className="text-[#7644c4]">◆</span>
                <span>ComfyUI Pipeline</span>
                <span className="text-[#9e55e4]">◆</span>
                <span>LoRA Fine-Tuning</span>
                <span className="text-[#7644c4]">◆</span>
                <span>AI Asset Delivery</span>
              </span>
            ))}
          </div>
        </div>
      </div>
      {/* 卡片详情弹窗 — Portal 到 body，避免被带 filter 的祖先容器困住 */}
      {createPortal(
        <AnimatePresence>
          {popup && (
            <motion.div
              className="fixed inset-0 z-[100] overflow-y-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ background: 'rgba(3,2,12,0.82)', backdropFilter: 'blur(6px)', perspective: 1600 }}
              onClick={closePopup}
            >
              <div className="min-h-full flex items-start justify-center px-4 py-8 md:py-14">
                {/* 加载旋转指示器 */}
                {!imgLoaded && (
                  <div className="flex items-center justify-center" style={{ width: 'min(94vw,1040px)', minHeight: 300 }}>
                    <div className="w-10 h-10 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  </div>
                )}
                <motion.img
                  src={popup}
                  alt="项目详情"
                  draggable={false}
                  initial={{ scale: 0.9, opacity: 0, rotateX: -12, y: 24 }}
                  animate={imgLoaded ? { scale: 1, opacity: 1, rotateX: 0, y: 0 } : {}}
                  exit={{ scale: 0.92, opacity: 0, y: 12 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 22 }}
                  onLoad={() => setImgLoaded(true)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-[min(94vw,1040px)] h-auto rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
                  style={{ cursor: 'default', display: imgLoaded ? 'block' : 'none' }}
                />
              </div>
              <button
                onClick={closePopup}
                className="fixed top-5 right-6 z-[101] w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xl font-light flex items-center justify-center transition-colors"
                aria-label="关闭"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

    </section>
  );
}
