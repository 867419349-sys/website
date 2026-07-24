/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';

interface PreloaderProps {
  onComplete: () => void;
}

const BRAND_KEYWORDS = [
  'LET AI ENTER REAL PRODUCT EXPERIENCE',
  'AIGC WORKFLOW CREATION',
  'MOTION FOR BUSINESS',
  '3D INTERACTION DEVELOPMENT',
  'NEO-BRUTALISM UX DESIGN',
  'YANG ZHILIN PORTFOLIO v2.0',
  'GSAP CREATIVE ANIMATIONS',
  'LET US MAKE A SPLASH',
  'INTELLIGENT EXPERIENCE COGNITION'
];

const PRELOAD_IMAGES = [
  // 首页核心图层 (SectionHome.tsx Layer 1-9)
  '/assets/home/box/ref-bg.png',
  '/assets/home/box/figma-text.png',
  '/assets/home/box/ps-box.png',
  '/assets/home/box/04卡片.png',
  '/assets/home/box/03卡片_改.png',
  '/assets/home/box/02卡片_改.png',
  '/assets/home/box/ps-card01.png',
  '/assets/home/box/figma-glass.png',
  '/assets/home/box/figma-front.png',
  // 卡片弹出正面图 + 按钮 (SectionHome 卡片点击交互)
  '/assets/home/box/01卡片正面背景.png',
  '/assets/home/box/02卡片正面_改.png',
  '/assets/home/box/03卡片正面.png',
  '/assets/home/box/04卡片正面.png',
  '/assets/home/box/01按钮.png',
  '/assets/home/box/02按钮.png',
  '/assets/home/box/03按钮.png',
  '/assets/home/box/04按钮.png',
];

export default function Preloader({ onComplete }: PreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [keywordIndex, setKeywordIndex] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const completedRef = useRef(false);

  useEffect(() => {
    if (completedRef.current) return;
    const imgCount = PRELOAD_IMAGES.length;
    const total = imgCount;
    let loaded = 0;
    let keywordTimer: ReturnType<typeof setInterval> | null = null;

    const finish = () => {
      if (completedRef.current) return;
      completedRef.current = true;
      if (keywordTimer) clearInterval(keywordTimer);
      setProgress(100);
      setTimeout(() => setIsDone(true), 350);
      setTimeout(() => onComplete(), 1000);
    };

    const onOneLoaded = () => {
      loaded++;
      setProgress(Math.round((loaded / total) * 100));
      if (loaded >= total) finish();
    };

    // 分批加载：每批 6 张间隔 16ms，防止缓存命中时 onload 同步触发被 React 18 批处理合并
    const BATCH_SIZE = 6;
    const BATCH_GAP = 16;
    const loadImageBatch = (startIndex: number) => {
      const end = Math.min(startIndex + BATCH_SIZE, imgCount);
      for (let i = startIndex; i < end; i++) {
        const img = new Image();
        img.onload = onOneLoaded;
        img.onerror = onOneLoaded;
        img.src = PRELOAD_IMAGES[i];
      }
      if (end < imgCount) {
        setTimeout(() => loadImageBatch(end), BATCH_GAP);
      }
    };
    loadImageBatch(0);

    // 超过 10 秒强制结束（约 17 张图片，~1MB）
    const forceTimer = setTimeout(() => {
      if (!completedRef.current) finish();
    }, 10000);

    // 关键词轮换
    keywordTimer = setInterval(() => {
      setKeywordIndex((prev) => (prev + 1) % BRAND_KEYWORDS.length);
    }, 600);

    return () => {
      clearTimeout(forceTimer);
      if (keywordTimer) clearInterval(keywordTimer);
    };
  }, [onComplete]);

  // GSAP animation for the counter or background
  useEffect(() => {
    gsap.fromTo(
      '.preload-title',
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power4.out', stagger: 0.1 }
    );
  }, []);

  return (
    <AnimatePresence>
      {!isDone && (
        <motion.div
          initial={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{
            opacity: 0,
            scale: 1.04,
            filter: 'blur(8px)',
            transition: { duration: 0.65, ease: [0.4, 0, 0.2, 1] }
          }}
          className="fixed inset-0 bg-[#0c0c0e] text-white z-[9999] flex flex-col justify-between p-8 md:p-16 select-none font-sans"
        >
          {/* Top Row: Designer Info */}
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="preload-title text-[#d2ff55] font-mono tracking-widest text-xs uppercase font-medium">
                YANG ZHILIN / PORTFOLIO
              </span>
              <span className="preload-title text-neutral-400 font-mono text-[10px] mt-1">
                AI EXPERIENCE & UX RESEARCH
              </span>
            </div>
            <div className="text-right">
              <span className="preload-title font-mono text-neutral-500 text-xs text-right block">
                LOC: CN / SHANGHAI
              </span>
              <span className="preload-title font-mono text-neutral-500 text-[10px] text-right block mt-1">
                SYS: ACTIVE CONTAINER
              </span>
            </div>
          </div>

          {/* Central Progress Banner */}
          <div className="my-auto py-12 flex flex-col justify-center items-center">
            <div className="w-full max-w-lg mb-8 bg-neutral-900 border border-neutral-800 h-[6px] rounded-full overflow-hidden relative">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1, ease: 'easeOut' }}
                className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-[#d2ff55] via-[#ff55bb] to-[#5d59f7]"
              />
            </div>
            
            <div className="flex items-baseline space-x-4 mb-4">
              <span className="font-mono text-xs text-neutral-500 font-bold uppercase tracking-widest">
                PROGRESS
              </span>
              <h1 className="text-7xl md:text-9xl font-sans font-black tracking-tighter tabular-nums text-white select-none">
                {progress.toString().padStart(3, '0')}%
              </h1>
            </div>

            {/* Keyword Rotator with animated key */}
            <div className="h-6 overflow-hidden flex justify-center items-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={keywordIndex}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="text-xs md:text-sm font-mono text-[#d2ff55] uppercase tracking-widest text-center"
                >
                  ● {BRAND_KEYWORDS[keywordIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          {/* Footer details */}
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end border-t border-neutral-900 pt-6">
            <div className="text-xs text-neutral-500 font-mono text-center md:text-left mb-4 md:mb-0">
              © 2026 YANG ZHILIN & ALLEY. FULL INTERACTIVITIES ENABLED.
            </div>
            <div className="flex space-x-6 text-xs text-neutral-400 font-mono">
              <span className="hover:text-white transition-colors duration-200">MOTION v12</span>
              <span>●</span>
              <span className="hover:text-white transition-colors duration-200">GSAP READY</span>
              <span>●</span>
              <span className="hover:text-white transition-colors duration-200">AWARDS STYLE v2</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
