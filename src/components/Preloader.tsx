/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
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

export default function Preloader({ onComplete }: PreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [keywordIndex, setKeywordIndex] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    /* 后台预加载首页关键图片，利用预加载等待时间提前下载 */
    const HOME_IMAGES = [
      '/assets/home/box/ref-bg.webp',
      '/assets/home/box/ps-box.webp',
      '/assets/home/box/figma-text.webp',
      '/assets/home/box/figma-glass.webp',
      '/assets/home/box/figma-front.webp',
      '/assets/home/box/ps-card01.webp',
      '/assets/home/box/02卡片_改.webp',
      '/assets/home/box/03卡片_改.webp',
      '/assets/home/box/04卡片.webp',
    ];
    HOME_IMAGES.forEach(src => { const img = new Image(); img.src = src; });

    // Ticker progress count
    let count = 0;
    const interval = setInterval(() => {
      const inc = Math.floor(Math.random() * 8) + 2;
      count = Math.min(count + inc, 100);
      setProgress(count);

      // Rotate brand phrases
      if (count % 12 === 0 && count < 100) {
        setKeywordIndex((prev) => (prev + 1) % BRAND_KEYWORDS.length);
      }

      if (count >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsDone(true);
          setTimeout(onComplete, 800);
        }, 300);
      }
    }, 80);

    return () => clearInterval(interval);
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
          initial={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' }}
          exit={{
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
            transition: { duration: 0.75, ease: [0.76, 0, 0.24, 1] }
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
