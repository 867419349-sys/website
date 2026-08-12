import React, { useRef, useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import TiltedCard from './TiltedCard';
import { sounds } from '../utils/audio';

const REF_W = 4500;
const REF_H = 2089;
const RATIO = REF_W / REF_H;

const CARD_ORDER = ['card04', 'card03', 'card02', 'card01'] as const;
type CardId = (typeof CARD_ORDER)[number];

const CARD: Record<CardId, { x: number; y: number; w: number; h: number; file: string; z: number }> = {
  card04: { x: 1759, y: 523,  w: 780,  h: 1005, file: '04卡片.webp', z: 3 },
  card03: { x: 1866, y: 626,  w: 785,  h: 979,  file: '03卡片_改.webp', z: 4 },
  card02: { x: 1965, y: 669,  w: 821,  h: 1028, file: '02卡片_改.webp', z: 5 },
  card01: { x: 2133, y: 819,  w: 746,  h: 914,  file: 'ps-card01.webp', z: 6 },
};

const CARD_FRONT: Record<CardId, string> = {
  card01: '/assets/home/box/01卡片正面背景.webp',
  card02: '/assets/home/box/02卡片正面_改.webp',
  card03: '/assets/home/box/03卡片正面.webp',
  card04: '/assets/home/box/04卡片正面.webp',
};

const CARD_FRONT_DIMS: Record<CardId, { w: number; h: number; s: number }> = {
  card01: { w: 1251, h: 1351, s: 1 },
  card02: { w: 1078, h: 1263, s: 0.79 },
  card03: { w: 1040, h: 1237, s: 0.8 },
  card04: { w: 1075, h: 1286, s: 0.8 },
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
  const breathRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [loaded, setLoaded] = useState(false);
  const [textReady, setTextReady] = useState(false);
  const loadedCount = useRef(0);
  const textIdleTween = useRef<gsap.core.Timeline | null>(null);

  // 卡片弹出状态
  const [selectedCard, setSelectedCard] = useState<CardId | null>(null);
  const selectedCardRef = useRef<CardId | null>(null);
  selectedCardRef.current = selectedCard;
  const [isAnimating, setIsAnimating] = useState(false);
  const [cardImgReady, setCardImgReady] = useState(false);
  const pendingCardRef = useRef<CardId | null>(null);
  const spinnerRef = useRef<HTMLDivElement | null>(null);
  const cardFrontRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const bestCardRef = useRef<CardId | null>(null);
  const prevHoveredRef = useRef<CardId | null>(null);

  const onAssetLoad = () => {
    loadedCount.current++;
    if (loadedCount.current >= 8) setLoaded(true);
  };
  const onAssetError = onAssetLoad;
  const onTextLoad = () => { setTextReady(true); };

  /* 多层级预加载卡片正面大图，确保跨浏览器零延迟渲染 */
  useEffect(() => {
    Object.values(CARD_FRONT).forEach(async (src) => {
      // 1. <link rel="preload"> — 浏览器级高优先级下载（所有浏览器通用）
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
      // 2. decode() — 预解码 WebP 到位图内存
      const img = new Image();
      img.src = src;
      try { await img.decode(); } catch { /* 解码失败不阻塞 */ }
    });
  }, []);

  /* 安全兜底：8 秒后若图片仍未被计数，强制激活动画 */
  useEffect(() => {
    const timer = setTimeout(() => { setLoaded(true); }, 8000);
    return () => clearTimeout(timer);
  }, []);


  useEffect(() => {
    if (!textReady || !textRef.current) return;
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
  }, [textReady]);

  const styleRef = useRef<HTMLStyleElement | null>(null);

  /* 用浏览器原生 CSS animation 替代 GSAP 呼吸动画 — CSS 动画跑在合成器线程，不占 JS 主线程 */
  const injectBreathingCSS = useCallback(() => {
    if (!styleRef.current) return;
    const mobile = window.innerWidth < 768;
    const MULT = mobile ? 4 : 8;
    const durations = [2.8, 3.2, 3.0, 3.5];
    let css = '';
    CARD_ORDER.forEach((id, i) => {
      const s = SPREAD[id] || { x: 0, y: 0 };
      css += `@keyframes breathe-${id} {`
        + `0%{transform:translate(0,0) scale(1)}`
        + `100%{transform:translate(${s.x * MULT}px,${s.y * MULT}px) scale(1)}`
        + `}`;
    });
    styleRef.current.textContent = css;
    CARD_ORDER.forEach((id, i) => {
      const el = breathRefs.current[id];
      if (!el) return;
      el.style.animation = `breathe-${id} ${durations[i]}s ease-in-out infinite alternate`;
    });
  }, []);

  const pauseBreathing = useCallback(() => {
    CARD_ORDER.forEach((id) => {
      const el = breathRefs.current[id];
      if (el) el.style.animationPlayState = 'paused';
    });
  }, []);

  const resumeBreathing = useCallback(() => {
    // 清除 wrapper 上的悬停 CSS 变量，让呼吸动画透出
    const ws = wrapperRef.current?.style;
    if (ws) {
      CARD_ORDER.forEach((id) => {
        ws.removeProperty(`--x-${id}`);
        ws.removeProperty(`--y-${id}`);
        ws.removeProperty(`--s-${id}`);
      });
    }
    CARD_ORDER.forEach((id) => {
      const el = breathRefs.current[id];
      if (!el) return;
      el.style.animationPlayState = 'running';
    });
  }, []);

  useEffect(() => {
    if (!loaded) return;
    injectBreathingCSS();
    const onResize = () => injectBreathingCSS();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [loaded, injectBreathingCSS]);

  // 标签页切后台时暂停 CSS 动画，释放 GPU 合成器资源
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) {
        pauseBreathing();
        textIdleTween.current?.pause();
      } else if (!selectedCard) {
        resumeBreathing();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [pauseBreathing, resumeBreathing, selectedCard]);

  // ---- 卡片点击：先显示 loading，等大图加载完再飞入 ----
  const startCardFlyIn = useCallback((cardId: CardId) => {
    const originalEl = cardRefs.current[cardId];
    if (!originalEl) return;

    pauseBreathing();
    textIdleTween.current?.pause();

    requestAnimationFrame(() => {
      const cardRect = originalEl.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const cardW = cardRect.width;
      const cardH = cardRect.height;

      const fdim = CARD_FRONT_DIMS[cardId];
      const targetW = Math.min(vw * 0.35, vh * 0.55 * (fdim.w / fdim.h)) * fdim.s;
      const targetH = targetW * (fdim.h / fdim.w);

      const startX = cardRect.left + cardW / 2 - vw / 2;
      const startY = cardRect.top + cardH / 2 - vh / 2;

      const startScaleX = cardW / targetW;
      const startScaleY = cardH / targetH;

      gsap.killTweensOf(cardFrontRef.current);

      gsap.set(cardFrontRef.current, {
        visibility: 'visible',
        opacity: 1,
        x: startX, y: startY,
        xPercent: -50, yPercent: -50,
        scaleX: startScaleX, scaleY: startScaleY,
        width: targetW, height: targetH,
      });

      gsap.set(overlayRef.current, {
        background: 'rgba(0, 0, 0, 0.15)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      });

      gsap.to(cardFrontRef.current, {
        x: 0, y: 0,
        scaleX: 1, scaleY: 1,
        duration: 0.55,
        ease: 'power3.out',
        onComplete: () => {
          setIsAnimating(false);
        },
      });
    });
  }, [pauseBreathing]);

  const handleCardClick = useCallback(
    (cardId: CardId) => {
      if (isAnimating || selectedCard) return;
      sounds.playChime();
      setIsAnimating(true);
      setSelectedCard(cardId);
      setCardImgReady(false);
      pendingCardRef.current = cardId;
      // 显示 spinner（直接操作 DOM 避免额外 React 渲染）
      if (spinnerRef.current) {
        spinnerRef.current.style.display = 'block';
      }
    },
    [isAnimating, selectedCard],
  );

  // 大图加载完成后触发飞入动画（直接操作 DOM 避免 React 重渲染干扰 GSAP）
  const onCardImgLoad = useCallback(() => {
    // 直接隐藏 spinner，不触发 React 重渲染
    if (spinnerRef.current) {
      spinnerRef.current.style.display = 'none';
    }
    setCardImgReady(true);
    const cardId = pendingCardRef.current;
    if (cardId) {
      pendingCardRef.current = null;
      startCardFlyIn(cardId);
    }
  }, [startCardFlyIn]);

  // ---- 关闭：反向动画（或直接关闭，如果还在加载中） ----
  const handleDismiss = useCallback(() => {
    if (isAnimating || !selectedCard) return;

    // 如果大图还没加载完，直接关闭，不需要反向动画
    if (!cardImgReady) {
      setSelectedCard(null);
      setIsAnimating(false);
      pendingCardRef.current = null;
      resumeBreathing();
      return;
    }

    setIsAnimating(true);

    const originalEl = cardRefs.current[selectedCard];
    if (!originalEl) {
      gsap.to(cardFrontRef.current, { opacity: 0, duration: 0.2 });
      gsap.set(overlayRef.current, { background: 'rgba(0,0,0,0)', backdropFilter: 'blur(0px)', WebkitBackdropFilter: 'blur(0px)' });
      setTimeout(() => {
        setSelectedCard(null);
        setCardImgReady(false);
        setIsAnimating(false);
        resumeBreathing();
      }, 250);
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

    // 反向动画回到卡片原位（纯 2D）
    gsap.to(cardFrontRef.current, {
      x: endX, y: endY,
      xPercent: -50, yPercent: -50,
      scaleX: endScaleX, scaleY: endScaleY,
      duration: 0.45,
      ease: 'power3.in',
      onComplete: () => {
        setSelectedCard(null);
        setCardImgReady(false);
        setIsAnimating(false);
        resumeBreathing();
      },
    });

    // 遮罩直接设透明，不做动画
    gsap.set(overlayRef.current, {
      background: 'rgba(0, 0, 0, 0)',
      backdropFilter: 'blur(0px)',
      WebkitBackdropFilter: 'blur(0px)',
    });
  }, [isAnimating, selectedCard, cardImgReady, resumeBreathing]);

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
    let rafId: number | null = null;
    let pendingEvent: MouseEvent | null = null;
    let wrapperRect: DOMRect | null = null;
    let frameSkip = false; // 隔帧写入 DOM（30fps），CSS transition 补间
    const updateRect = () => {
      if (wrapperRef.current) wrapperRect = wrapperRef.current.getBoundingClientRect();
    };

    const processFrame = () => {
      if (selectedCardRef.current || !wrapperRef.current || !wrapperRect) {
        rafId = requestAnimationFrame(processFrame);
        return;
      }

      frameSkip = !frameSkip;
      if (!frameSkip && pendingEvent) {
        const e = pendingEvent;
        pendingEvent = null;
        const rect = wrapperRect;
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

        bestCardRef.current = best;
        if (best && best !== prevHoveredRef.current) {
          sounds.playHover();
          prevHoveredRef.current = best;
        }
        if (!best) prevHoveredRef.current = null;

        const hoverScale = rect.width < 768 ? Math.max(rect.width / REF_W, 0.28) : 1;
        const rise = RISE * hoverScale;
        const spreadD = SPREAD_D * hoverScale;

        const ws = wrapperRef.current.style;
        for (const id of CARD_ORDER) {
          const isTarget = id === best;
          const s = SPREAD[id] || { x: 0, y: 0 };
          const spreadEase = isTarget ? 0 : (eases[id] || 0) * 0.5;
          const tx = isTarget ? 0 : s.x * spreadD * spreadEase;
          const ty = isTarget ? rise * (eases[id] || 0) : s.y * spreadD * spreadEase;
          const sc = isTarget ? 1 + (SCALE - 1) * (eases[id] || 0) : 1;
          ws.setProperty(`--x-${id}`, `${tx}px`);
          ws.setProperty(`--y-${id}`, `${ty}px`);
          ws.setProperty(`--s-${id}`, String(sc));
        }
      }
      // rAF 始终运行，隔帧才写 DOM；CSS transition 在合成器线程补间
      rafId = requestAnimationFrame(processFrame);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (selectedCardRef.current) return;
      updateRect();
      pendingEvent = e;
    };

    const handleMouseLeave = () => {
      pendingEvent = null;
      // 清除 CSS 自定义属性，内层 img 通过 transition 平滑回到原位
      const ws = wrapperRef.current?.style;
      if (ws) {
        for (const id of CARD_ORDER) {
          ws.removeProperty(`--x-${id}`);
          ws.removeProperty(`--y-${id}`);
          ws.removeProperty(`--s-${id}`);
        }
      }
    };

    updateRect();
    rafId = requestAnimationFrame(processFrame);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', updateRect);
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', updateRect);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const handleWrapperClick = (e: React.MouseEvent) => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const rect = wrapper.getBoundingClientRect();
    const rx = (e.clientX - rect.left) / rect.width * 100;
    const ry = (e.clientY - rect.top) / rect.height * 100;

    /* 直接计算点击位置最近的卡片（手机端无 mousemove，bestCardRef 为 null） */
    let best: CardId | null = null;
    let bestDist = Infinity;
    for (const id of CARD_ORDER) {
      const c = CARD[id];
      const cx = (c.x + c.w / 2) / REF_W * 100;
      const cy = (c.y + c.h * FOCUS_Y) / REF_H * 100;
      const dist = Math.hypot(rx - cx, ry - cy);
      if (dist < bestDist) { bestDist = dist; best = id; }
    }

    if (!best || bestDist > INFLUENCE * 0.6) return;

    e.stopPropagation();
    handleCardClick(best);
  };

  const setCardRef = (id: string) => (el: HTMLImageElement | null) => {
    cardRefs.current[id] = el;
  };
  const setBreathRef = (id: string) => (el: HTMLDivElement | null) => {
    breathRefs.current[id] = el;
  };

  // Portal 渲染：遮罩 + 加载指示器 + 卡片正面图
  const cardOverlay = selectedCard
    ? createPortal(
        <>
          <div
            ref={overlayRef}
            onClick={handleDismiss}
            style={{
              position: 'fixed', top: '3.5rem', right: 0, bottom: 0, left: 0, zIndex: 1000,
              background: 'rgba(0, 0, 0, 0.15)', cursor: 'pointer',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}
          />
          {/* 加载指示器 — 始终渲染，通过 ref 直接控制 display 避免 React 重渲染干扰 GSAP */}
          <div ref={spinnerRef} style={{ position: 'fixed', left: '50%', top: '50%', zIndex: 1002, transform: 'translate(-50%, -50%)' }}>
            <div className="w-10 h-10 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          </div>
          {(selectedCard === 'card01' || selectedCard === 'card02' || selectedCard === 'card03' || selectedCard === 'card04') ? (
            <div
              ref={cardFrontRef}
              style={{
                position: 'fixed', left: '50%', top: '50%', zIndex: 1001,
                willChange: 'transform', opacity: 0, visibility: 'hidden',
              }}
            >
              <TiltedCard
                imageSrc={CARD_FRONT[selectedCard]}
                altText=""
                rotateAmplitude={5}
                scaleOnHover={1.06}
                onLoad={onCardImgLoad}
              >
                <img src={`/assets/home/box/${selectedCard === 'card01' ? '01' : selectedCard === 'card02' ? '02' : selectedCard === 'card03' ? '03' : '04'}按钮.webp`} alt="" draggable={false}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCard(null);
                    setCardImgReady(false);
                    setIsAnimating(false);
                    const target = selectedCard === 'card01' ? 'profile' : selectedCard === 'card02' ? 'splash' : selectedCard === 'card03' ? 'designops' : 'contact';
                    document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  style={{
                    position: 'absolute',
                    right: selectedCard === 'card02' ? '8%' : selectedCard === 'card03' ? '5%' : selectedCard === 'card04' ? '5%' : '12%',
                    bottom: selectedCard === 'card02' ? '6%' : selectedCard === 'card03' ? '3%' : selectedCard === 'card04' ? '3%' : '14%',
                    width: selectedCard === 'card02' ? '43%' : selectedCard === 'card03' ? '42.5%' : selectedCard === 'card04' ? '42.5%' : '34%',
                    height: 'auto', cursor: 'pointer', zIndex: 2,
                  }}
                />
              </TiltedCard>
            </div>
          ) : (
            <img
              ref={cardFrontRef as any}
              src={CARD_FRONT[selectedCard]} alt="" draggable={false}
              style={{
                position: 'fixed', left: '50%', top: '50%', zIndex: 1001,
                willChange: 'transform', pointerEvents: 'none',
                opacity: 0, visibility: 'hidden',
              }}
            />
          )}
        </>,
        document.body,
      )
    : null;

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden flex items-center justify-center"
      style={{ background: '#0a0a0f' }}
    >
      {/* CSS @keyframes 注入 — 卡片呼吸动画（合成器线程，不占 JS） */}
      <style ref={styleRef} />
      <div
        ref={wrapperRef}
        onClick={handleWrapperClick}
        className="relative overflow-hidden select-none w-full"
        style={{
          aspectRatio: `${REF_W} / ${REF_H}`,
        }}
      >
        {/* Layer 1: 底部背景 */}
        <img src="/assets/home/box/ref-bg.webp" alt="" className="absolute pointer-events-none"
          style={{ inset: 0, width: '100%', height: '100%', zIndex: 0 }}
          loading="eager" draggable={false} onLoad={onAssetLoad} onError={onAssetError} />

        {/* Layer 2: HI,I'm 杨芷琳 */}
        <img ref={textRef} src="/assets/home/box/figma-text.webp" alt="" className="absolute pointer-events-none"
          style={{
            left: pct(788, REF_W), top: pct(726, REF_H),
            width: pct(2924, REF_W), height: pct(637, REF_H),
            zIndex: 1, opacity: 0,
          }}
          loading="eager" draggable={false} onLoad={onTextLoad} onError={onTextLoad} />

        {/* Layer 3: 收纳盒 */}
        <img src="/assets/home/box/ps-box.webp" alt="" className="absolute pointer-events-none"
          style={{ inset: 0, width: '100%', height: '100%', zIndex: 2 }}
          loading="eager" draggable={false} onLoad={onAssetLoad} onError={onAssetError} />

        {/* Layer 4-7: 卡片 — 外层 div 负责呼吸动画，内层 img 通过 CSS 变量响应悬停 */}
        {CARD_ORDER.map((id) => {
          const c = CARD[id];
          return (
            <div key={id} ref={setBreathRef(id)}
              style={{
                position: 'absolute',
                left: pct(c.x, REF_W), top: pct(c.y, REF_H),
                width: pct(c.w, REF_W), height: pct(c.h, REF_H),
                zIndex: c.z,
                willChange: 'transform',
              }}
            >
              <img ref={setCardRef(id)} src={`/assets/home/box/${c.file}`} alt=""
                style={{
                  width: '100%', height: '100%', display: 'block',
                  transform: `translate(var(--x-${id}, 0px), var(--y-${id}, 0px)) scale(var(--s-${id}, 1))`,
                  transition: 'transform 0.06s linear',
                  cursor: 'pointer',
                  willChange: 'transform',
                }}
                loading="eager" draggable={false} onLoad={onAssetLoad} onError={onAssetError}
              />
            </div>
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
              background: 'rgba(255,255,255,0.03)',
              maskImage: 'url(/assets/home/box/figma-glass.webp)',
              WebkitMaskImage: 'url(/assets/home/box/figma-glass.webp)',
              maskSize: '100% 100%',
              WebkitMaskSize: '100% 100%',
            }}
          />
          <img src="/assets/home/box/figma-glass.webp" alt=""
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              maskImage: 'url(/assets/home/box/figma-glass.webp)',
              WebkitMaskImage: 'url(/assets/home/box/figma-glass.webp)',
              maskSize: '100% 100%',
              WebkitMaskSize: '100% 100%',
            }}
            loading="eager" draggable={false} onLoad={onAssetLoad} onError={onAssetError} />
        </div>

        {/* Layer 9: 收纳盒前框 */}
        <img src="/assets/home/box/figma-front.webp" alt="" className="absolute pointer-events-none"
          style={{
            left: pct(2217, REF_W), top: pct(1135, REF_H),
            width: pct(757, REF_W), height: pct(708, REF_H),
            zIndex: 8,
          }}
          loading="eager" draggable={false} onLoad={onAssetLoad} onError={onAssetError} />
      </div>

      {/* Portal 渲染的遮罩+卡片正面 */}
      {cardOverlay}
    </section>
  );
}
