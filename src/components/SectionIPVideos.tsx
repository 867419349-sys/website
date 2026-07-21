import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';

const FW = 4741;
const FH = 2834;
const pct = (v: number, base: number) => `${((v / base) * 100).toFixed(3)}%`;

const VIDEOS = [
  { src: '/assets/ip-page/小黄鸭.mp4', label: '小黄鸭', x: 228, y: 1110, w: 1051, h: 1401 },
  { src: '/assets/ip-page/大鹅.mp4', label: '大鹅', x: 1308, y: 1110, w: 1121, h: 1401 },
  { src: '/assets/ip-page/小狗.mp4', label: '小狗', x: 2468, y: 1110, w: 1051, h: 1401 },
  { src: '/assets/ip-page/大象.mp4', label: '大象', x: 3554, y: 1110, w: 1107, h: 1395 },
];

function VideoCard({
  vid, index, hoveredIdx, onHover,
}: {
  vid: typeof VIDEOS[0]; index: number; hoveredIdx: number | null;
  onHover: (idx: number | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);
  const prefersReduced = useReducedMotion();
  const isHovered = hoveredIdx === index;
  const isOtherHovered = hoveredIdx !== null && hoveredIdx !== index;

  // 视口懒播放
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => setInView(e.isIntersecting),
      { rootMargin: '30%' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (inView && !prefersReduced) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [inView, prefersReduced]);

  // 悬停 → 取消静音播音效，离开 → 静音
  const handleMouseEnter = () => {
    onHover(index);
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    v.currentTime = 0;
    // 浏览器可能阻止非静音自动播放，失败则回退静音继续播
    v.play().catch(() => {
      v.muted = true;
      v.play().catch(() => {});
    });
  };
  const handleMouseLeave = () => {
    onHover(null);
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    // 确保静音后继续播放
    v.play().catch(() => {});
  };

  const myCenter = vid.x + vid.w / 2;
  let xOffset = '0%';
  if (hoveredIdx !== null && !isHovered) {
    const hc = VIDEOS[hoveredIdx];
    const hoveredCenter = hc.x + hc.w / 2;
    const diff = myCenter - hoveredCenter;
    const absDist = Math.abs(diff);
    const coeff = Math.max(-0.02, 0.10 - 0.00004 * absDist);
    const shiftPx = diff * coeff;
    xOffset = `${((shiftPx / vid.w) * 100).toFixed(2)}%`;
  }

  const scale = isHovered ? 1.08 : isOtherHovered ? 0.92 : 1;

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 80 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-5%' }}
      transition={{
        default: { type: 'spring', stiffness: 300, damping: 22, mass: 0.2 },
        opacity: { duration: 0.9, delay: index * 0.12, ease: [0.25, 0.1, 0.25, 1] },
        y: { duration: 0.9, delay: index * 0.12, ease: [0.25, 0.1, 0.25, 1] },
      }}
      animate={{ scale, x: xOffset }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="absolute overflow-hidden cursor-pointer"
      style={{
        left: pct(vid.x, FW), top: pct(vid.y, FH),
        width: pct(vid.w, FW), height: pct(vid.h, FH),
        borderRadius: `${((70 / vid.w) * 100).toFixed(2)}% / ${((70 / vid.h) * 100).toFixed(2)}%`,
        willChange: 'transform',
        transformOrigin: 'center center',
      }}
    >
      <video
        ref={videoRef}
        src={vid.src}
        loop muted playsInline preload="none"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ willChange: 'transform' }}
      />
      {/* hover 渐变叠加 */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ willChange: 'opacity' }}
      />
      {/* hover 标签 */}
      <div className="absolute bottom-0 left-0 right-0 p-[4%] translate-y-3 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none">
        <span className="inline-block text-white text-[clamp(10px,1.2vw,24px)] font-bold tracking-wider uppercase bg-white/10 backdrop-blur-sm rounded-full px-[1em] py-[0.35em]">
          {vid.label}
        </span>
      </div>
    </motion.div>
  );
}

export default function SectionIPVideos() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const prefersReduced = useReducedMotion();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const bgY = useTransform(scrollYProgress, [0, 1], ['4%', '-4%']);

  return (
    <section ref={sectionRef} className="relative w-full bg-[#06051a] overflow-hidden">
      {!prefersReduced && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            y: bgY,
            background: 'radial-gradient(ellipse 55% 45% at 50% 38%, rgba(101,64,253,0.09) 0%, transparent 70%)',
            willChange: 'transform',
          }}
        />
      )}
      {prefersReduced && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 55% 45% at 50% 38%, rgba(101,64,253,0.09) 0%, transparent 70%)',
          }}
        />
      )}

      <div className="relative w-full overflow-hidden" style={{ aspectRatio: `${FW} / ${FH}` }}>
        <div className="absolute flex flex-col" style={{ left: pct(244, FW), top: pct(277, FH) }}>
          <h2
            className="font-black italic tracking-[-0.03em] leading-[1.194] bg-clip-text text-transparent bg-gradient-to-r from-[#e6c5f7] to-[#6540fd] select-none"
            style={{ fontSize: 'clamp(1.8rem, 5.91vw, 280px)' }}
          >PETS</h2>
          <h2
            className="font-black italic tracking-[-0.03em] leading-[1.194] bg-clip-text text-transparent bg-gradient-to-r from-[#e573f0] to-[#7633f3] select-none"
            style={{ fontSize: 'clamp(1.8rem, 5.91vw, 280px)' }}
          >PARADE</h2>
        </div>

        <div className="absolute select-none" style={{ left: pct(1387, FW), top: pct(638, FH) }}>
          <p
            className="font-black italic leading-[1.194]"
            style={{ fontSize: 'clamp(1.5rem, 5.91vw, 280px)', color: 'rgba(119, 59, 253, 0.8)' }}
          >IP设计</p>
        </div>

        {VIDEOS.map((vid, i) => (
          <VideoCard key={vid.label} vid={vid} index={i} hoveredIdx={hoveredIdx} onHover={setHoveredIdx} />
        ))}

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="absolute text-center font-mono tracking-[0.3em] text-white/15 uppercase select-none"
          style={{
            left: '50%', transform: 'translateX(-50%)',
            bottom: pct(60, FH), fontSize: 'clamp(8px, 0.6vw, 28px)',
          }}
          animate={{ opacity: [0.1, 0.28, 0.1] }}
          transition={{ duration: 3.5, repeat: Infinity }}
        >悬停视频卡片 · IP 角色动画展示</motion.p>
      </div>
    </section>
  );
}
