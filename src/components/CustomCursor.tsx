/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

export default function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [cursorText, setCursorText] = useState('');
  const [cursorType, setCursorType] = useState<'normal' | 'magnetic' | 'drag' | 'sound' | 'expand'>('normal');
  const [isClicking, setIsClicking] = useState(false);

  // Position of mouse
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Smooth springs for high-end feel
  const springConfig = { damping: 25, stiffness: 250, mass: 0.6 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);

      // Find if we are hovering over custom interactive elements
      const target = e.target as HTMLElement;
      const hoverText = target?.closest('[data-cursor-text]')?.getAttribute('data-cursor-text');
      const hoverType = target?.closest('[data-cursor-type]')?.getAttribute('data-cursor-type');

      if (hoverText) {
        setCursorText(hoverText);
      } else {
        setCursorText('');
      }

      if (hoverType) {
        setCursorType(hoverType as any);
      } else {
        setCursorType('normal');
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

  if (!isVisible) return null;

  // Render variations
  let width = 16;
  let height = 16;
  let bgClass = 'bg-[#d2ff55] mix-blend-difference';
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
