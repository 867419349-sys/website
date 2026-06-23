/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import gsap from 'gsap';
import { EDUCATION_DATA, WORK_DATA, HIGHLIGHTS, SKILLS_DATA } from '../data';
import { sounds } from '../utils/audio';

export default function SectionPortfolio() {
  const [bubbleClicks, setBubbleClicks] = useState(0);

  // Mini interactive egg trigger on clicking the 3D smiley spheres
  const handleSmileyClick = () => {
    sounds.playBubble();
    setBubbleClicks((prev) => prev + 1);
  };

  useEffect(() => {
    // GSAP animation for text character skew-reveal
    gsap.fromTo(
      '.reveal-header',
      { y: 30, skewY: 5, opacity: 0 },
      { y: 0, skewY: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.15 }
    );
  }, []);

  return (
    <div className="w-full bg-[#d2ff55] text-black min-h-screen relative overflow-hidden py-12 px-4 md:px-12 lg:px-20 font-sans flex flex-col justify-center">
      
      {/* Background Giant Text "DESIGN" */}
      <h1 className="absolute top-[10%] left-[-5%] right-[-5%] text-center text-[15vw] md:text-[18vw] font-black tracking-tighter text-white/55 select-none pointer-events-none uppercase font-sans leading-none z-0">
        DESIGN
      </h1>

      {/* Grid Pattern Mesh */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:32px_32px]" />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10 pt-16">
        
        {/* LEFT COLUMN: INTRO CARD */}
        <div className="lg:col-span-4 flex flex-col items-start z-20">
          
          {/* Header Profile Icon */}
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 3 }}
            className="flex items-center space-x-3 bg-black text-white px-4 py-1.5 rounded-full border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-6 select-none"
          >
            <img 
              src="/src/assets/images/yang_zhilin_avatar_1781774163978.jpg" 
              alt="Yang Zhilin" 
              className="w-8 h-8 rounded-full border border-white/40 object-cover object-center"
              referrerPolicy="no-referrer"
            />
            <span className="text-xs font-mono tracking-widest font-bold uppercase">YANG ZHILIN</span>
          </motion.div>

          {/* Core Greeting Header with GSAP Reveal */}
          <div className="overflow-hidden">
            <h2 className="reveal-header text-5xl md:text-6xl font-black tracking-tight leading-[1] font-sans">
              你好，
            </h2>
            <h2 className="reveal-header text-5xl md:text-6xl font-black tracking-tight leading-[1.2] font-sans mt-1">
              我是<span className="text-black bg-white inline-block px-2 py-0.5 rounded-md border-2 border-black ml-1">杨芷琳</span>
            </h2>
          </div>

          {/* Purple Experience Ribbon */}
          <motion.div 
            whileHover={{ rotate: -2, scale: 1.05 }}
            className="mt-6 flex items-center space-x-2 bg-[#b388ff] text-black border-2 border-black rounded-lg px-4 py-2 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-[-1deg]"
          >
            <span className="text-sm font-sans flex items-center gap-1.5">
              <span>✦</span> AI体验设计师
            </span>
          </motion.div>

          {/* Secondary Subtitle */}
          <div className="mt-6 text-xs font-mono font-bold tracking-wider text-black select-none uppercase">
            LET AI ENTER REAL PRODUCT EXPERIENCE
          </div>

          {/* Decorator Diagonal Slashes */}
          <div className="text-2xl font-black text-black tracking-widest my-4 select-none">
            ////
          </div>

          {/* Description */}
          <p className="text-xs md:text-sm font-medium leading-relaxed max-w-sm text-neutral-800">
            关注 AI 视觉生成与真实产品体验落地的 AI 体验设计师。曾参与智能座舱与游戏交互项目，完整覆盖需求拆解、交互逻辑、AI视觉生成与 3D 场景交付的全流程。
          </p>

          {/* Spinning Retro Circle Text Badge & Graphic */}
          <div className="mt-8 flex items-center space-x-6">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <path
                    id="circlePath"
                    d="M 50,50 m -35,0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0"
                    fill="none"
                  />
                  <text className="font-mono text-[9px] font-bold fill-black tracking-widest">
                    <textPath xlinkHref="#circlePath">
                      ● UI EXPERIENCE DESIGNER ● LIN YANG 
                    </textPath>
                  </text>
                </svg>
              </motion.div>
              <div className="absolute w-8 h-8 rounded-full border-2 border-black bg-white flex items-center justify-center shadow-sm">
                <span className="text-md font-black">✦</span>
              </div>
            </div>

            {/* Custom Interactive Click Me Sign */}
            <div className="flex flex-col">
              <span className="text-[10px] font-mono tracking-widest font-extrabold text-neutral-700">EXPERIENCES</span>
              <span className="text-xs font-sans font-bold text-neutral-900 mt-1">
                Huawei & Lilith Game Studio
              </span>
            </div>
          </div>
        </div>

        {/* CENTER INTERACTION: DYNAMIC CHARACTER IMAGE & FLOATING ELEMENTS */}
        <div className="lg:col-span-4 flex flex-col justify-center items-center relative min-h-[400px] z-10 w-full">
          
          {/* Radial Gradient Halo behind her */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 md:w-80 md:h-80 rounded-full bg-gradient-to-tr from-[#ff55bb] via-[#b388ff] to-[#5d59f7]/10 opacity-35 blur-2xl z-0" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 md:w-64 md:h-64 rounded-full bg-[#ff5bb0] border border-black z-0 pointer-events-none scale-90" />

          {/* Interactive Floating AI x DESIGN Ribbon sticker */}
          <motion.div
            drag
            dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileDrag={{ scale: 0.95 }}
            onClick={() => sounds.playClick()}
            className="absolute top-[15%] right-[10%] bg-[#e0fc28] text-black text-xs font-bold font-mono px-3 py-1.5 border-2 border-black rounded shadow-[2px_2px_0px_0px_#000] rotate-[8deg] z-40 cursor-grab active:cursor-grabbing select-none"
            data-cursor-text="GRAB ME"
          >
            AI × DESIGN ✦
          </motion.div>

          {/* Interactive Floating Smiley Spheres (Image 2 item) */}
          <motion.div
            style={{ x: -160, y: -80 }}
            animate={{ y: [-85, -75, -85], rotate: [0, 15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            onClick={handleSmileyClick}
            data-cursor-text="POP"
            className="absolute z-20 w-16 h-16 rounded-full bg-gradient-to-tr from-[#b388ff] to-[#ff55bb] border-2 border-black flex flex-col justify-center items-center cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:scale-110 active:scale-95 transition-transform"
          >
            <span className="text-xl font-bold select-none">꩜</span>
            <span className="text-[7.5px] font-mono font-black tracking-tighter mt-0.5">SMILE</span>
          </motion.div>

          <motion.div
            style={{ x: 140, y: 150 }}
            animate={{ y: [145, 155, 145], rotate: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            onClick={handleSmileyClick}
            data-cursor-text="SQUISH"
            className="absolute z-20 w-14 h-14 rounded-full bg-gradient-to-b from-[#e2fc52] to-[#b388ff] border-2 border-black flex flex-col justify-center items-center cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:scale-110 active:scale-95 transition-transform"
          >
            <span className="text-xl font-bold select-none">✦</span>
          </motion.div>

          {/* MAIN CUTOUT PHOTO */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="relative z-30 w-full max-w-[280px] md:max-w-[340px] aspect-[4/5] overflow-visible rounded-[24px] pointer-events-none select-none"
          >
            <img
              src="/src/assets/images/yang_zhilin_avatar_1781774163978.jpg"
              alt="Yang Zhilin cutout illustration"
              className="w-full h-full object-cover rounded-[24px] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-neutral-900 filter drop-shadow-[0_10px_15px_rgba(0,0,0,0.3)] scale-105 select-none pointer-events-none"
              referrerPolicy="no-referrer"
            />
          </motion.div>

          {/* Star decorations */}
          <div className="absolute top-[80%] left-[8%] z-40 text-black text-4xl select-none animate-spin" style={{ animationDuration: '8s' }}>
            ✶
          </div>
          <div className="absolute top-[20%] left-[10%] z-40 text-[#ff55bb] text-2xl select-none animate-bounce">
            ✸
          </div>
        </div>

        {/* RIGHT COLUMN: BENTO INTERACTIVE CARDS */}
        <div className="lg:col-span-4 flex flex-col space-y-6 z-20 w-full">
          
          {/* EDUCATION CARD */}
          <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            onMouseEnter={() => sounds.playHover()}
            onClick={() => sounds.playClick()}
            className="reveal-on-scroll border-2 border-black rounded-[18px] bg-white text-black p-5 shadow-[4px_4px_0px_0px_#000] cursor-pointer"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 rounded-full border border-black bg-[#b388ff] flex items-center justify-center">
                <span className="text-sm font-bold">🎓</span>
              </div>
              <h3 className="font-sans font-black text-md tracking-tight uppercase">教育背景</h3>
            </div>
            {EDUCATION_DATA.map((item) => (
              <div key={item.id} className="text-left font-sans">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-mono text-xs font-black text-neutral-500">{item.period}</span>
                  <span className="font-bold text-sm text-neutral-900">{item.organization}</span>
                </div>
                <div className="font-mono text-xs font-bold text-neutral-800 mb-2">{item.role}</div>
                <p className="text-xs leading-relaxed text-neutral-700">{item.description}</p>
              </div>
            ))}
          </motion.div>

          {/* WORK EXPERIENCE CARD */}
          <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            onMouseEnter={() => sounds.playHover()}
            onClick={() => sounds.playClick()}
            className="reveal-on-scroll border-2 border-black rounded-[18px] bg-white text-black p-5 shadow-[4px_4px_0px_0px_#000] cursor-pointer"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 rounded-full border border-black bg-[#ff55bb] flex items-center justify-center">
                <span className="text-sm">💼</span>
              </div>
              <h3 className="font-sans font-black text-md tracking-tight uppercase">工作经历</h3>
            </div>
            <div className="space-y-4">
              {WORK_DATA.map((item, index) => (
                <div key={item.id} className={`text-left font-sans ${index > 0 ? 'border-t border-neutral-100 pt-3' : ''}`}>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-mono text-[10.5px] font-black text-neutral-500">{item.period}</span>
                    <span className="font-bold text-sm text-neutral-900">{item.organization}</span>
                  </div>
                  <div className="font-mono text-[11px] font-bold text-neutral-800 mb-1">{item.role}</div>
                  <p className="text-xs leading-relaxed text-neutral-700">{item.description}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* highlights / capabilities */}
          <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            onMouseEnter={() => sounds.playHover()}
            onClick={() => sounds.playClick()}
            className="reveal-on-scroll border-2 border-black rounded-[18px] bg-white text-black p-5 shadow-[4px_4px_0px_0px_#000] cursor-pointer"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 rounded-full border border-black bg-[#d2ff55] flex items-center justify-center">
                <span className="text-sm font-bold">⭐</span>
              </div>
              <h3 className="font-sans font-black text-md tracking-tight uppercase">能力亮点</h3>
            </div>
            <div className="grid grid-cols-2 gap-2 text-left">
              {HIGHLIGHTS.map((item) => (
                <div key={item.id} className="p-2 border border-black bg-neutral-50/50 rounded-lg hover:bg-[#b388ff]/10 transition-colors">
                  <span className="text-xs font-sans font-extrabold text-neutral-900">● {item.title}</span>
                  <p className="text-[10px] leading-tight text-neutral-600 mt-1 select-none">{item.description}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* SKILLS & TOOLS CARD */}
          <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            onMouseEnter={() => sounds.playHover()}
            onClick={() => sounds.playClick()}
            className="reveal-on-scroll border-2 border-black rounded-[18px] bg-white text-black p-5 shadow-[4px_4px_0px_0px_#000] cursor-pointer"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 rounded-full border border-black bg-[#5c56fb] text-white flex items-center justify-center">
                <span className="text-sm font-bold">🛠️</span>
              </div>
              <h3 className="font-sans font-black text-md tracking-tight uppercase">工具技能</h3>
            </div>
            
            {SKILLS_DATA.map((cat) => (
              <div key={cat.id} className="text-left font-sans">
                <div className="text-xs font-mono font-bold text-neutral-800 mb-2">
                  {cat.skills.join(' / ')}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {cat.badges.map((badge, bidx) => (
                    <span 
                      key={bidx} 
                      className={`text-[10px] font-mono font-extrabold tracking-wider px-2.5 py-1 border border-black rounded-full shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] ${
                        badge.group === 'soft' 
                          ? 'bg-[#ff55bb]/35 hover:bg-[#ff55bb]/50' 
                          : 'bg-[#b388ff]/35 hover:bg-[#b388ff]/50'
                      } transition-colors duration-200`}
                    >
                      {badge.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>

        </div>

      </div>

      {/* Scroll indicator with click navigation */}
      <div className="mt-12 flex justify-center w-full z-10">
        <div className="flex flex-col items-center select-none font-sans bg-black text-white px-4 py-2 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_#fff]">
          <span className="text-[10px] tracking-widest font-black uppercase">SCROLL DOWN TO MAKE SPLASH</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="text-xs text-[#d2ff55] mt-1 font-bold"
          >
            ▼
          </motion.div>
        </div>
      </div>

    </div>
  );
}
