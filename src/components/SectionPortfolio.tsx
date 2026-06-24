/**
 * SectionPortfolio - 个人简介三层合成页面
 * 底层: 自我介绍背景.png
 * 中层: 自我介绍人物2.png
 * 上层: 自我介绍文字2.png
 * GSAP 动效：自然生动、高级感
 */

import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';

function BackgroundLayer() {
  const [loaded, setLoaded] = useState(false);

  return (
    <img
      src="/assets/portfolio/bg.png"
      alt=""
      className="absolute inset-0 w-full h-full"
      style={{
        objectFit: 'contain',
        objectPosition: 'center',
        opacity: loaded ? 1 : 0,
        transition: 'opacity 1.2s ease-out',
      }}
      onLoad={() => setLoaded(true)}
    />
  );
}

function CharacterLayer() {
  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const el = imgRef.current;
    if (!el || !loaded) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(el,
        { y: 40, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 1.2 },
        0.3
      );

      // 呼吸感：scale + y 同步微动
      tl.to(el, {
        scale: 1.008,
        y: -6,
        duration: 2.8,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      }, '>');
    });

    return () => ctx.revert();
  }, [loaded]);

  return (
    <img
      ref={imgRef}
      src="/assets/portfolio/character.png"
      alt=""
      className="absolute inset-0 w-full h-full"
      style={{
        objectFit: 'contain',
        objectPosition: 'center',
        opacity: loaded ? 1 : 0,
        transition: 'opacity 1s ease-out',
      }}
      onLoad={() => setLoaded(true)}
    />
  );
}

function TextOverlay() {
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !loaded) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

      // 入场
      tl.fromTo(el,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 1 },
        0.6
      );

      // 呼吸感：scale + y + filter 三重微动
      tl.to(el, {
        scale: 1.012,
        y: -5,
        duration: 3.2,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      }, '>');
    });

    return () => ctx.revert();
  }, [loaded]);

  return (
    <img
      ref={ref}
      src="/assets/portfolio/text.png"
      alt=""
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{
        objectFit: 'contain',
        objectPosition: 'center',
        opacity: loaded ? 1 : 0,
        transition: 'opacity 0.8s ease-out',
      }}
      onLoad={() => setLoaded(true)}
    />
  );
}

export default function SectionPortfolio() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={sectionRef}
      className="relative w-full min-h-screen overflow-hidden bg-black"
    >
      <BackgroundLayer />
      <CharacterLayer />
      <TextOverlay />
    </div>
  );
}
