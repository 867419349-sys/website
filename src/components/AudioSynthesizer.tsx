/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { sounds } from '../utils/audio';

export default function AudioSynthesizer() {
  const [muted, setMuted] = useState(false);

  const handleToggle = () => {
    const nextMuted = sounds.toggleMute();
    setMuted(nextMuted);
    if (!nextMuted) {
      sounds.playChime();
    }
  };

  useEffect(() => {
    sounds.setMute(false);
    setMuted(false);

    // 主动尝试自动播放 —— 频繁访问本网站的用户浏览器可能已允许
    sounds.tryAutoStart();
  }, []);

  return (
    <button
      onClick={handleToggle}
      data-cursor-type="sound"
      data-cursor-text={muted ? 'UNMUTE' : 'MUTE'}
      className="flex items-center space-x-2 bg-neutral-900/60 border border-neutral-800/80 hover:bg-neutral-800/80 px-3 py-1.5 rounded-full text-xs font-mono transition-all duration-200 active:scale-95 group"
      title={muted ? 'Unmute UI Soundscapes' : 'Mute UI Soundscapes'}
    >
      <div className="flex items-center space-x-[2px] h-3 w-4">
        {[...Array(4)].map((_, i) => (
          <motion.span
            key={i}
            animate={
              muted
                ? { height: '2px' }
                : {
                    height: ['4px', '12px', '4px'],
                  }
            }
            transition={
              muted
                ? {}
                : {
                    duration: 0.6 + i * 0.1,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut',
                  }
            }
            className={`w-[2.5px] rounded-full ${
              muted ? 'bg-neutral-600 group-hover:bg-neutral-400' : 'bg-[#d2ff55]'
            }`}
          />
        ))}
      </div>
      <span className={`text-[10px] tracking-wider uppercase font-bold select-none transition-colors ${
        muted ? 'text-neutral-500 group-hover:text-neutral-300' : 'text-[#d2ff55]'
      }`}>
        {muted ? '音效关闭' : '音效开启'}
      </span>
    </button>
  );
}
