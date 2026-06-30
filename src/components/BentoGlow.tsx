import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './MagicBento.css';

interface BentoGlowProps {
  containerRef: React.RefObject<HTMLElement | null>;
  enabled?: boolean;
  spotlightRadius?: number;
  glowColor?: string;
}

export default function BentoGlow({
  containerRef,
  enabled = true,
  spotlightRadius = 300,
  glowColor = '140, 80, 210',
}: BentoGlowProps) {
  const spotlightRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    // 全局聚光灯
    const spotlight = document.createElement('div');
    spotlight.className = 'global-spotlight';
    document.body.appendChild(spotlight);
    spotlightRef.current = spotlight;

    const proximity = spotlightRadius * 0.5;
    const fadeDistance = spotlightRadius * 0.75;

    const updateCardGlow = (card: HTMLElement, mouseX: number, mouseY: number, glow: number) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--glow-x', `${((mouseX - rect.left) / rect.width) * 100}%`);
      card.style.setProperty('--glow-y', `${((mouseY - rect.top) / rect.height) * 100}%`);
      card.style.setProperty('--glow-intensity', glow.toString());
      card.style.setProperty('--glow-radius', `${spotlightRadius}px`);
      card.style.setProperty('--glow-color', glowColor);
    };

    const handleMove = (e: MouseEvent) => {
      const section = containerRef.current;
      if (!section || !spotlightRef.current) return;

      const rect = section.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top && e.clientY <= rect.bottom;

      const cards = section.querySelectorAll<HTMLElement>('.glow-card');

      if (!inside) {
        gsap.to(spotlight, { opacity: 0, duration: 0.3, ease: 'power2.out' });
        cards.forEach(c => c.style.setProperty('--glow-intensity', '0'));
        return;
      }

      // 更新全局聚光灯位置
      gsap.to(spotlight, {
        left: e.clientX,
        top: e.clientY,
        opacity: 0.7,
        duration: 0.15,
        ease: 'power2.out',
      });

      // 更新每张卡片的发光强度
      let minDistance = Infinity;
      cards.forEach(card => {
        const cr = card.getBoundingClientRect();
        const cx = cr.left + cr.width / 2;
        const cy = cr.top + cr.height / 2;
        const dist = Math.hypot(e.clientX - cx, e.clientY - cy) - Math.max(cr.width, cr.height) / 2;
        const d = Math.max(0, dist);
        minDistance = Math.min(minDistance, d);

        let intensity = 0;
        if (d <= proximity) intensity = 1;
        else if (d <= fadeDistance) intensity = (fadeDistance - d) / (fadeDistance - proximity);

        updateCardGlow(card, e.clientX, e.clientY, intensity);
      });
    };

    const handleLeave = () => {
      gsap.to(spotlight, { opacity: 0, duration: 0.4, ease: 'power2.out' });
      containerRef.current?.querySelectorAll<HTMLElement>('.glow-card').forEach(c =>
        c.style.setProperty('--glow-intensity', '0')
      );
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseleave', handleLeave);

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseleave', handleLeave);
      spotlight.remove();
    };
  }, [containerRef, enabled, spotlightRadius, glowColor]);

  return null;
}
