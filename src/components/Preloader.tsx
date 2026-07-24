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
  '/assets/home/base-plate.webp',
  '/assets/home/bottom-base.webp',
  '/assets/home/bottom-bg.jpg',
  '/assets/home/bottom-bg.webp',
  '/assets/home/box/01卡片.webp',
  '/assets/home/box/01卡片正面背景.webp',
  '/assets/home/box/01按钮.webp',
  '/assets/home/box/02.webp',
  '/assets/home/box/02卡片.webp',
  '/assets/home/box/02卡片_改.webp',
  '/assets/home/box/02卡片正面_改.webp',
  '/assets/home/box/02按钮.webp',
  '/assets/home/box/03卡片.webp',
  '/assets/home/box/03卡片_改.webp',
  '/assets/home/box/03卡片正面.webp',
  '/assets/home/box/03按钮.webp',
  '/assets/home/box/04卡片.webp',
  '/assets/home/box/04卡片正面.webp',
  '/assets/home/box/04按钮.webp',
  '/assets/home/box/bg-new.webp',
  '/assets/home/box/bg.webp',
  '/assets/home/box/box-front-new.webp',
  '/assets/home/box/box-front.webp',
  '/assets/home/box/box-new.webp',
  '/assets/home/box/box.webp',
  '/assets/home/box/card-front-01.webp',
  '/assets/home/box/card-front-02.webp',
  '/assets/home/box/card-front-03.webp',
  '/assets/home/box/card-front-04.webp',
  '/assets/home/box/card01-new.webp',
  '/assets/home/box/card01.webp',
  '/assets/home/box/card02-new.webp',
  '/assets/home/box/card02.webp',
  '/assets/home/box/card03-new.webp',
  '/assets/home/box/card03.webp',
  '/assets/home/box/card04-new.webp',
  '/assets/home/box/card04-test.webp',
  '/assets/home/box/card04.webp',
  '/assets/home/box/figma-base.webp',
  '/assets/home/box/figma-bg-new.webp',
  '/assets/home/box/figma-bg.webp',
  '/assets/home/box/figma-box-front-mask.webp',
  '/assets/home/box/figma-box-front.webp',
  '/assets/home/box/figma-box-new.webp',
  '/assets/home/box/figma-box.webp',
  '/assets/home/box/figma-card01-mask.webp',
  '/assets/home/box/figma-card01.webp',
  '/assets/home/box/figma-card02.webp',
  '/assets/home/box/figma-card03.webp',
  '/assets/home/box/figma-card04.webp',
  '/assets/home/box/figma-front.webp',
  '/assets/home/box/figma-full.webp',
  '/assets/home/box/figma-glass-box-mask.webp',
  '/assets/home/box/figma-glass-new.webp',
  '/assets/home/box/figma-glass.webp',
  '/assets/home/box/figma-text.webp',
  '/assets/home/box/full-frame.webp',
  '/assets/home/box/glass-box-new.webp',
  '/assets/home/box/glass-box.webp',
  '/assets/home/box/glass.webp',
  '/assets/home/box/group1.webp',
  '/assets/home/box/ps-bg.webp',
  '/assets/home/box/ps-box-front.webp',
  '/assets/home/box/ps-box.webp',
  '/assets/home/box/ps-card01.webp',
  '/assets/home/box/ps-card02.webp',
  '/assets/home/box/ps-card03.webp',
  '/assets/home/box/ps-card04.webp',
  '/assets/home/box/ps-glass.webp',
  '/assets/home/box/ps-text.webp',
  '/assets/home/box/ref-bg.webp',
  '/assets/home/box/ref-full.webp',
  '/assets/home/box/text-new.webp',
  '/assets/home/box/前收纳盒.webp',
  '/assets/home/box/前毛玻璃.webp',
  '/assets/home/box/收纳盒.webp',
  '/assets/home/box/收纳盒完整.webp',
  '/assets/home/box/文字参考.webp',
  '/assets/home/box/背景.webp',
  '/assets/home/cards/ChatGPT Image 2026年6月12日 14_49_33.webp',
  '/assets/home/cards/ChatGPT Image 2026年6月12日 14_52_35.webp',
  '/assets/home/cards/ChatGPT Image 2026年6月12日 15_00_14.webp',
  '/assets/home/cards/ChatGPT Image 2026年6月12日 15_05_22.webp',
  '/assets/home/homepage-ref.webp',
  '/assets/home/name-text-ref.webp',
  '/assets/home/name-text.webp',
  '/assets/home/stroke-ref.webp',
  '/assets/home/title-text.webp',
  '/assets/home/triggers/01.webp',
  '/assets/home/triggers/02.webp',
  '/assets/home/triggers/03.webp',
  '/assets/home/triggers/04.webp',
  '/assets/home/triggers/zone-01.webp',
  '/assets/home/triggers/zone-02.webp',
  '/assets/home/triggers/zone-03.webp',
  '/assets/home/triggers/zone-04.webp',
  '/assets/instagram_asset_bottle_1781774227848.webp',
  '/assets/lanyard/lanyard.webp',
  '/assets/make_a_splash_can_1781774201107.webp',
  '/assets/yang_zhilin_avatar_1781774163978.webp'
];

// 视频也用 fetch 预加载到浏览器缓存
const PRELOAD_VIDEOS = [
  '/assets/home/final-effect.mp4',
  '/assets/home/home-effect.mp4'
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

    // 超过 20 秒强制结束（首页资源约 6MB，CDN 下通常 2-5 秒）
    const forceTimer = setTimeout(() => {
      if (!completedRef.current) finish();
    }, 20000);

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
