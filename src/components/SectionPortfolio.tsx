/**
 * SectionPortfolio - 个人简介五层合成页面
 * 底层: 自我介绍背景2.png
 * 第二层: DESIGN.png
 * 第三层: 自我介绍人物3.png
 * 第四层: icon.png (鼠标跟随 + 点击感)
 * 最上层: 自我介绍文字3.png (鼠标跟随 + 点击感)
 * GSAP 动效：逐层入场 + 呼吸感 + 鼠标视差
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import gsap from 'gsap';

export default function SectionPortfolio() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLImageElement>(null);
  const designRef = useRef<HTMLImageElement>(null);
  const charRef = useRef<HTMLImageElement>(null);
  const iconRef = useRef<HTMLImageElement>(null);
  const textRef = useRef<HTMLImageElement>(null);

  const [bgReady, setBgReady] = useState(false);
  const [designReady, setDesignReady] = useState(false);
  const [charReady, setCharReady] = useState(false);
  const [iconReady, setIconReady] = useState(false);
  const [textReady, setTextReady] = useState(false);

  const allReady = bgReady && designReady && charReady && iconReady && textReady;

  // 鼠标跟随 + 点击感
  useEffect(() => {
    if (!allReady) return;

    const section = sectionRef.current;
    const icon = iconRef.current;
    const text = textRef.current;
    if (!section) return;

    const design = designRef.current;
    const designXTo = design ? gsap.quickTo(design, 'x', { duration: 0.8, ease: 'power3.out' }) : null;
    const designYTo = design ? gsap.quickTo(design, 'y', { duration: 0.8, ease: 'power3.out' }) : null;
    const iconXTo = icon ? gsap.quickTo(icon, 'x', { duration: 0.7, ease: 'power3.out' }) : null;
    const iconYTo = icon ? gsap.quickTo(icon, 'y', { duration: 0.7, ease: 'power3.out' }) : null;
    const textXTo = text ? gsap.quickTo(text, 'x', { duration: 0.7, ease: 'power3.out' }) : null;
    const textYTo = text ? gsap.quickTo(text, 'y', { duration: 0.7, ease: 'power3.out' }) : null;

    const onMouseMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const nx = (e.clientX - cx) / (rect.width / 2);
      const ny = (e.clientY - cy) / (rect.height / 2);

      // DESIGN + icon 在左侧
      const leftWeight = gsap.utils.clamp(0, 1, 1 - Math.abs(nx + 0.3) * 1.2);
      // 文字在右侧
      const rightWeight = gsap.utils.clamp(0, 1, 1 - Math.abs(nx - 0.3) * 1.2);

      const range = 16;

      designXTo?.(nx * range * leftWeight);
      designYTo?.(ny * range * leftWeight);
      iconXTo?.(nx * range * leftWeight);
      iconYTo?.(ny * range * leftWeight);
      textXTo?.(nx * range * rightWeight);
      textYTo?.(ny * range * rightWeight);
    };

    // 柔和点击
    const onClick = () => {
      const clickTl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });

      if (icon) {
        clickTl.to(icon, { scale: 0.97, duration: 0.2 }, 0)
               .to(icon, { scale: 1, duration: 0.5, ease: 'power2.out' }, '>');
      }
      if (text) {
        clickTl.to(text, { scale: 0.98, duration: 0.2 }, 0)
               .to(text, { scale: 1, duration: 0.5, ease: 'power2.out' }, '>');
      }
    };

    section.addEventListener('mousemove', onMouseMove);
    section.addEventListener('click', onClick);

    return () => {
      section.removeEventListener('mousemove', onMouseMove);
      section.removeEventListener('click', onClick);
    };
  }, [allReady]);

  // 入场 + 呼吸动效
  useEffect(() => {
    if (!allReady) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(sectionRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.6 },
        0
      );

      tl.fromTo(bgRef.current,
        { scale: 1.04 },
        { scale: 1, duration: 1.5, ease: 'power2.out' },
        0
      );

      tl.fromTo(designRef.current,
        { x: -60, opacity: 0 },
        { x: 0, opacity: 1, duration: 1, ease: 'power3.out' },
        0.2
      );

      tl.fromTo(charRef.current,
        { y: 50, opacity: 0, scale: 0.94 },
        { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: 'power3.out' },
        0.4
      );

      // Icon 框框入场
      tl.fromTo(iconRef.current,
        { scale: 0.4, opacity: 0, rotation: -12 },
        { scale: 1, opacity: 1, rotation: 0, duration: 1.3, ease: 'elastic.out(1, 0.5)' },
        0.55
      );

      // 文字入场
      tl.fromTo(textRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out' },
        0.75
      );

      // === 呼吸感动效（不与鼠标跟随冲突的属性） ===
      tl.to(iconRef.current, {
        rotation: 2,
        duration: 2.4,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      }, '>+0.5');

      tl.to(textRef.current, {
        scale: 1.008,
        duration: 3,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      }, '<');

      tl.to(bgRef.current, {
        scale: 1.008, duration: 4.5, ease: 'sine.inOut', yoyo: true, repeat: -1,
      }, '<');

      tl.to(designRef.current, {
        scale: 1.006, duration: 4, ease: 'sine.inOut', yoyo: true, repeat: -1,
      }, '<');

      tl.to(charRef.current, {
        y: -6, scale: 1.005, duration: 3.5, ease: 'sine.inOut', yoyo: true, repeat: -1,
      }, '<+0.2');
    });

    return () => ctx.revert();
  }, [allReady]);

  const imgStyle = (ready: boolean): React.CSSProperties => ({
    objectFit: 'contain',
    objectPosition: 'center',
    opacity: ready ? 1 : 0,
    transition: 'opacity 0.6s ease-out',
  });

  return (
    <div
      ref={sectionRef}
      className="relative w-full min-h-screen overflow-hidden bg-black cursor-pointer"
    >
      <img ref={bgRef} src="/assets/portfolio/bg2.png" alt=""
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={imgStyle(bgReady)} onLoad={() => setBgReady(true)} />

      <img ref={designRef} src="/assets/portfolio/design.png" alt=""
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={imgStyle(designReady)} onLoad={() => setDesignReady(true)} />

      <img ref={charRef} src="/assets/portfolio/character3.png" alt=""
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={imgStyle(charReady)} onLoad={() => setCharReady(true)} />

      <img ref={iconRef} src="/assets/portfolio/icon.png" alt=""
        className="absolute inset-0 w-full h-full"
        style={{ ...imgStyle(iconReady), cursor: 'pointer' }}
        onLoad={() => setIconReady(true)} />

      <img ref={textRef} src="/assets/portfolio/text3.png" alt=""
        className="absolute inset-0 w-full h-full"
        style={{ ...imgStyle(textReady), cursor: 'pointer' }}
        onLoad={() => setTextReady(true)} />
    </div>
  );
}
