import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface BottomFadeProps {
  height?: string;
}

export default function BottomFade({ height = '12rem' }: BottomFadeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const bar = barRef.current;
    if (!container || !bar) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: container.parentElement,
        start: 'bottom-=200% bottom',
        end: 'bottom bottom',
        onUpdate: (self) => {
          gsap.to(bar, {
            opacity: self.progress,
            scaleX: 0.2 + self.progress * 0.8,
            duration: 0.1,
            overwrite: 'auto',
          });
        },
      });
    }, [container]);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute bottom-0 left-0 right-0 pointer-events-none"
      style={{ height, zIndex: 50 }}
    >
      {/* 渐变遮罩：内容淡入背景色 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(to bottom,
            transparent 0%,
            rgba(12, 12, 14, 0.3) 25%,
            rgba(12, 12, 14, 0.65) 50%,
            rgba(12, 12, 14, 0.9) 75%,
            #0c0c0e 100%
          )`,
        }}
      />

      {/* 底部渐变条 — 滚动驱动展开 */}
      <div
        ref={barRef}
        style={{
          position: 'absolute',
          bottom: '0.5rem',
          left: '50%',
          transform: 'translateX(-50%) scaleX(0.2)',
          transformOrigin: 'center',
          width: '70%',
          maxWidth: '900px',
          height: '2px',
          borderRadius: '1px',
          background: `linear-gradient(90deg,
            transparent 0%,
            rgba(210, 255, 85, 0.1) 15%,
            rgba(210, 255, 85, 0.35) 35%,
            rgba(210, 255, 85, 0.5) 50%,
            rgba(210, 255, 85, 0.35) 65%,
            rgba(210, 255, 85, 0.1) 85%,
            transparent 100%
          )`,
          boxShadow: '0 0 20px 4px rgba(210, 255, 85, 0.15)',
          opacity: 0,
        }}
      />
    </div>
  );
}
