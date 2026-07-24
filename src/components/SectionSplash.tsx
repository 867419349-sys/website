/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion, useMotionValue, AnimatePresence } from 'motion/react';
import { sounds } from '../utils/audio';
import GradualBlur from './GradualBlur';

interface ProjectCase {
  id: string;
  title: string;
  subtitle: string;
  desc: string;
  tag: string;
  image: string;
  likes: number;
  emoji: string;
  spec: string;
  badge: string;
}

const PROJECT_CASES: ProjectCase[] = [
  {
    id: 'case-1',
    title: 'AI 视觉生成系统',
    subtitle: '面向智能座舱的 AIGC 视觉生产流程建构',
    desc: '在车机视觉项目中，我参与搭建面向智能座舱的 AI 视觉生产流程。项目初期，AI 生成结果存在风格随机、材质不稳定、车型还原度不足、难以批量交付等问题。我对流程进行系统化升级：通过 Prompt 结构化、LoRA 模型训练、垫图控制、风格迁移和 ComfyUI 节点搭建，极大提高了生成结果的可控性。最终形成了支持车型替换、光影重绘、材质迁移、构图优化的 AI 工作流。',
    tag: 'COMFYUI / LORA / SYSTEM',
    image: '/assets/make_a_splash_can_1781774201107.webp',
    likes: 4578,
    emoji: '⚙️',
    spec: '支持车型替换、光影重绘、材质迁移与构图批量可控生产',
    badge: '稳定性与可控性'
  },
  {
    id: 'case-2',
    title: '车机节日桌面',
    subtitle: '特定节点中关注惊喜与沉浸的多端体验设计',
    desc: '节日桌面项目关注用户在特定时间节点中的情绪体验。相比普通车机壁纸，节日视觉需要同时具备节日氛围、惊喜感、真实感和屏幕适配性。我从节日主题、情绪关键词、主体元素、背景空间和镜头语言出发，完成 Prompt Evolution，并通过多轮 AI 生成与控制实现画面的柔和氛围与一致性。',
    tag: 'PROMPT EVOLUTION / EMOTION',
    image: '/assets/instagram_asset_bottle_1781774227848.webp',
    likes: 3892,
    emoji: '🎁',
    spec: '兼备节日氛围、惊喜感、真实感和屏幕适配性的情绪桌面',
    badge: '沉浸情绪触点'
  },
  {
    id: 'case-3',
    title: '智能座舱情景模式',
    subtitle: '深度物理使用场景下的视觉场景体验融合',
    desc: '情景模式围绕小憩、露营、影院、关怀等车内使用场景展开。设计目标是通过视觉氛围帮助用户快速进入舒适状态，使车机界面与车主情绪、空间物理环境产生强耦合。我将场景关键词转化为可被 AI 理解的视觉语言，进行持续材质光影打磨，使之不只是装饰画，而是功能体验的一环。',
    tag: 'SCENARIO UX / PERSISTENCE',
    image: '/assets/yang_zhilin_avatar_1781774163978.webp',
    likes: 5120,
    emoji: '⛺',
    spec: '小憩/影院/深度露营氛围控制、多维度参数场景感重塑',
    badge: '情景体验链路'
  }
];

