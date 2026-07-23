import React, { useRef, useEffect, useCallback, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import TiltedCard from './TiltedCard';
import BentoGlow from './BentoGlow';
import GradualBlur from './GradualBlur';
import AnimatedContent from './AnimatedContent';

gsap.registerPlugin(ScrollTrigger);

/*
 * 坐标系统匹配新背景 bg.webp (4418×2066)
 * Figma 原始 frame 坐标 (display:contents 穿透)
 */
const REF_W = 4418;
const REF_H = 2066;
const RATIO = REF_W / REF_H;

const pct = (px: number, ref: number) => `${(px / ref) * 100}%`;

interface Layer {
  src: string;
  cx: string; cy: string; cw: string; ch: string;
  z: number;
  rot?: number;
  isCharacter?: boolean;
  isText?: boolean;
}

const LAYERS: Layer[] = [
  { src: '/assets/about/bg.webp',
    cx: '0%', cy: '0%', cw: '100%', ch: '100%', z: 0 },
  { src: '/assets/about/design.webp',
    cx: pct(529, REF_W), cy: pct(83, REF_H),
    cw: pct(2726, REF_W), ch: pct(1462, REF_H),
    z: 1 },
  { src: '/assets/about/character.webp',
    cx: pct(427, REF_W), cy: pct(0, REF_H),
    cw: pct(3539, REF_W), ch: pct(2066, REF_H),
    z: 2, isCharacter: true },
  { src: '/assets/about/hello.webp',
    cx: pct(586, REF_W), cy: pct(520, REF_H),
    cw: pct(485, REF_W), ch: pct(431, REF_H),
    z: 4, isText: true },
  { src: '/assets/about/name.webp',
    cx: pct(998, REF_W), cy: pct(758, REF_H),
    cw: pct(646, REF_W), ch: pct(200, REF_H),
    z: 4, isText: true },
  { src: '/assets/about/title.webp',
    cx: pct(715.5, REF_W), cy: pct(997.74, REF_H),
    cw: pct(651, REF_W), ch: pct(100, REF_H),
    z: 4 },
  { src: '/assets/about/description.webp',
    cx: pct(609, REF_W), cy: pct(1300, REF_H),
    cw: pct(728, REF_W), ch: pct(186, REF_H),
    z: 4 },
  { src: '/assets/about/ai-deco.webp',
    cx: pct(2344.61, REF_W), cy: pct(695.74, REF_H),
    cw: pct(378, REF_W), ch: pct(242, REF_H),
    z: 5 },
  { src: '/assets/about/icon-edu.webp',
    cx: pct(2820, REF_W), cy: pct(390, REF_H),
    cw: pct(104, REF_W), ch: pct(104, REF_H),
    z: 6 },
  { src: '/assets/about/icon-work.webp',
    cx: pct(2820, REF_W), cy: pct(808, REF_H),
    cw: pct(104, REF_W), ch: pct(104, REF_H),
    z: 6 },
  { src: '/assets/about/icon-skills.webp',
    cx: pct(2779, REF_W), cy: pct(1336, REF_H),
    cw: pct(104, REF_W), ch: pct(104, REF_H),
    z: 6 },
  { src: '/assets/about/icon-tools.webp',
    cx: pct(3299, REF_W), cy: pct(1336, REF_H),
    cw: pct(104, REF_W), ch: pct(104, REF_H),
    z: 6 },
];

const TOTAL = LAYERS.length + 4; // 12 图层 + 4 张 TiltedCard 图片

const CARD_WRAPPERS = [
  { src: '/assets/about/education.webp', x: 2772, y: 342, w: 1046, h: 389, alt: '教育背景' },
  { src: '/assets/about/work.webp', x: 2772, y: 759, w: 1093, h: 515, alt: '工作经历' },
  { src: '/assets/about/skills.webp', x: 2733, y: 1296, w: 503, h: 483, alt: '技能' },
  { src: '/assets/about/tools.webp', x: 3266, y: 1296, w: 552, h: 483, alt: '工具' },
];

export default function SectionAbout() {
  const sectionRef = useRef<HTMLElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const characterRef = useRef<HTMLImageElement>(null);
  const helloRef = useRef<HTMLImageElement>(null);
  const nameRef = useRef<HTMLImageElement>(null);
  const titleRef = useRef<HTMLImageElement>(null);
  const descRef = useRef<HTMLImageElement>(null);
  const aiDecoRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const loadedCount = useRef(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const onAssetLoad = () => {
    loadedCount.current++;
    if (loadedCount.current >= TOTAL) setLoaded(true);
  };
  const onAssetError = onAssetLoad;

  const syncSize = useCallback(() => {
    const section = sectionRef.current;
    const wrapper = wrapperRef.current;
    if (!section || !wrapper) return;
    const mobile = window.innerWidth < 768;
    const maxW = section.clientWidth;
    /* 手机端用视口高度，避免 section 高度不足时的循环依赖 */
    const maxH = mobile ? window.innerHeight * 0.88 : section.clientHeight;
    let w: number, h: number;
    if (maxW / maxH > RATIO) {
      h = maxH;
      w = h * RATIO;
    } else {
      w = maxW;
      h = w / RATIO;
      /* 手机竖屏：填满更多视口高度 */
      if (mobile) {
        h = Math.max(h, maxH);
      }
    }
    wrapper.style.width = `${w}px`;
    wrapper.style.height = `${h}px`;
  }, []);

  useEffect(() => {
    syncSize();
    window.addEventListener('resize', syncSize);
    return () => window.removeEventListener('resize', syncSize);
  }, [syncSize]);

  // 持续微浮动呼吸动画（不依赖图片加载状态）
  useEffect(() => {
    const character = characterRef.current;
    const hello = helloRef.current;
    const tweens: gsap.core.Tween[] = [];
    if (character) {
      tweens.push(gsap.to(character, {
        y: -10, duration: 3.5, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 1.8,
      }));
    }
    if (hello) {
      tweens.push(gsap.to(hello, {
        y: -3, duration: 5, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 2,
      }));
    }
    return () => { tweens.forEach(t => t.kill()); };
  }, []);

  // 人物鼠标视差效果
  useEffect(() => {
    const section = sectionRef.current;
    const character = characterRef.current;
    if (!section || !character) return;

    const handleParallax = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      gsap.to(character, {
        x: dx * 8,
        y: dy * 6,
        duration: 1.2,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    };

    window.addEventListener('mousemove', handleParallax);
    return () => window.removeEventListener('mousemove', handleParallax);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden flex"
      style={{
        minHeight: isMobile ? 'auto' : '100vh',
        background: '#06090e',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: isMobile ? '3.5rem' : 0,
      }}
    >
      <div
        ref={wrapperRef}
        className="relative overflow-hidden select-none"
        style={{ opacity: 1 }}
      >
        {LAYERS.map((a, i) => (
          <img
            key={i}
            ref={(el) => {
              if (a.isCharacter) characterRef.current = el;
              else if (a.isText && a.src.includes('hello')) helloRef.current = el;
              else if (a.isText && a.src.includes('name')) nameRef.current = el;
              else if (a.src.includes('title.webp')) titleRef.current = el;
              else if (a.src.includes('description.webp')) descRef.current = el;
              else if (a.src.includes('ai-deco.webp')) aiDecoRef.current = el;
            }}
            src={a.src}
            alt=""
            className="absolute pointer-events-none"
            loading="lazy"
            style={{
              left: a.cx,
              top: a.cy,
              width: a.cw,
              height: a.ch,
              zIndex: a.z,
              transform: a.rot ? `rotate(${a.rot}deg)` : undefined,
            }}
            draggable={false}
            onLoad={onAssetLoad}
            onError={onAssetError}
          />
        ))}

        {/* Bento 全局微光效果 */}
        <BentoGlow containerRef={sectionRef} glowColor="140, 80, 210" />

        {/* 3D 倾斜卡片 — 各自独立滑入，自然错开 */}
        {CARD_WRAPPERS.map((c, i) => (
          <AnimatedContent
            key={c.alt}
            distance={24}
            direction="horizontal"
            duration={0.4}
            ease="power3.out"
            delay={i * 0.05}
            threshold={0.08}
            className="glow-card magic-bento-card--border-glow"
            style={{ position: 'absolute', left: pct(c.x, REF_W), top: pct(c.y, REF_H), width: pct(c.w, REF_W), height: pct(c.h, REF_H), zIndex: 3 }}
          >
            <TiltedCard
              imageSrc={c.src}
              rotateAmplitude={8}
              scaleOnHover={1.05}
              altText={c.alt}
              imgLoading="lazy"
              onLoad={onAssetLoad}
              onError={onAssetError}
            />
          </AnimatedContent>
        ))}
      </div>
      <GradualBlur position="bottom" height="8rem" strength={2} divCount={6} curve="bezier" />
    </section>
  );
}
