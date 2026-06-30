/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { sounds } from '../utils/audio';
import GradualBlur from './GradualBlur';

export default function SectionDesignOps() {
  const [activeStep, setActiveStep] = useState(0);
  const [activeScenario, setActiveScenario] = useState(0);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const steps = [
    {
      num: '01',
      title: '场景与情绪拆解 // SCENARIO & EMOTION',
      text: '不直接写 Prompt。先从真实用户场景出发，拆解车辆使用情境、温控、物理环境与情绪指标，梳理出最精微的核心氛围要素。'
    },
    {
      num: '02',
      title: 'Prompt 结构化演进 // PROMPT EVOLUTION',
      text: '将情绪关键词转化为 AI 极易理解的空间、镜头、主体、背景层次与材质描述。建立可复用、易迭代的 Prompt 结构层级。'
    },
    {
      num: '03',
      title: '工作流控制与微调 // COMFYUI & LORA',
      text: '通过搭建 ComfyUI 模块化节点工作流、设计控制参数并微调车型/风格 LoRA 模型，解决生成随机问题，实现高质量光影材质替换。'
    },
    {
      num: '04',
      title: '产品交付与多屏适配 // HARMONIOUS DELIVERY',
      text: '结合座舱屏幕规格、多端亮暗主题标准以及真实 UI 渲染层级，完成光影微重构与裁剪适配，保证 AI 资产在真实终端无瑕还原。'
    }
  ];

  const cockpitScenarios = [
    {
      name: '智能节日桌面 // FESTIVAL COCKPIT',
      tags: ['情感共鸣', '多端适配', '暖金色系'],
      prompt: 'Emotional resonance, cinematic twilight desk background, glowing interactive micro-touchpoints, festive cozy layout, perfect screen alignment, glassmorphism shades.',
      outputs: ['壁纸 4K HDR', 'UI 背景层', '动态氛围参数']
    },
    {
      name: '座舱情景模式 // LIVING SPACE MODE',
      tags: ['露营小憩', '暗色空间', '沉浸光影'],
      prompt: 'Living room comfort concept, night stargazing vibe, dim cozy volumetric lighting, detailed starry sky skybox, warm texture reflections, calm breeze animation triggers.',
      outputs: ['100% 还原布局', '座舱灯光联动码', '氛围音效包']
    },
    {
      name: 'AI 材质重绘流 // LIGHTING & METALLIC',
      tags: ['ComfyUI 工作流', '款式无缝替换', '精准控图'],
      prompt: 'Photorealistic auto studio rendering, precise vehicle metallic reflections, shadow material refinement LoRA, high contrast studio ambient, 100% vector boundary clip.',
      outputs: ['LoRA 特征权重', '材质重绘图层', 'ComfyUI 节点链']
    }
  ];

  const triggerProcessSimulation = () => {
    if (isRunning) return;
    sounds.playClick();
    setIsRunning(true);
    setGenerationProgress(0);

    const interval = setInterval(() => {
      setGenerationProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setIsRunning(false);
          sounds.playChime();
          return 100;
        }
        return p + 4;
      });
    }, 50);
  };

  return (
    <div className="w-full bg-[#5d59f7] text-white min-h-screen relative overflow-hidden font-sans flex flex-col justify-between pt-16">
      
      {/* 3D Grid Lines in Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />

      {/* Decorative Blur Orbs */}
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 rounded-full bg-[#ff55bb]/20 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[10%] left-[-10%] w-96 h-96 rounded-full bg-[#d2ff55]/10 blur-[100px] pointer-events-none z-0" />

      {/* Grid container */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 my-auto py-8 px-6 md:px-12">
        
        {/* LEFT COMPONENT: DESIGN THOUGHTS (设计思考) */}
        <div className="reveal-on-scroll lg:col-span-6 flex flex-col justify-between text-left min-h-[500px]">
          
          {/* Header row */}
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-black tracking-tighter uppercase text-[#d2ff55]">✦ DESIGN OPS & METRIC</span>
            </div>
            
            {/* Spinning decorative gauge */}
            <div className="relative w-12 h-12 flex items-center justify-center select-none">
              <svg className="w-full h-full animate-spin-slow" viewBox="0 0 100 100" style={{ animationDuration: '15s' }}>
                <path id="badgePath" d="M 50,50 m -40,0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0" fill="none" />
                <text className="font-mono text-[9px] font-bold fill-[#d2ff55] tracking-widest">
                  <textPath xlinkHref="#badgePath">● DESIGN OPS ● MODEL CONTROL ●</textPath>
                </text>
              </svg>
              <div className="absolute font-bold font-mono text-[8px] text-[#ff55bb]">ENG</div>
            </div>
          </div>

          {/* Main thoughts section */}
          <div className="my-auto py-6">
            <span className="bg-[#d2ff55] text-black text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded border border-black inline-block mb-3 rotate-[-1deg]">
              AI 体验交付论 / WORKFLOW METHOD
            </span>
            
            <h1 className="text-3xl md:text-5xl font-sans font-black tracking-tight leading-[1] text-white">
              AI 不是随机抽卡，<br />
              <span className="text-[#d2ff55]">而是一套可控的创意引擎。</span>
            </h1>

            <p className="mt-4 text-xs md:text-sm text-neutral-200 leading-relaxed">
              真正有商业实用价值的 AI 设计师，核心不是无脑地“抽卡”获得好看但随机的图，而是<b>“精确控制、参数重构与一致性落地”</b>。在座舱量产规范中，我们通过结构化的工程逻辑将 AIGC 输入与产出规则牢牢锁死。
            </p>

            {/* Stepped Interactive Block */}
            <div className="mt-6 flex flex-col space-y-3">
              {steps.map((st, i) => (
                <div 
                  key={i}
                  onMouseEnter={() => {
                    sounds.playHover();
                    setActiveStep(i);
                  }}
                  className={`p-3.5 border-2 rounded-xl transition-all duration-300 cursor-pointer ${
                    activeStep === i 
                      ? 'bg-neutral-900 border-[#d2ff55] shadow-[3.5px_3.5px_0px_0px_#d2ff55]' 
                      : 'bg-white/5 border-neutral-800 hover:bg-white/10'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono text-xs font-black text-[#d2ff55]">{st.num} — {st.title.split(' // ')[0]}</span>
                    <span className="text-[8px] font-mono text-neutral-400 font-bold uppercase tracking-widest">{st.title.split(' // ')[1]}</span>
                  </div>
                  <p className="text-[10.5px] leading-relaxed text-neutral-300">
                    {st.text}
                  </p>
                </div>
              ))}
            </div>

          </div>

          {/* Footer of thoughts */}
          <div className="border-t border-white/15 pt-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <p className="text-[10px] text-neutral-400 font-mono">
              KEYWORDS: STRUCTURED PROMPTS // LORA FINE-TUNING // COMFYUI PIPELINES
            </p>
            <span className="text-[10px] bg-black text-[#d2ff55] py-0.5 px-2 rounded font-mono font-bold">
              EST. 2026
            </span>
          </div>

        </div>

        {/* RIGHT COMPONENT: AI CONSOLE / INTERACTIVE prompt controller */}
        <div className="reveal-on-scroll lg:col-span-6 bg-neutral-950 border-2 border-white/10 rounded-[28px] p-6 flex flex-col justify-between shadow-[6px_6px_0px_0px_rgba(0,0,0,0.4)] min-h-[500px] text-left">
          
          <div>
            {/* Header / Console panel layout */}
            <div className="flex justify-between items-center border-b border-white/10 pb-4 select-none">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="font-mono text-[9px] text-neutral-400 font-black ml-2 uppercase">AIGC_PIPELINE_CONTROLLER_v2.0</span>
              </div>
              <div className="font-mono text-[9px] text-[#d2ff55] bg-[#d2ff55]/10 px-2.5 py-0.5 rounded-full border border-[#d2ff55]/20 font-black">
                STABLE_STATE
              </div>
            </div>

            {/* Selector list of cases to load */}
            <div className="mt-5">
              <span className="font-mono text-[9px] font-bold text-neutral-500 block mb-2 uppercase tracking-wider">01. LOAD CASE CONFIGURATION // 载入车机适配</span>
              <div className="flex flex-col space-y-2">
                {cockpitScenarios.map((scText, ind) => (
                  <button
                    key={ind}
                    onClick={() => {
                      sounds.playClick();
                      setActiveScenario(ind);
                      setGenerationProgress(0);
                    }}
                    className={`text-left p-3 rounded-lg border flex items-center justify-between font-mono text-xs transition-all ${
                      activeScenario === ind 
                        ? 'bg-[#d2ff55] text-black border-black font-black' 
                        : 'bg-neutral-900 text-white border-neutral-800 hover:bg-neutral-800'
                    }`}
                  >
                    <span>{scText.name}</span>
                    <span className="text-[10px] opacity-80">
                      {activeScenario === ind ? '● LOADED' : 'LOAD'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Evolution Box */}
            <div className="mt-5">
              <span className="font-mono text-[9px] font-bold text-neutral-500 block mb-2 uppercase tracking-wider">02. EVOLUTIVE SCHEMA // 结构描述句</span>
              <div className="bg-neutral-900/60 p-4 rounded-xl border border-white/5 font-mono text-[11px] leading-relaxed text-neutral-300">
                <span className="text-[#ff55bb] block mb-1">PROMPT LAYER:</span>
                <p className="italic">"{cockpitScenarios[activeScenario].prompt}"</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {cockpitScenarios[activeScenario].tags.map((tagText, tIdx) => (
                    <span key={tIdx} className="bg-neutral-850 text-neutral-400 font-sans text-[10px] px-2 py-0.5 rounded border border-white/5">
                      #{tagText}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Simulated generation outputs */}
            <div className="mt-5">
              <span className="font-mono text-[9px] font-bold text-neutral-500 block mb-2 uppercase tracking-wider">03. EXPORT TARGETS // 模块交付产物</span>
              <div className="grid grid-cols-3 gap-2.5">
                {cockpitScenarios[activeScenario].outputs.map((outText, outIdx) => (
                  <div key={outIdx} className="bg-white/5 border border-white/5 text-center p-2 rounded-lg py-3">
                    <span className="text-[10px] font-semibold text-[#d2ff55] block">
                      {outText}
                    </span>
                    <span className="text-[8px] font-mono text-neutral-500 block mt-1 uppercase tracking-widest">
                      PASSED L1
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Execution triggers & Interactive feedback dials */}
          <div className="mt-6 pt-4 border-t border-white/10 flex flex-col md:flex-row items-center gap-4">
            
            {/* Run Pipeline Button */}
            <button
              onClick={triggerProcessSimulation}
              disabled={isRunning}
              className={`w-full md:w-auto px-6 py-3.5 rounded-xl border-2 border-black font-mono text-xs font-black tracking-widest uppercase transition-all shadow-[3px_3px_0px_0px_rgba(210,255,85,1)] ${
                isRunning 
                  ? 'bg-neutral-800 text-neutral-500 border-neutral-700 cursor-not-allowed shadow-none' 
                  : 'bg-[#d2ff55] text-black hover:bg-white active:translate-x-0.5 active:translate-y-0.5 active:shadow-none'
              }`}
            >
              {isRunning ? 'PIPELINE RUNNING...' : 'EXECUTE WORKFLOW'}
            </button>

            {/* Loading Meter bar */}
            <div className="flex-1 w-full text-left font-mono">
              <div className="flex justify-between items-center text-[10px] text-neutral-400 mb-1">
                <span>COMFYUI NODE SYNCHRONIZATION</span>
                <span className="text-white font-bold">{generationProgress}%</span>
              </div>
              <div className="w-full bg-neutral-900 border border-white/10 rounded-full h-2.5 overflow-hidden">
                <motion.div 
                  initial={{ width: '0%' }}
                  animate={{ width: `${generationProgress}%` }}
                  transition={{ ease: 'linear' }}
                  className="bg-gradient-to-r from-[#d2ff55] to-[#ff55bb] h-full"
                />
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* BOTTOM TICKER MARQUEE */}
      <div className="w-full bg-neutral-950 text-neutral-400 py-3 border-t border-neutral-900 select-none z-10">
        <div className="whitespace-nowrap flex font-mono text-[9.5px] font-black tracking-widest uppercase select-none">
          <motion.div
            animate={{ x: [-1000, 0] }}
            transition={{
              repeat: Infinity,
              duration: 25,
              ease: 'linear',
            }}
            className="flex space-x-12"
          >
            {[...Array(6)].map((_, i) => (
              <span key={i} className="flex items-center space-x-12">
                <span>YANG ZHILIN</span>
                <span className="text-[#d2ff55]">●</span>
                <span className="text-[#ff55bb]">COCKPIT AI DESIGNER</span>
                <span className="text-white">●</span>
                <span>GAME INTERACTIVE RESEARCHER</span>
                <span>●</span>
                <span className="text-[#5d59f7]">SHANGHAI CHINA</span>
                <span>●</span>
                <span className="text-white">DESIGN OPS STRETCHED DEPLOYMENT SYSTEM</span>
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      <GradualBlur position="bottom" height="8rem" strength={2} divCount={6} curve="bezier" />
    </div>
  );
}
