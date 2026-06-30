import { useRef, useEffect, type ReactNode, type HTMLAttributes } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface AnimatedContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  distance?: number;
  direction?: 'vertical' | 'horizontal';
  reverse?: boolean;
  duration?: number;
  ease?: string;
  initialOpacity?: number;
  animateOpacity?: boolean;
  scale?: number;
  threshold?: number;
  delay?: number;
  onComplete?: () => void;
}

export default function AnimatedContent({
  children,
  distance = 60,
  direction = 'vertical',
  reverse = false,
  duration = 0.6,
  ease = 'expo.out',
  initialOpacity = 0,
  animateOpacity = true,
  scale = 1,
  threshold = 0.2,
  delay = 0,
  onComplete,
  className = '',
  style: userStyle,
  ...rest
}: AnimatedContentProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const axis = direction === 'horizontal' ? 'x' : 'y';
    const offset = reverse ? -distance : distance;

    gsap.set(el, {
      [axis]: offset,
      scale,
      opacity: animateOpacity ? initialOpacity : 1,
      visibility: 'visible',
    });

    const tl = gsap.timeline({
      paused: true,
      delay,
      onComplete,
    });

    tl.to(el, {
      [axis]: 0,
      scale: 1,
      opacity: 1,
      duration,
      ease,
    });

    const st = ScrollTrigger.create({
      trigger: el,
      start: `top ${100 - threshold * 100}%`,
      once: true,
      onEnter: () => tl.play(),
    });

    return () => {
      st.kill();
      tl.kill();
    };
  }, [distance, direction, reverse, duration, ease, initialOpacity, animateOpacity, scale, threshold, delay, onComplete]);

  return (
    <div ref={ref} className={className} style={{ visibility: 'hidden', ...userStyle }} {...rest}>
      {children}
    </div>
  );
}
