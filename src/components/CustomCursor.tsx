/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

export default function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [cursorState, setCursorState] = useState({ text: '', type: 'normal' as const });
  const [isClicking, setIsClicking] = useState(false);
  const cursorStateRef = useRef(cursorState);
  cursorStateRef.current = cursorState;

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // 更轻量的弹簧参数，减少滞后感
  const springConfig = { damping: 35, stiffness: 400, mass: 0.3 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement;
      const hoverText = target?.closest('[data-cursor-text]')?.getAttribute('data-cursor-text') || '';
      const hoverType = (target?.closest('[data-cursor-type]')?.getAttribute('data-cursor-type') || 'normal') as 'normal' | 'magnetic' | 'drag' | 'sound' | 'expand';

      // 只在值实际变化时才更新 state，避免每帧触发 React 重渲染
      const prev = cursorStateRef.current;
      if (hoverText !== prev.text || hoverType !== prev.type) {
        setCursorState({ text: hoverText, type: hoverType });
      }
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);
    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
    };
  }, [mouseX, mouseY, isVisible]);

  const { text: cursorText, type: cursorType } = cursorState;

  if (!isVisible) return null;

  // Render variations
  let width = 16;
  let height = 16;
  let bgClass = 'bg-[#d2ff55] opacity-90';
  let scale = isClicking ? 0.8 : 1;

  if (cursorText || cursorType === 'drag' || cursorType === 'sound') {
    width = 80;
    height = 80;
    bgClass = 'bg-[#ff55bb] border border-[#ff55bb] text-black shadow-lg';
    scale = isClicking ? 0.9 : 1.1;
  } else if (cursorType === 'expand') {
    width = 48;
    height = 48;
    bgClass = 'bg-[#5d59f7] border border-white/25 text-white shadow-xl';
  }

  return (
    <motion.div
      style={{
        left: cursorX,
        top: cursorY,
        x: '-50%',
        y: '-50%',
      }}
      animate={{
        width,
        height,
        scale,
      }}
      transition={{
        type: 'spring',
        damping: 30,
        stiffness: 300,
        mass: 0.5,
      }}
      className={`fixed pointer-events-none rounded-full z-[10000] flex items-center justify-center text-center font-mono text-[9px] font-bold tracking-wider uppercase select-none ${bgClass} hidden md:flex`}
    >
      {cursorText || (cursorType === 'drag' ? 'DRAG' : cursorType === 'sound' ? 'SOUND' : '')}
    </motion.div>
  );
}
