/**
 * SectionHome - 四层合成首页
 * 最底层: 底部背景JPG (适配大小)
 * 第二层: 底板PNG (静态背景)
 * 第三层: 文字PNG (动态浮动)
 * 最上层: 序列帧视频 (Alpha透明通道)
 */

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'motion/react';

function SequenceVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const play = () => {
      video.play().catch(() => {});
      setReady(true);
    };

    if (video.readyState >= 2) {
      play();
    } else {
      video.addEventListener('loadeddata', play, { once: true });
      video.load();
    }
  }, []);

  return (
    <video
      ref={videoRef}
      src="/assets/home/sequence-purple.webm"
      autoPlay
      muted
      loop
      playsInline
      className="absolute inset-0 w-full h-full"
      style={{
        objectFit: 'contain',
        opacity: ready ? 1 : 0,
        transition: 'opacity 0.6s ease-out',
      }}
    />
  );
}

const textGradientStyle = `
  @keyframes gradientShine {
    0% { background-position: 0% 30%; }
    50% { background-position: 0% 70%; }
    100% { background-position: 0% 30%; }
  }
  @keyframes textFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }
`;

function AnimatedTextLayer() {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, ease: 'easeOut' }}
    >
      <style>{textGradientStyle}</style>
      <div className="relative w-full h-full">
        {/* 底层：HI, I'm 纯黑 + 静止不动 */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            WebkitMaskImage: 'url(/assets/home/name-text.png)',
            WebkitMaskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskImage: 'url(/assets/home/name-text.png)',
            maskSize: 'contain',
            maskRepeat: 'no-repeat',
            maskPosition: 'center',
            background: 'black',
          }}
        />
        {/* 上层：仅杨芷琳区域显示流动渐变 + 浮动动画 */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            clipPath: 'inset(44% 0 0 0)',
            WebkitClipPath: 'inset(44% 0 0 0)',
            WebkitMaskImage: 'url(/assets/home/name-text.png)',
            WebkitMaskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskImage: 'url(/assets/home/name-text.png)',
            maskSize: 'contain',
            maskRepeat: 'no-repeat',
            maskPosition: 'center',
            background:
              'linear-gradient(to bottom, #dbff76 0%, #afcc5c 25%, #dbff76 50%, #afcc5c 75%, #dbff76 100%)',
            backgroundSize: '100% 200%',
            animation: 'textFloat 4s ease-in-out infinite, gradientShine 5s ease-in-out infinite',
          }}
        />
      </div>
    </motion.div>
  );
}

function BottomBackground() {
  const [loaded, setLoaded] = useState(false);

  return (
    <img
      src="/assets/home/bottom-bg.jpg"
      alt=""
      className="absolute inset-0 w-full h-full"
      style={{
        objectFit: 'cover',
        opacity: loaded ? 1 : 0,
        transition: 'opacity 0.8s ease-out',
      }}
      onLoad={() => setLoaded(true)}
    />
  );
}

function BasePlate() {
  const [loaded, setLoaded] = useState(false);

  return (
    <img
      src="/assets/home/base-plate.png"
      alt=""
      className="absolute inset-0 w-full h-full"
      style={{
        objectFit: 'contain',
        opacity: loaded ? 1 : 0,
        transition: 'opacity 1s ease-out',
      }}
      onLoad={() => setLoaded(true)}
    />
  );
}

export default function SectionHome() {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ minHeight: '100vh', background: '#1a1040' }}
    >
      {/* 第一层：底部背景 (最底层，适配大小) */}
      <BottomBackground />

      {/* 第二层：底板 */}
      <BasePlate />

      {/* 第三层：文字 (中间层，动态浮动) */}
      <AnimatedTextLayer />

      {/* 第四层：序列帧视频 (最上层，Alpha透明通道) */}
      <SequenceVideo />
    </section>
  );
}
