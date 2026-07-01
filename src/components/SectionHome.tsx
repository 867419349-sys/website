import React, { useRef, useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import GradualBlur from './GradualBlur';

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

const CARD_FRONT: Record<CardId, string> = {
  card01: '/assets/home/box/card-front-01.png',
  card02: '/assets/home/box/card-front-02.png',
  card03: '/assets/home/box/card-front-03.png',
  card04: '/assets/home/box/card-front-04.png',
};

const CARD_FRONT_DIMS: Record<CardId, { w: number; h: number }> = {
  card01: { w: 1251, h: 1351 },
  card02: { w: 1059, h: 1247 },
  card03: { w: 1070, h: 1328 },
  card04: { w: 1078, h: 1370 },
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

  // 卡片弹出状态
  const [selectedCard, setSelectedCard] = useState<CardId | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const cardFrontRef = useRef<HTMLImageElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const bestCardRef = useRef<CardId | null>(null);

  const onAssetLoad = () => {
    loadedCount.current++;
    if (loadedCount.current >= 13) setLoaded(true);
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

  // ---- 卡片点击：3D 旋转弹出 ----
  const handleCardClick = useCallback(
    (cardId: CardId) => {
      if (isAnimating || selectedCard) return;

      setIsAnimating(true);
      setSelectedCard(cardId);

      const originalEl = cardRefs.current[cardId];
      if (!originalEl) return;

      idleTween.current?.pause();
      textIdleTween.current?.pause();

      requestAnimationFrame(() => {
        const cardRect = originalEl.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const cardW = cardRect.width;
        const cardH = cardRect.height;

        const fdim = CARD_FRONT_DIMS[cardId];
        const targetW = Math.min(vw * 0.35, vh * 0.55 * (fdim.w / fdim.h));
        const targetH = targetW * (fdim.h / fdim.w);

        const startX = cardRect.left + cardW / 2 - vw / 2;
        const startY = cardRect.top + cardH / 2 - vh / 2;

        const startScaleX = cardW / targetW;
        const startScaleY = cardH / targetH;

        gsap.killTweensOf(cardFrontRef.current);
        gsap.killTweensOf(overlayRef.current);

        gsap.set(cardFrontRef.current, {
          visibility: 'visible',
          opacity: 1,
          x: startX,
          y: startY,
          xPercent: -50,
          yPercent: -50,
          scaleX: startScaleX,
          scaleY: startScaleY,
          transformPerspective: 1200,
          rotationX: -14,
          rotationY: 10,
          rotationZ: 2,
          width: targetW,
          height: targetH,
        });

        gsap.set(overlayRef.current, {
          background: 'rgba(0, 0, 0, 0)',
        });

        gsap.to(cardFrontRef.current, {
          x: 0,
          y: 0,
          xPercent: -50,
          yPercent: -50,
          scaleX: 1,
          scaleY: 1,
          rotationX: 0,
          rotationY: 0,
          rotationZ: 0,
          duration: 0.7,
          ease: 'power3.inOut',
          onComplete: () => {
            setIsAnimating(false);
          },
        });

        gsap.to(overlayRef.current, {
          background: 'rgba(0, 0, 0, 0.3)',
          duration: 0.5,
          ease: 'power2.out',
        });
      });
    },
    [isAnimating, selectedCard],
  );

  // ---- 关闭：反向动画 ----
  const handleDismiss = useCallback(() => {
    if (isAnimating || !selectedCard) return;

    setIsAnimating(true);

    const originalEl = cardRefs.current[selectedCard];
    if (!originalEl) {
      gsap.to(cardFrontRef.current, { opacity: 0, duration: 0.3 });
      gsap.to(overlayRef.current, { background: 'rgba(0,0,0,0)', duration: 0.3 });
      setTimeout(() => {
        setSelectedCard(null);
        setIsAnimating(false);
        startBreathing();
      }, 350);
      return;
    }

    const cardRect = originalEl.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cardW = cardRect.width;
    const cardH = cardRect.height;

    const endX = cardRect.left + cardW / 2 - vw / 2;
    const endY = cardRect.top + cardH / 2 - vh / 2;

    const targetW = parseFloat(cardFrontRef.current?.style.width || '0');
    const targetH = parseFloat(cardFrontRef.current?.style.height || '0');

    const endScaleX = targetW > 0 ? cardW / targetW : 1;
    const endScaleY = targetH > 0 ? cardH / targetH : 1;

    gsap.killTweensOf(cardFrontRef.current);
    gsap.killTweensOf(overlayRef.current);

    gsap.to(cardFrontRef.current, {
      x: endX,
      y: endY,
      xPercent: -50,
      yPercent: -50,
      scaleX: endScaleX,
      scaleY: endScaleY,
      rotationX: -14,
      rotationY: 10,
      rotationZ: 2,
      duration: 0.55,
      ease: 'power3.in',
      onComplete: () => {
        setSelectedCard(null);
        setIsAnimating(false);
        startBreathing();
      },
    });

    gsap.to(overlayRef.current, {
      background: 'rgba(0, 0, 0, 0)',
      duration: 0.4,
      ease: 'power2.in',
    });
  }, [isAnimating, selectedCard, startBreathing]);

  // ---- 键盘 Escape 关闭 ----
  useEffect(() => {
    if (!selectedCard) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleDismiss();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCard, handleDismiss]);

  // ---- 滚动锁定 ----
  useEffect(() => {
    if (selectedCard) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selectedCard]);

  // ---- 窗口缩放时卡片重新居中 ----
  useEffect(() => {
    if (!selectedCard || !cardFrontRef.current) return;

    const handleResize = () => {
      const el = cardFrontRef.current;
      if (!el) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const fdim = CARD_FRONT_DIMS[selectedCard];
      const targetW = Math.min(vw * 0.35, vh * 0.55 * (fdim.w / fdim.h));
      const targetH = targetW * (fdim.h / fdim.w);
      gsap.set(el, { width: targetW, height: targetH, x: 0, y: 0, xPercent: -50, yPercent: -50 });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [selectedCard]);

  // ---- GSAP 清理 ----
  useEffect(() => {
    return () => {
      gsap.killTweensOf(cardFrontRef.current);
      gsap.killTweensOf(overlayRef.current);
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (selectedCard) return;

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

      bestCardRef.current = best;

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
  }, [loaded, startBreathing, selectedCard, handleCardClick]);

  const handleWrapperClick = (e: React.MouseEvent) => {
    const cardId = bestCardRef.current;
    if (cardId) {
      e.stopPropagation();
      handleCardClick(cardId);
    }
  };

  const setCardRef = (id: string) => (el: HTMLImageElement | null) => {
    cardRefs.current[id] = el;
  };

  // Portal 渲染：遮罩 + 卡片正面图
  const cardOverlay = selectedCard
    ? createPortal(
        <>
          <div
            ref={overlayRef}
            onClick={handleDismiss}
            style={{
              position: 'fixed', inset: 0, zIndex: 1000,
              background: 'rgba(0, 0, 0, 0)', cursor: 'pointer',
            }}
          />
          <img
            ref={cardFrontRef}
            src={CARD_FRONT[selectedCard]}
            alt=""
            draggable={false}
            style={{
              position: 'fixed', left: '50%', top: '50%', zIndex: 1001,
              willChange: 'transform', pointerEvents: 'none',
              opacity: 0, visibility: 'hidden',
            }}
          />
        </>,
        document.body,
      )
    : null;

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden flex items-center justify-center"
      style={{ minHeight: '100vh', background: '#0a0a0f' }}
    >
      <div
        ref={wrapperRef}
        onClick={handleWrapperClick}
        className="relative overflow-hidden select-none"
        style={{
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.4s',
        }}
      >
        {/* Layer 1: 底部背景 */}
        <img src="/assets/home/box/ref-bg.png" alt="" className="absolute pointer-events-none"
          style={{ inset: 0, width: '100%', height: '100%', zIndex: 0 }}
          draggable={false} onLoad={onAssetLoad} />

        {/* Layer 2: HI,I'm 杨芷琳 */}
        <img ref={textRef} src="/assets/home/box/figma-text.png" alt="" className="absolute pointer-events-none"
          style={{
            left: pct(788, REF_W), top: pct(726, REF_H),
            width: pct(2924, REF_W), height: pct(637, REF_H),
            zIndex: 1, opacity: 0,
          }}
          draggable={false} onLoad={onAssetLoad} />

        {/* Layer 3: 收纳盒 */}
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
                cursor: 'pointer',
              }}
              draggable={false} onLoad={onAssetLoad}
            />
          );
        })}

        {/* Layer 8: 毛玻璃收纳盒 */}
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

        {/* Layer 9: 收纳盒前框 */}
        <img src="/assets/home/box/figma-front.png" alt="" className="absolute pointer-events-none"
          style={{
            left: pct(2217, REF_W), top: pct(1135, REF_H),
            width: pct(757, REF_W), height: pct(708, REF_H),
            zIndex: 8,
          }}
          draggable={false} onLoad={onAssetLoad} />

        {/* 预加载：卡片正面图（隐藏） */}
        {Object.values(CARD_FRONT).map((src) => (
          <img key={src} src={src} alt="" style={{ display: 'none' }}
            onLoad={onAssetLoad} onError={onAssetLoad} />
        ))}
      </div>
      <GradualBlur position="bottom" height="8rem" strength={2} divCount={6} curve="bezier" />

      {/* Portal 渲染的遮罩+卡片正面 */}
      {cardOverlay}
    </section>
  );
}
