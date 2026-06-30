import React, { useRef, useEffect, useCallback, useState } from 'react';
import gsap from 'gsap';

const REF_W = 4500;
const REF_H = 2089;
const RATIO = REF_W / REF_H;

const CARD_ORDER = ['card04', 'card03', 'card02', 'card01'] as const;
type CardId = (typeof CARD_ORDER)[number];

const CARD: Record<CardId, { x: number; y: number; w: number; h: number; file: string; z: number }> = {
  card04: { x: 1759, y: 523,  w: 780,  h: 1005, file: 'ps-card04.png', z: 3 },
  card03: { x: 1866, y: 626,  w: 785,  h: 979,  file: 'ps-card03.png', z: 4 },
  card02: { x: 1965, y: 669,  w: 821,  h: 1028, file: 'ps-card02.png', z: 5 },
  card01: { x: 2133, y: 819,  w: 746,  h: 914,  file: 'ps-card01.png', z: 6 },
};

const SPREAD: Partial<Record<CardId, { x: number; y: number }>> = {
  card04: { x: -2.2, y: 0.8 },
  card03: { x: -0.6, y: -2.4 },
  card02: { x: 1.4, y: -2.0 },
  card01: { x: 2.8, y: 1.2 },
};

const RISE = -90;
const SPREAD_D = 18;
const SCALE = 1.08;
const INFLUENCE = 30;
const FOCUS_Y = 0.08;

const pct = (px: number, ref: number) => `${(px / ref) * 100}%`;

