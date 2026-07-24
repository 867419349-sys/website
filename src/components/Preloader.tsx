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
  // 首页
  '/assets/home/box/ref-bg.webp',
  '/assets/home/box/ps-box.webp',
  '/assets/home/box/figma-text.webp',
  '/assets/home/box/figma-glass.webp',
  '/assets/home/box/figma-front.webp',
  '/assets/home/box/ps-card01.webp',
  '/assets/home/box/02卡片_改.webp',
  '/assets/home/box/03卡片_改.webp',
  '/assets/home/box/04卡片.webp',
  // 创意作品第二页 - 卡片背景
  '/assets/portfolio-cases/PROJECT.webp',
  '/assets/portfolio-cases/精选作品.webp',
  '/assets/portfolio-cases/01.webp',
  '/assets/portfolio-cases/02.webp',
  '/assets/portfolio-cases/03.webp',
  '/assets/portfolio-cases/04.webp',
  '/assets/portfolio-cases/05.webp',
  '/assets/portfolio-cases/06.webp',
  '/assets/portfolio-cases/07.webp',
  // 创意作品第二页 - 卡片子图
  '/assets/portfolio-cases/01作品.webp',
  '/assets/portfolio-cases/01文字.webp',
  '/assets/portfolio-cases/02作品.webp',
  '/assets/portfolio-cases/02字体.webp',
  '/assets/portfolio-cases/03作品.webp',
  '/assets/portfolio-cases/03字体.webp',
  '/assets/portfolio-cases/04作品.webp',
  '/assets/portfolio-cases/04字体.webp',
  '/assets/portfolio-cases/05作品.webp',
  '/assets/portfolio-cases/05字体.webp',
  '/assets/portfolio-cases/06作品.webp',
  '/assets/portfolio-cases/06字体.webp',
  '/assets/portfolio-cases/07作品.webp',
  '/assets/portfolio-cases/07字体.webp',
  // 创意作品第二页 - 弹窗大图
  '/assets/portfolio-cases/popup/游戏制作.webp',
  '/assets/portfolio-cases/popup/Pats IP.webp',
  '/assets/portfolio-cases/popup/福灵仔.webp',
  '/assets/portfolio-cases/popup/3D作品.webp',
  '/assets/portfolio-cases/popup/3D影音.webp',
];

// 视频也用 fetch 预加载到浏览器缓存
const PRELOAD_VIDEOS = [
  '/assets/portfolio-cases/videos/节日彩蛋.mp4',
  '/assets/portfolio-cases/videos/情景模式.mp4',
];

export default function Preloader({ onComplete }: PreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [keywordIndex, setKeywordIndex] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const completedRef = useRef(false);

  useEffect(() => {
    if (completedRef.current) return;
    const imgCount = PRELOAD_IMAGES.length;
    const vidCount = PRELOAD_VIDEOS.length;
    const total = imgCount + vidCount;
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

    // 追踪每张图片实际加载
    PRELOAD_IMAGES.forEach(src => {
      const img = new Image();
      img.onload = onOneLoaded;
      img.onerror = onOneLoaded;
      img.src = src;
    });

    // 追踪视频预加载
    PRELOAD_VIDEOS.forEach(src => {
      fetch(src, { mode: 'same-origin' })
        .then(() => onOneLoaded())
        .catch(() => onOneLoaded());
    });

    // 超过 15 秒强制结束（视频较大需要更多时间）
    const forceTimer = setTimeout(() => {
      if (!completedRef.current) finish();
    }, 15000);

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
