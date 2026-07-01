import { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring, animate } from 'motion/react';

const CARD_IMAGES = [
  '/assets/design-thinking/AI-selection.png',
  '/assets/design-thinking/AI-ui.png',
  '/assets/design-thinking/AI-operation.png',
  '/assets/design-thinking/AI-works.png',
  '/assets/design-thinking/AI-gain.png',
  '/assets/design-thinking/AI-operation-1.png',
  '/assets/design-thinking/AI-gesture.png',
  '/assets/design-thinking/AI-design-system.png',
];

/* 椭圆轨道参数 — 相对于容器的百分比（匹配 Figma 圆圈中心 51%, 58%） */
const ORBIT_CX = 51;   // 轨道中心 X %
const ORBIT_CY = 58;   // 轨道中心 Y %
const ORBIT_RX = 35;   // 水平半径 %
const ORBIT_RY = 25;   // 垂直半径 %
const DURATION = 50;   // 一圈秒数
const ITEM_W = 14;     // 卡片宽度 %
const ITEM_H = 30;     // 卡片高度 %

function OrbitCard({
  src,
  alt,
  index,
  total,
  paused,
  onHover,
}: {
  src: string;
  alt: string;
  index: number;
  total: number;
  paused: boolean;
  onHover: (v: boolean) => void;
}) {
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
      const cs = animate(hoverScale, 1.15, {
        type: 'spring', stiffness: 300, damping: 20,
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
    (a) => `${ORBIT_CX + ORBIT_RX * Math.cos(a + phase)}%`,
  );
  const top = useTransform(
    angle,
    (a) => `${ORBIT_CY + ORBIT_RY * Math.sin(a + phase)}%`,
  );

  /* 深度透视：sin 值越大越靠近观众，卡片越大越亮 */
  const depthScale = useTransform(
    angle,
    (a) => 0.85 + 0.2 * Math.sin(a + phase),
  );
  const scale = useTransform(
    [depthScale, hoverScale] as const,
    ([ds, hs]) => ds * hs,
  );
  const depthOpacity = useTransform(
    angle,
    (a) => 0.45 + 0.55 * ((Math.sin(a + phase) + 1) / 2),
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
      className="absolute overflow-hidden cursor-pointer"
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
      }}
      onMouseOver={() => { setHovered(true); onHover(true); }}
      onMouseOut={() => { setHovered(false); onHover(false); }}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        draggable={false}
      />
    </motion.div>
  );
}

export default function SectionDesignOps() {
  const sectionRef = useRef<HTMLElement>(null);
  const [paused, setPaused] = useState(false);
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

  return (
    <section
      ref={sectionRef}
      className="relative w-full text-white overflow-hidden"
      style={{ background: '#03020c' }}
    >
      {/* 按 Figma 4500:2453 比例缩放 */}
      <div className="relative w-full overflow-visible" style={{ aspectRatio: '4500 / 2453' }}>

        {/* 圆圈 - 对齐卡片轨道 (中心 51%,58% Rx=35% Ry=25%) */}
        <div
          className="absolute flex items-center justify-center pointer-events-none"
          style={{
            left: `${ORBIT_CX - ORBIT_RX}%`,
            top: `${ORBIT_CY - ORBIT_RY}%`,
            width: `${ORBIT_RX * 2}%`,
            height: `${ORBIT_RY * 2}%`,
          }}
        >
          <img
            src="/assets/design-thinking/circle.png"
            alt=""
            className="w-full h-full object-contain"
            draggable={false}
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
            src="/assets/design-thinking/design-thinking-font.png"
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
              rotateX: 55,
              rotateY: 8,
            }}
          >
            {CARD_IMAGES.map((src, i) => (
              <OrbitCard
                key={src}
                src={src}
                alt={`卡片 ${i + 1}`}
                index={i}
                total={CARD_IMAGES.length}
                paused={paused}
                onHover={handleHover}
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
    </section>
  );
}