export default function SectionSplash() {
  const [activeProject, setActiveProject] = useState<ProjectCase>(PROJECT_CASES[0]);
  const [likesState, setLikesState] = useState<Record<string, number>>({
    'case-1': PROJECT_CASES[0].likes,
    'case-2': PROJECT_CASES[1].likes,
    'case-3': PROJECT_CASES[2].likes,
  });
  const [hasLiked, setHasLiked] = useState<Record<string, boolean>>({});

  // Dynamic state for interactive mouse-spawning image-trail workspace
  const [displayMode, setDisplayMode] = useState<'card' | 'trail'>('card');
  const [trailImages, setTrailImages] = useState<Array<{
    id: string;
    src: string;
    x: number;
    y: number;
    rotation: number;
    zIndex: number;
    title: string;
  }>>([]);

  const lastSpannedPos = useRef({ x: 0, y: 0 });
  const maxZIndexRef = useRef(10);
  const nextImageIndex = useRef(0);

  const TRAIL_SOURCE_IMAGES = [
    { src: '/assets/instagram_asset_bottle_1781774227848.webp', title: '智能座舱节日桌面适配' },
    { src: '/assets/make_a_splash_can_1781774201107.webp', title: 'AIGC 自动化视觉光能重构' },
    { src: '/assets/yang_zhilin_avatar_1781774163978.webp', title: '座舱人机交互人因学研究' },
    { src: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=600&q=80', title: '4K 曲面车载一体屏适配' },
    { src: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80', title: '物理表面皮质微绒打光渲染' },
    { src: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80', title: '高灵敏度智驾运动仪表流' },
    { src: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80', title: '流体极夜暗光路线光轨' },
    { src: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=600&q=80', title: '极速概念座舱暗色美学' },
    { src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80', title: '多维交互情绪光照流动' },
    { src: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80', title: '智能SUV空间物理环境对流' },
    { src: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=600&q=80', title: 'HUD 虚空视距浮光设计图' },
    { src: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80', title: '车载算力神经网络连接链' },
  ];

  // Mouse trail spawner event
  const handleTrailAreaMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (displayMode !== 'trail') return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Throttle spawning by calculating distance moved
    const dx = x - lastSpannedPos.current.x;
    const dy = y - lastSpannedPos.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // If moved more than 75px, spawn a new picture!
    if (dist > 75 || trailImages.length === 0) {
      lastSpannedPos.current = { x, y };
      sounds.playHoverIP();

      const imageItem = TRAIL_SOURCE_IMAGES[nextImageIndex.current];
      nextImageIndex.current = (nextImageIndex.current + 1) % TRAIL_SOURCE_IMAGES.length;
      maxZIndexRef.current += 1;

      const randomRot = Math.random() * 22 - 11; // -11deg to 11deg

      const newImg = {
        id: `trail-${Date.now()}-${Math.random()}`,
        src: imageItem.src,
        title: imageItem.title,
        x,
        y,
        rotation: randomRot,
        zIndex: maxZIndexRef.current,
      };

      setTrailImages((prev) => {
        // Keep at most 25 items to avoid layout spam and memory overload
        const list = [...prev, newImg];
        if (list.length > 25) {
          return list.slice(list.length - 25);
        }
        return list;
      });
    }
  };

  const handleClearTrail = () => {
    sounds.playChime();
    setTrailImages([]);
  };

  // 3D Tilt calculations for the Instagram Card
  const cardRef = useRef<HTMLDivElement>(null);
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    tiltX.set(-y / (rect.height / 2) * 15);
    tiltY.set(x / (rect.width / 2) * 15);
  };

  const handleMouseLeave = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  const toggleLike = (id: string) => {
    sounds.playChime();
    const liked = !!hasLiked[id];
    setHasLiked((prev) => ({ ...prev, [id]: !liked }));
    setLikesState((prev) => ({
      ...prev,
      [id]: liked ? prev[id] - 1 : prev[id] + 1,
    }));
  };

  const handleProjectSelect = (proj: ProjectCase) => {
    sounds.playClick();
    setActiveProject(proj);
  };

  return (
    <div className="w-full bg-[#f5f5f0] text-neutral-900 min-h-screen relative overflow-hidden py-16 px-4 md:px-12 lg:px-20 font-sans flex flex-col justify-between">
      
      {/* Background Floating Geometric Shapes */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <svg className="absolute top-[15%] left-[5%] w-24 h-16 opacity-20 text-[#9669e6]" stroke="currentColor" fill="none" strokeWidth="3">
          <polyline points="0,0 20,30 40,0 60,30 80,0 100,30" />
        </svg>
        <svg className="absolute bottom-[20%] right-[3%] w-24 h-16 opacity-20 text-[#9669e6]" stroke="currentColor" fill="none" strokeWidth="3">
          <polyline points="0,0 20,30 40,0 60,30 80,0 100,30" strokeDasharray="5,5" />
        </svg>
        <div className="absolute top-[40%] right-[15%] w-12 h-12 rounded-full border-2 border-black/10" />
        <div className="absolute bottom-[40%] left-[8%] w-16 h-16 rounded-full border-4 border-dashed border-black/5" />
      </div>

      {/* GIANT HOLLOW TEXT OVERLAY */}
      <div className="absolute inset-y-0 inset-x-0 flex flex-col justify-center items-center z-0 select-none pointer-events-none">
        <h1 className="text-[12vw] font-black tracking-tighter leading-[0.8] text-black/5 text-center font-sans uppercase">
          PROJECT
        </h1>
        <h1 className="text-[12vw] font-black tracking-tighter leading-[0.8] text-black/5 text-center font-sans uppercase">
          CASES
        </h1>
      </div>

      {/* Title & Interactive Mode Switcher Header */}
      <div className="max-w-7xl mx-auto w-full z-20 flex flex-col items-center justify-between gap-4 border-b border-black/10 pb-6 mb-4 mt-2">
        <div className="flex flex-col items-center text-center">
          <span className="bg-[#9669e6] text-black text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded-full border border-black rotate-[-1.5deg] block mb-2">
            DESIGN DEPLOYS · 展示切换
          </span>
          <h2 className="text-3xl md:text-5xl font-black font-sans leading-none tracking-tight text-neutral-900 select-none">
            创意视觉展示面板
          </h2>
        </div>

        {/* Dynamic Mode Switch Segment */}
        <div className="flex bg-black/5 border border-black/10 p-1 rounded-full w-full max-w-sm mt-3 shadow-inner">
          <button
            onClick={() => {
              sounds.playClick();
              setDisplayMode('card');
            }}
            className={`flex-1 py-2 rounded-full text-[11px] font-black tracking-wider transition-all select-none uppercase ${
              displayMode === 'card'
                ? 'bg-[#9669e6] text-white font-black shadow-md'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            📱 静态产品卡片
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setDisplayMode('trail');
            }}
            className={`flex-1 py-2 rounded-full text-[11px] font-black tracking-wider transition-all flex items-center justify-center space-x-1 select-none uppercase ${
              displayMode === 'trail'
                ? 'bg-[#9669e6] text-white font-black shadow-md'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <span className="animate-pulse">🌌</span>
            <span>轨迹灵感喷叠</span>
          </button>
        </div>
      </div>

      {/* Main Switchable Section Container */}
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col justify-center items-center z-10 py-6 min-h-[580px]">
        
        {displayMode === 'card' ? (
          /* original 3-column instagram viewer section */
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* LEFT COLUMN: INTERACTIVE SWITCHER + DETAILS */}
            <div className="reveal-on-scroll lg:col-span-4 flex flex-col items-start text-left space-y-6 z-20">
              
              <h3 className="text-xl md:text-2xl font-black font-sans text-[#9669e6] select-none leading-none">
                智能交互·真实产品落地
              </h3>

              {/* Tab buttons */}
              <div className="w-full flex flex-col space-y-2.5 bg-white p-3 rounded-[18px] border border-black/10 shadow-sm">
                {PROJECT_CASES.map((proj) => {
                  const isActive = activeProject.id === proj.id;
                  return (
                    <button
                      key={proj.id}
                      onClick={() => handleProjectSelect(proj)}
                      onMouseEnter={() => sounds.playHoverIP()}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border font-sans font-bold text-xs tracking-wider uppercase transition-all ${
                        isActive
                          ? 'bg-[#9669e6] text-white border-[#9669e6] shadow-lg translate-x-1'
                          : 'bg-neutral-50 text-neutral-700 border-neutral-100 hover:bg-neutral-100'
                      }`}
                    >
                      <span className="flex items-center space-x-2">
                        <span className="text-lg">{proj.emoji}</span>
                        <span>{proj.title}</span>
                      </span>
                      <span className={`text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded ${
                        isActive ? 'bg-white text-[#9669e6]' : 'bg-neutral-100 text-neutral-500'
                      }`}>
                        {proj.badge}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Interactive Case study block */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeProject.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white border border-black/10 rounded-2xl p-5 w-full relative shadow-sm"
                >
                  <div className="flex items-center space-x-2 text-[#9669e6] font-mono text-[10px] uppercase font-black mb-2">
                    <span>✦</span>
                    <span>{activeProject.tag}</span>
                  </div>
                  <h4 className="text-lg font-black font-sans mb-2 text-neutral-900">
                    {activeProject.subtitle}
                  </h4>
                  <p className="text-xs text-neutral-600 leading-relaxed font-sans mb-3">
                    {activeProject.desc}
                  </p>

                  <div className="border-t border-black/10 pt-2 flex flex-col space-y-1">
                    <span className="text-[9px] font-mono text-neutral-500 font-extrabold uppercase">
                      核心设计控制点 / KEY DELIVERABLES
                    </span>
                    <span className="text-xs text-[#9669e6] font-sans font-bold">
                      {activeProject.spec}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>

            </div>

            {/* CENTER COLUMN: INTERACTIVE INSTAGRAM SMARTPHONE */}
            <div className="lg:col-span-4 flex justify-center items-center relative min-h-[500px] z-30">
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeProject.id}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  drag
                  dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
                  dragElastic={0.15}
                  whileDrag={{ scale: 1.05 }}
                  onClick={() => sounds.playClick()}
                  data-cursor-type="drag"
                  className="w-[280px] h-[540px] bg-neutral-950 border-[8px] border-black rounded-[40px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col relative cursor-grab active:cursor-grabbing select-none"
                >
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-b-2xl z-50 flex items-center justify-center">
                    <div className="w-12 h-1 bg-neutral-900 rounded-full" />
                  </div>

                  {/* Instagram view */}
                  <div className="w-full h-full flex flex-col bg-white text-black font-sans text-xs">
                    
                    {/* Header */}
                    <div className="pt-8 pb-2 px-3 border-b border-neutral-100 flex justify-between items-center bg-white/95 sticky top-0 z-40">
                      <span className="font-serif italic font-black text-base">WeChat Feed</span>
                      <div className="text-[8px] font-mono font-bold bg-neutral-100 px-2 py-0.5 border border-neutral-200 rounded-full text-neutral-600">
                        AIGC IMPLEMENT
                      </div>
                    </div>

                    {/* Body scroll */}
                    <div className="flex-1 overflow-y-auto no-scrollbar pb-6 bg-neutral-50/50">
                      
                      {/* User row */}
                      <div className="flex items-center justify-between p-2">
                        <div className="flex items-center space-x-2">
                          <img 
                            src="/assets/yang_zhilin_avatar_1781774163978.webp" 
                            alt="Zhilin" 
                            className="w-7 h-7 rounded-full object-cover border border-neutral-150" 
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex flex-col text-left">
                            <span className="font-black text-[10px]">y_zhilin.design</span>
                            <span className="text-[7.5px] text-neutral-400 font-mono">CN / SHANGHAI</span>
                          </div>
                        </div>
                        <span className="font-extrabold text-[#f5f5f0]">●</span>
                      </div>

                      {/* PROJECT CAN / POST IMAGE */}
                      <div className="relative aspect-square w-full overflow-hidden bg-neutral-950 border-y border-neutral-100">
                        <img
                          src={activeProject.image}
                          alt={activeProject.title}
                          className="w-full h-full object-cover select-none pointer-events-none filter brightness-95"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute bottom-2 left-2 bg-[#f5f5f0] text-[#9669e6] px-2 py-0.5 rounded text-[8px] font-mono tracking-wider font-extrabold uppercase shadow">
                          {activeProject.id === 'case-1' ? 'COMFYUI SYSTEM' : activeProject.id === 'case-2' ? 'EMOTION DESK' : 'SCENARIO UX'}
                        </div>
                      </div>

                      {/* Interactions */}
                      <div className="flex justify-between items-center p-2">
                        <div className="flex space-x-3 text-neutral-800">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLike(activeProject.id);
                            }} 
                            className="hover:scale-120 active:scale-90 transition-transform text-md"
                          >
                            {hasLiked[activeProject.id] ? '❤️' : '🖤'}
                          </button>
                          <span className="text-md">💬</span>
                          <span className="text-md">✈️</span>
                        </div>
                        <span className="bg-[#9669e6] border border-black/10 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold">SAVE</span>
                      </div>

                      {/* Caption */}
                      <div className="px-2 text-left">
                        <span className="font-black text-[10px] block mb-0.5 text-neutral-800">
                          Liked by {likesState[activeProject.id].toLocaleString()} people
                        </span>
                        <p className="text-[9.5px] leading-relaxed text-neutral-700">
                          <span className="font-black mr-1 text-black">y_zhilin.design</span>
                          我完成的<b>“{activeProject.title}”</b>项目。重点是通过模型定制、控制工作流及精准控制将 AIGC 注入车机及座舱的高端交付链。
                        </p>
                        <span className="text-[7.5px] text-neutral-400 block mt-1 font-mono uppercase">JUST NOW</span>
                      </div>

                    </div>

                  </div>
                </motion.div>
              </AnimatePresence>

            </div>

            {/* RIGHT COLUMN: DETAIL POST PREVIEW WITH TILT */}
            <div className="reveal-on-scroll lg:col-span-4 flex flex-col items-center justify-center z-20">
              
              <motion.div
                ref={cardRef}
                style={{
                  rotateX: tiltX,
                  rotateY: tiltY,
                  transformStyle: 'preserve-3d',
                }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="w-full max-w-[280px] bg-white rounded-2xl border-2 border-black p-4 text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-transform duration-100 ease-out flex flex-col relative overflow-hidden"
              >
                {/* Header / Sponsored info */}
                <div className="flex items-center justify-between mb-3 border-b border-neutral-100 pb-2.5">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 rounded-full bg-[#9669e6] flex items-center justify-center text-[8px] font-black text-white">
                      ✦
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] font-black tracking-tight font-sans">AIGC 生产流程</span>
                      <span className="text-[8px] text-neutral-400 font-bold uppercase font-mono">WORKFLOW</span>
                    </div>
                  </div>
                  <span className="text-neutral-500 font-bold font-mono text-[9px]">CN</span>
                </div>

                {/* Alternating image mock for design showcase */}
                <div className="aspect-[4/3] w-full rounded-xl overflow-hidden border border-black/10 relative shadow-sm mb-3">
                  <img
                    src={activeProject.id === 'case-1' ? '/assets/instagram_asset_bottle_1781774227848.webp' : '/assets/make_a_splash_can_1781774201107.webp'}
                    alt="Instagram decoration"
                    className="w-full h-full object-cover select-none pointer-events-none"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Overlay texts */}
                  <div className="absolute inset-0 p-3 flex flex-col justify-between bg-black/15 select-none pointer-events-none font-black font-sans py-4 uppercase text-left">
                    <span className="text-[9px] bg-white text-black px-1.5 py-0.5 rounded border border-black w-max tracking-wide">
                      COMPLETED
                    </span>
                    <span className="text-[9px] text-[#9669e6] bg-black/80 px-2 py-0.5 rounded backdrop-blur border border-white/10 tracking-wider">
                      {activeProject.id === 'case-1' ? '车机端 100% 还原' : '可控、复用设计资产'}
                    </span>
                  </div>
                </div>

                <div className="text-left font-sans text-xs">
                  <span className="font-extrabold block text-neutral-900 mb-1 font-mono text-[9px]">
                    DELIVERABLE PARAMETERS:
                  </span>
                  <p className="text-[10px] leading-tight text-neutral-800 font-sans">
                    不仅仅是出图，而是通过 LoRA 训练、风格迁移与 ComfyUI 流程搭建建立可重绘光影车型的高品质资源库。
                  </p>
                </div>
              </motion.div>

            </div>

          </div>
        ) : (
          /* Immensely interactive mouse-trail collage canvas */
          <div className="w-full flex flex-col items-center select-none">
            
            {/* Top Toolbar / Controllers of Canvas */}
            <div className="w-full flex flex-wrap items-center justify-between gap-3 mb-4 select-none px-2">
              <div className="text-left">
                <span className="text-[10px] font-mono tracking-wider text-neutral-500 uppercase">Interactive Workspace</span>
                <p className="text-xs text-neutral-700 font-semibold">
                  已喷薄灵感画布：<span className="text-[#9669e6] font-black font-mono text-sm">{trailImages.length}</span> / 25
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleClearTrail}
                  className="bg-black/60 hover:bg-neutral-900 text-xs font-black font-mono tracking-widest px-4 py-2 border border-white/10 rounded-lg shadow uppercase transition-all flex items-center space-x-1.5 active:scale-95 text-[#ff55bb]"
                >
                  <span>🧹</span>
                  <span>一键清屏 / RESET CANVAS</span>
                </button>
              </div>
            </div>

            {/* Canvas Area */}
            <div
              onMouseMove={handleTrailAreaMouseMove}
              onDoubleClick={handleClearTrail}
              className="w-full h-[540px] bg-neutral-950/70 border-3 border-dashed border-white/15 rounded-[32px] relative overflow-hidden cursor-crosshair shadow-inner"
            >
              {/* Subtle 3D Grid mesh for retro vibe */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />

              {/* Decorative instructions behind floating assets */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none text-center z-0 p-6">
                <span className="text-[12vw] font-black tracking-tighter text-[#9669e6]/5 font-sans leading-none">
                  ZHILIN LAB
                </span>
                <div className="mt-4 max-w-sm bg-black/65 border border-white/5 backdrop-blur-md px-6 py-4 rounded-2xl">
                  <p className="text-[11px] md:text-xs text-neutral-300 font-semibold leading-relaxed space-y-1">
                    <span className="text-[#9669e6] font-black block text-sm">🌌 灵感魔幻喷涌舱</span>
                    <span>双击画布快速清屏</span>
                    <span className="block text-neutral-500 font-mono text-[9px]">SPAWNED ASSETS ARE FULLY DRAGGABLE</span>
                  </p>
                </div>
              </div>

              {/* Floating images spawned on movement */}
              <AnimatePresence>
                {trailImages.map((img) => (
                  <motion.div
                    key={img.id}
                    drag
                    dragElastic={0.08}
                    whileDrag={{ scale: 1.06, rotate: 0, zIndex: 99999 }}
                    onDragStart={() => sounds.playClick()}
                    onClick={() => {
                      maxZIndexRef.current += 1;
                      setTrailImages((prev) => 
                        prev.map((item) => 
                          item.id === img.id ? { ...item, zIndex: maxZIndexRef.current } : item
                        )
                      );
                    }}
                    style={{
                      left: img.x,
                      top: img.y,
                      transform: `translate(-50%, -50%) rotate(${img.rotation}deg)`,
                      zIndex: img.zIndex,
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 21 }}
                    className="absolute w-[180px] md:w-[220px] bg-white border-2 border-black rounded-xl p-2 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] cursor-grab active:cursor-grabbing hover:scale-105 active:scale-95 select-none"
                  >
                    {/* Img cover */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-black border border-neutral-100">
                      <img
                        src={img.src}
                        alt={img.title}
                        className="w-full h-full object-cover select-none pointer-events-none"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    {/* Info bar of card */}
                    <div className="flex items-center justify-between mt-2 px-0.5 select-none">
                      <span className="font-sans font-black text-[9px] md:text-[10px] text-neutral-800 tracking-tight leading-none truncate max-w-[130px] text-left block">
                        {img.title}
                      </span>
                      <span className="text-[7.5px] font-mono text-neutral-400 font-extrabold flex items-center space-x-0.5 select-none">
                        <span>✦</span>
                        <span>YZL</span>
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

            </div>

          </div>
        )}

      </div>

      {/* BOTTOM TICKER MARQUEE */}
      <div className="w-full overflow-hidden border-t-2 border-dashed border-black/10 pt-4 z-10 select-none">
        <div className="whitespace-nowrap flex py-2 uppercase font-sans font-black text-4xl md:text-5xl tracking-tight select-none">
          <motion.div
            animate={{ x: [0, -800] }}
            transition={{
              repeat: Infinity,
              duration: 20,
              ease: 'linear',
            }}
            className="flex space-x-8"
          >
            {[...Array(6)].map((_, index) => (
              <span key={index} className="flex items-center space-x-8">
                <span className="text-[#9669e6]">CONTROL & INTEGRATION</span>
                <span className="text-transparent stroke-text font-black text-neutral-400">NOT RANDOM DROPS</span>
                <span className="text-neutral-900">COCKPIT INTERACTION v2.00</span>
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      <GradualBlur position="bottom" height="8rem" strength={2} divCount={6} curve="bezier" />
    </div>
  );
}
