import { useRef, useEffect, type ReactNode, type CSSProperties } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface FadeContentProps {
  children: ReactNode;
  blur?: boolean;
  duration?: number;
  ease?: string;
  delay?: number;
  threshold?: number;
  initialOpacity?: number;
  className?: string;
  style?: CSSProperties;
}

export default function FadeContent({
  children,
  blur = false,
  duration = 1000,
  ease = 'power2.out',
  delay = 0,
  threshold = 0.1,
  initialOpacity = 0,
  className = '',
  style,
}: FadeContentProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const startPct = (1 - threshold) * 100;

    gsap.set(el, {
      autoAlpha: initialOpacity,
      filter: blur ? 'blur(10px)' : 'blur(0px)',
      willChange: 'opacity, filter, transform',
    });

    const tl = gsap.timeline({ paused: true, delay });

    tl.to(el, {
      autoAlpha: 1,
      filter: 'blur(0px)',
      duration,
      ease,
    });

    const st = ScrollTrigger.create({
      trigger: el,
      start: `top ${startPct}%`,
      once: true,
      onEnter: () => tl.play(),
    });

    return () => {
      st.kill();
      tl.kill();
      gsap.killTweensOf(el);
    };
  }, [blur, duration, ease, delay, threshold, initialOpacity]);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