export default function SectionHome() {
  const sectionRef = useRef<HTMLElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLImageElement>(null);
  const cardRefs = useRef<Record<string, HTMLImageElement | null>>({});
  const [loaded, setLoaded] = useState(false);
  const loadedCount = useRef(0);
  const idleTween = useRef<gsap.core.Timeline | null>(null);
  const textIdleTween = useRef<gsap.core.Timeline | null>(null);

  const onAssetLoad = () => {
    loadedCount.current++;
    if (loadedCount.current >= 9) setLoaded(true);
  };

  const syncSize = useCallback(() => {
    const section = sectionRef.current;
    const wrapper = wrapperRef.current;
    if (!section || !wrapper) return;
    const maxW = section.clientWidth;
    const maxH = section.clientHeight;
    let w: number, h: number;
    if (maxW / maxH > RATIO) { h = maxH; w = h * RATIO; }
    else { w = maxW; h = w / RATIO; }
    wrapper.style.width = `${w}px`;
    wrapper.style.height = `${h}px`;
  }, []);

  useEffect(() => {
    syncSize();
    window.addEventListener('resize', syncSize);
    return () => window.removeEventListener('resize', syncSize);
  }, [syncSize]);

  useEffect(() => {
    if (!loaded || !textRef.current) return;
    const tl = gsap.timeline();
    tl.fromTo(textRef.current,
      { opacity: 0, y: 50, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power3.out', delay: 0.25 }
    );
    // 入场后启动文字呼吸动画
    tl.to(textRef.current, {
      y: -8, scale: 1.025,
      duration: 2.5,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
    }, '>');
    textIdleTween.current = tl;
    return () => { textIdleTween.current?.kill(); };
  }, [loaded]);

  const startBreathing = useCallback(() => {
    if (idleTween.current) idleTween.current.kill();
    const tl = gsap.timeline({ repeat: -1, yoyo: true });
    const durations = [2.8, 3.2, 3.0, 3.5];
    CARD_ORDER.forEach((id, i) => {
      const el = cardRefs.current[id];
      if (!el) return;
      const s = SPREAD[id] || { x: 0, y: 0 };
      tl.to(el, {
        x: s.x * 8, y: s.y * 8,
        duration: durations[i],
        ease: 'sine.inOut',
      }, 0);
    });
    idleTween.current = tl;
  }, []);

  useEffect(() => {
    if (!loaded) return;
    startBreathing();
    return () => { idleTween.current?.kill(); };
  }, [loaded, startBreathing]);

  useEffect(() => {
    if (!loaded) return;

    const handleMouseMove = (e: MouseEvent) => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      const rect = wrapper.getBoundingClientRect();
      const rx = (e.clientX - rect.left) / rect.width * 100;
      const ry = (e.clientY - rect.top) / rect.height * 100;

      let best: CardId | null = null;
      let bestDist = Infinity;
      const eases: Partial<Record<CardId, number>> = {};
      for (const id of CARD_ORDER) {
        const c = CARD[id];
        const cx = (c.x + c.w / 2) / REF_W * 100;
        const cy = (c.y + c.h * FOCUS_Y) / REF_H * 100;
        const dist = Math.hypot(rx - cx, ry - cy);
        const t = Math.max(0, 1 - dist / INFLUENCE);
        eases[id] = t * t * (3 - 2 * t);
        if (dist < bestDist) { bestDist = dist; best = id; }
      }

      const targetEase = best ? (eases[best] || 0) : 0;
      const anyReacting = targetEase > 0.03;
      for (const id of CARD_ORDER) {
        const el = cardRefs.current[id];
        if (!el) continue;
        const isTarget = id === best;
        const s = SPREAD[id] || { x: 0, y: 0 };
        const spreadEase = isTarget ? 0 : (eases[id] || 0) * 0.5;

        gsap.killTweensOf(el);
        gsap.to(el, {
          x: isTarget ? 0 : s.x * SPREAD_D * spreadEase,
          y: isTarget ? RISE * (eases[id] || 0) : s.y * SPREAD_D * spreadEase,
          scale: isTarget ? 1 + (SCALE - 1) * (eases[id] || 0) : 1,
          duration: 0.35,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      }

      if (anyReacting) {
        idleTween.current?.pause();
      } else if (idleTween.current && !idleTween.current.isActive()) {
        startBreathing();
      }
    };

    const handleMouseLeave = () => {
      if (idleTween.current && !idleTween.current.isActive()) {
        startBreathing();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [loaded, startBreathing]);

  const setCardRef = (id: string) => (el: HTMLImageElement | null) => {
    cardRefs.current[id] = el;
  };

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden flex items-center justify-center"
      style={{ minHeight: '100vh', background: '#0a0a0f' }}
    >
      <div
        ref={wrapperRef}
        className="relative overflow-hidden select-none"
        style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.4s' }}
      >
        {/* Layer 1: 底部背景 — 4500×2089 匹配 Figma 画布 */}
        <img src="/assets/home/box/ref-bg.png" alt="" className="absolute pointer-events-none"
          style={{ inset: 0, width: '100%', height: '100%', zIndex: 0 }}
          draggable={false} onLoad={onAssetLoad} />

        {/* Layer 2: HI,I'm 杨芷琳 — 画面居中，图片 2924×637 */}
        <img ref={textRef} src="/assets/home/box/figma-text.png" alt="" className="absolute pointer-events-none"
          style={{
            left: pct(788, REF_W), top: pct(726, REF_H),
            width: pct(2924, REF_W), height: pct(637, REF_H),
            zIndex: 1, opacity: 0,
          }}
          draggable={false} onLoad={onAssetLoad} />

        {/* Layer 3: 收纳盒 — 4500×2089 全画布叠加 */}
        <img src="/assets/home/box/ps-box.png" alt="" className="absolute pointer-events-none"
          style={{ inset: 0, width: '100%', height: '100%', zIndex: 2 }}
          draggable={false} onLoad={onAssetLoad} />

        {/* Layer 4-7: 卡片 */}
        {CARD_ORDER.map((id) => {
          const c = CARD[id];
          return (
            <img key={id} ref={setCardRef(id)} src={`/assets/home/box/${c.file}`} alt=""
              style={{
                position: 'absolute',
                left: pct(c.x, REF_W), top: pct(c.y, REF_H),
                width: pct(c.w, REF_W), height: pct(c.h, REF_H),
                zIndex: c.z, willChange: 'transform',
              }}
              draggable={false} onLoad={onAssetLoad}
            />
          );
        })}

        {/* Layer 8: 毛玻璃收纳盒 — Figma: 40:294 at (1627.5,614) 601×1265.5 */}
        <div className="absolute pointer-events-none"
          style={{
            left: pct(1627.5, REF_W), top: pct(614, REF_H),
            width: pct(601, REF_W), height: pct(1265.5, REF_H),
            zIndex: 7,
          }}>
          <div
            style={{
              position: 'absolute', inset: 0,
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              maskImage: 'url(/assets/home/box/figma-glass.png)',
              WebkitMaskImage: 'url(/assets/home/box/figma-glass.png)',
              maskSize: '100% 100%',
              WebkitMaskSize: '100% 100%',
            }}
          />
          <img src="/assets/home/box/figma-glass.png" alt=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            draggable={false} onLoad={onAssetLoad} />
        </div>

        {/* Layer 9: 收纳盒前框 — Figma: 13:244 at (2217,1135) 757×708 */}
        <img src="/assets/home/box/figma-front.png" alt="" className="absolute pointer-events-none"
          style={{
            left: pct(2217, REF_W), top: pct(1135, REF_H),
            width: pct(757, REF_W), height: pct(708, REF_H),
            zIndex: 8,
          }}
          draggable={false} onLoad={onAssetLoad} />
      </div>
    </section>
  );
}
