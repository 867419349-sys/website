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
  card04: { x: -1.2, y: 0.5 },
  card03: { x: 0.6, y: -1 },
  card02: { x: 1, y: -0.4 },
  card01: { x: 1.8, y: 1.2 },
};

const RISE = -38;
const SPREAD_D = 16;
const SCALE = 1.04;
const INFLUENCE = 28; // 影响半径（百分比），光标在此范围内卡片开始反应

const pct = (px: number, ref: number) => `${(px / ref) * 100}%`;

// 所有卡片的包围盒（百分比坐标）
const CARD_GROUP = { l: 39.1, t: 25.0, r: 65.5, b: 78.8 };

export default function SectionHome() {
  const sectionRef = useRef<HTMLElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLImageElement>(null);
  const cardRefs = useRef<Record<string, HTMLImageElement | null>>({});
  const [loaded, setLoaded] = useState(false);
  const loadedCount = useRef(0);
  const idleTween = useRef<gsap.core.Timeline | null>(null);

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
    gsap.fromTo(textRef.current,
      { opacity: 0, y: 50, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power3.out', delay: 0.25 }
    );
  }, [loaded]);

  // 启动呼吸动画（从当前卡片位置开始）
  const startBreathing = useCallback(() => {
    if (idleTween.current) idleTween.current.kill();
    const tl = gsap.timeline({ repeat: -1, yoyo: true });
    CARD_ORDER.forEach((id) => {
      const el = cardRefs.current[id];
      if (!el) return;
      const s = SPREAD[id] || { x: 0, y: 0 };
      tl.to(el, {
        x: s.x * 10, y: s.y * 10,
        duration: 2.5 + Math.random() * 1.5,
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

  // 连续光标追踪
  useEffect(() => {
    if (!loaded) return;

    const handleMouseMove = (e: MouseEvent) => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      const rect = wrapper.getBoundingClientRect();
      const rx = (e.clientX - rect.left) / rect.width * 100;
      const ry = (e.clientY - rect.top) / rect.height * 100;

      const inGroup =
        rx >= CARD_GROUP.l - INFLUENCE && rx <= CARD_GROUP.r + INFLUENCE &&
        ry >= CARD_GROUP.t - INFLUENCE && ry <= CARD_GROUP.b + INFLUENCE;

      if (inGroup) {
        idleTween.current?.pause();

        let best: CardId | null = null;
        let bestDist = Infinity;
        for (let i = CARD_ORDER.length - 1; i >= 0; i--) {
          const id = CARD_ORDER[i];
          const c = CARD[id];
          const cx = c.x / REF_W * 100 + c.w / REF_W * 100 / 2;
          const cy = c.y / REF_H * 100 + c.h / REF_H * 100 / 2;
          const dist = Math.hypot(rx - cx, ry - cy);
          if (dist < bestDist) { bestDist = dist; best = id; }
        }

        for (const id of CARD_ORDER) {
          const el = cardRefs.current[id];
          if (!el) continue;
          const c = CARD[id];
          const cx = c.x / REF_W * 100 + c.w / REF_W * 100 / 2;
          const cy = c.y / REF_H * 100 + c.h / REF_H * 100 / 2;
          const dist = Math.hypot(rx - cx, ry - cy);

          const t = Math.max(0, 1 - dist / INFLUENCE);
          const ease = t * t * (3 - 2 * t);

          const isTarget = id === best && dist < 20;
          const s = SPREAD[id] || { x: 0, y: 0 };

          gsap.killTweensOf(el);
          gsap.to(el, {
            x: s.x * SPREAD_D * ease,
            y: (isTarget ? RISE : 0) * ease + s.y * SPREAD_D * ease,
            scale: isTarget ? 1 + (SCALE - 1) * ease : 1,
            duration: 0.25,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        }
      } else {
        if (idleTween.current && !idleTween.current.isActive()) {
          startBreathing();
        }
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
        <img src="/assets/home/box/figma-glass.png" alt="" className="absolute pointer-events-none"
          style={{
            left: pct(1627.5, REF_W), top: pct(614, REF_H),
            width: pct(601, REF_W), height: pct(1265.5, REF_H),
            zIndex: 7,
          }}
          draggable={false} onLoad={onAssetLoad} />

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
