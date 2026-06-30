/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { sounds } from '../utils/audio';
import GradualBlur from './GradualBlur';

export default function SectionContact() {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    sounds.playChime();
    navigator.clipboard.writeText('867419349@qq.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const socialLinks = [
    { name: '电子邮箱 / Email', value: '867419349@qq.com', action: handleCopyEmail, type: 'copy' },
    { name: '在线作品集 / Portfolio', value: 'https://behance.net/yang_zhilin_designer', type: 'link', link: 'mailto:867419349@qq.com' },
    { name: '小红书 / RED AIGC', value: '@杨芷琳_AIGC座舱设计', type: 'info' },
    { name: 'Dribbble / Design Case', value: 'dribbble.com/yang_zhilin', type: 'info' },
    { name: 'LinkedIn / 专业社交网', value: 'linkedin.com/in/yangzhilin', type: 'info' }
  ];

  return (
    <div className="w-full bg-[#ff55bb] text-black min-h-screen relative overflow-hidden font-sans flex flex-col justify-between pt-16">
      
      {/* 3D Grid Lines in Background with black styling */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />

      {/* Decorative Bold Shapes */}
      <div className="absolute top-[10%] left-[-5%] w-96 h-96 rounded-full bg-white/20 blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-[10%] right-[-5%] w-96 h-96 rounded-full bg-[#d2ff55]/30 blur-[120px] pointer-events-none z-0" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10 my-auto py-12 px-6 md:px-12 lg:px-16">
        
        {/* LEFT COMPONENT: INTRO CARD */}
        <div className="reveal-on-scroll lg:col-span-6 flex flex-col justify-center text-left space-y-6">
          <span className="bg-black text-white text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded-full border border-black w-fit rotate-[-1.5deg]">
            沟通与联络 · ESTABLISH RELATIONSHIP
          </span>
          
          <h1 className="text-4xl md:text-6xl font-sans font-black tracking-tight leading-[1] text-black">
            期待与您<br />
            <span className="bg-white px-3 py-1 border-2 border-black rounded-xl inline-block mt-1 relative rotate-[1deg] shadow-[3.5px_3.5px_0px_0px_#000]">
              探索未来座舱
            </span>
          </h1>

          <p className="text-xs md:text-sm text-neutral-900 leading-relaxed max-w-lg font-medium">
            真正的前沿设计不应单单停留在渲染图上。如果您正在寻求智能座舱设计落地、结构化 AIGC（如 ComfyUI、Midjourney 工作流）提质降本方案，或者关注极致 3D 座舱交互体验研究，欢迎随时取得联系。
          </p>

          <div className="bg-white/40 border-2 border-dashed border-black/30 rounded-2xl p-4 max-w-md">
            <span className="font-mono text-[10px] font-black block mb-1">CURRENT STATUS // 合作状态</span>
            <span className="text-xs font-semibold flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#d2ff55] border border-black animate-pulse" />
              <span>上海·支持远程 / 接受讲座咨询、产品体验顾问与 3D/AI 体验项目深度共创</span>
            </span>
          </div>
        </div>

        {/* RIGHT COMPONENT: DETAILED CONTACT CARDS */}
        <div className="reveal-on-scroll lg:col-span-6 bg-white border-3 border-black rounded-[28px] p-6 md:p-8 flex flex-col justify-between shadow-[8px_8px_0px_0px_#000] min-h-[480px]">
          
          {/* Card header */}
          <div className="flex justify-between items-center border-b-2 border-black/10 pb-4 select-none">
            <div className="flex flex-col">
              <span className="font-mono text-[9px] font-black text-neutral-400">CONNECT CHANNELS</span>
              <h2 className="font-sans font-black text-xl tracking-tight text-neutral-900 leading-none">
                联系杨芷琳 / ZHILIN'S CARD
              </h2>
            </div>
            <span className="text-[10px] font-mono font-extrabold tracking-widest bg-black text-[#d2ff55] px-2.5 py-1 rounded-full border border-black">
              CONTACT
            </span>
          </div>

          {/* Social connections list */}
          <div className="flex flex-col space-y-3.5 my-6 text-left">
            {socialLinks.map((sl, index) => (
              <div 
                key={index}
                className="group flex flex-col bg-neutral-50 hover:bg-neutral-100 border-2 border-black rounded-xl p-3.5 shadow-[3.5px_3.5px_0px_0px_rgba(0,0,0,1)] transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono font-black text-neutral-500 uppercase tracking-wider">
                    {sl.name}
                  </span>
                  
                  {sl.type === 'copy' && (
                    <button 
                      onClick={sl.action}
                      className="bg-black text-white hover:bg-[#d2ff55] hover:text-black transition-colors font-mono text-[9px] font-black px-2.5 py-1 rounded border border-black uppercase"
                    >
                      {copied ? '✔ COMPLETED' : 'COPY EMAIL'}
                    </button>
                  )}

                  {sl.type === 'link' && (
                    <a 
                      href={sl.link}
                      onClick={() => sounds.playChime()}
                      className="bg-[#5d59f7] text-white hover:bg-black transition-colors font-mono text-[9px] font-black px-2.5 py-1 rounded border border-black uppercase"
                    >
                      SEND EMAIL ➔
                    </a>
                  )}

                  {sl.type === 'info' && (
                    <span className="text-[9px] font-mono text-neutral-400 font-extrabold tracking-wide uppercase select-none">
                      • CONNECTED •
                    </span>
                  )}
                </div>
                
                <span className="text-xs md:text-sm font-bold text-neutral-900 mt-1 select-all font-mono leading-tight">
                  {sl.value}
                </span>
              </div>
            ))}
          </div>

          {/* CTA cooperative buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-5 border-t-2 border-black/10 select-none">
            <button
              onClick={() => {
                sounds.playChime();
                alert('🎉 正在为您载入 Behance/Email 深度作品清单！若有合作需求欢迎联系：867419349@qq.com');
              }}
              className="flex-1 bg-black text-white hover:bg-neutral-850 active:scale-95 transition-all font-mono text-[10.5px] font-black tracking-widest text-center px-4 py-3.5 rounded-xl border border-black uppercase shadow-[2.5px_2.5px_0px_0px_rgba(0,0,0,1)]"
            >
              Master Portfolio ➔
            </button>
            <button
              onClick={() => {
                sounds.playChime();
                alert('💌 期待您的合作提案邮箱：\n\n杨芷琳 / 智能座舱 AIGC 设计与 3D 概念设计师\n上海·中国\n867419349@qq.com');
              }}
              className="bg-[#d2ff55] text-black hover:bg-white active:scale-95 transition-all font-mono text-[10.5px] font-black tracking-widest px-4 py-3.5 rounded-xl border border-black uppercase shadow-[2.5px_2.5px_0px_0px_rgba(0,0,0,1)]"
            >
              COOPERATE / 品牌商谈
            </button>
          </div>

        </div>

      </div>

      {/* Marquee ticker at bottom of contact section */}
      <div className="w-full bg-neutral-950 text-neutral-400 py-3.5 border-t-2 border-black select-none z-10">
        <div className="whitespace-nowrap flex font-mono text-[9.5px] font-black tracking-widest uppercase select-none">
          <motion.div
            animate={{ x: [0, -1000] }}
            transition={{
              repeat: Infinity,
              duration: 25,
              ease: 'linear',
            }}
            className="flex space-x-12"
          >
            {[...Array(6)].map((_, i) => (
              <span key={i} className="flex items-center space-x-12">
                <span className="text-white">COOPERATION INQUIRY</span>
                <span className="text-[#ff55bb]">✦</span>
                <span>ZHILIN DESIGN STUDIO</span>
                <span className="text-[#d2ff55]">✦</span>
                <span className="text-white">EMAIL: 867419349@QQ.COM</span>
                <span>✦</span>
                <span>SHANGHAI DISTRICTS</span>
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      <GradualBlur position="bottom" height="8rem" strength={2} divCount={6} curve="bezier" />
    </div>
  );
}
