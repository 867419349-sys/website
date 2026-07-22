/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import AudioSynthesizer from './AudioSynthesizer';
import { sounds } from '../utils/audio';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navigation({ activeTab, setActiveTab }: NavigationProps) {
  const tabs = [
    { id: 'home', label: '探索首页', num: '00' },
    { id: 'profile', label: '个人简介', num: '01' },
    { id: 'splash', label: '创意作品', num: '02' },
    { id: 'designops', label: '设计思考', num: '03' },
    { id: 'contact', label: '联络合作', num: '04' }
  ];

  const handleTabClick = (tabId: string) => {
    sounds.playChime();
    setActiveTab(tabId);
  };

  return (
    <nav className="fixed top-0 inset-x-0 bg-neutral-950/75 backdrop-blur-md border-b border-neutral-900/60 z-50 py-3.5 px-4 md:px-12 flex items-center justify-between font-sans select-none">
      
      {/* Brand header Logo block */}
      <div 
        onClick={() => handleTabClick('home')}
        className="flex items-baseline space-x-2 cursor-pointer group active:scale-95 transition-transform"
      >
        <span className="font-mono text-xs font-bold text-white tracking-widest uppercase">
          YANG ZHILIN
        </span>
        <span className="text-[10px] text-[#d2ff55] font-mono leading-none font-bold">
          v2.0
        </span>
      </div>

      {/* Center Anchor List - Active state indicators */}
      <div className="hidden lg:flex items-center space-x-1.5 bg-neutral-900/40 p-1.5 rounded-full border border-neutral-800/40">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              onMouseEnter={() => sounds.playHover()}
              className={`relative px-4 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider uppercase transition-colors duration-200 ${
                isActive ? 'text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="activeTabOverlay"
                  className="absolute inset-0 bg-[#d2ff55] rounded-full z-0"
                  transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                />
              )}
              <span className="relative z-10 flex items-baseline space-x-1">
                <span className="text-[9px] opacity-60 mr-1">{tab.num}</span>
                <span>{tab.label}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Right Synth Control & Contact details */}
      <div className="flex items-center space-x-4">

        {/* Playable Synth soundboard button */}
        <AudioSynthesizer />

        {/* Action button */}
        <button
          onClick={() => handleTabClick('contact')}
          data-cursor-type="expand"
          className="bg-white text-black hover:bg-[#d2ff55] transition-colors font-mono text-[10px] font-black tracking-widest px-4 py-2 rounded-full border border-black uppercase hidden sm:block"
        >
          联络合作
        </button>
      </div>

    </nav>
  );
}
