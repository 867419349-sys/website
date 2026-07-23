import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import './ChromaGrid.css';

interface ChromaGridProps {
  onAllLoaded?: () => void;
}

export default function ChromaGrid({ onAllLoaded }: ChromaGridProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);
  const setX = useRef<((v: number) => void) | null>(null);
  const setY = useRef<((v: number) => void) | null>(null);
  const pos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    setX.current = gsap.quickSetter(el, '--x', 'px');
    setY.current = gsap.quickSetter(el, '--y', 'px');
    const { width, height } = el.getBoundingClientRect();
    pos.current = { x: width / 2, y: height / 2 };
    setX.current(pos.current.x);
    setY.current(pos.current.y);
  }, []);

  const onImgLoad = () => {
    onAllLoaded?.();
  };

  const moveTo = (x: number, y: number) => {
    gsap.to(pos.current, {
      x, y,
      duration: 0.45,
      ease: 'power3.out',
      onUpdate: () => {
        setX.current?.(pos.current.x);
        setY.current?.(pos.current.y);
      },
      overwrite: true,
    });
  };

  const handleMove = (e: React.PointerEvent) => {
    const r = rootRef.current!.getBoundingClientRect();
    moveTo(e.clientX - r.left, e.clientY - r.top);
    gsap.to(fadeRef.current, { opacity: 0, duration: 0.25, overwrite: true });
  };

  const handleLeave = () => {
    gsap.to(fadeRef.current, { opacity: 1, duration: 0.6, overwrite: true });
  };

  const handleCardMove = (e: React.MouseEvent) => {
    const card = e.currentTarget as HTMLElement;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <div
      ref={rootRef}
      className="chroma-grid"
      style={{ '--r': '220px' } as React.CSSProperties}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      <article className="chroma-card chroma-card--edu" onMouseMove={handleCardMove}>
        <img src="/assets/about/education.webp" alt="" draggable={false} onLoad={onImgLoad} />
      </article>
      <article className="chroma-card chroma-card--work" onMouseMove={handleCardMove}>
        <img src="/assets/about/work.webp" alt="" draggable={false} onLoad={onImgLoad} />
      </article>
      <article className="chroma-card chroma-card--skills" onMouseMove={handleCardMove}>
        <img src="/assets/about/skills.webp" alt="" draggable={false} onLoad={onImgLoad} />
      </article>
      <article className="chroma-card chroma-card--tools" onMouseMove={handleCardMove}>
        <img src="/assets/about/tools.webp" alt="" draggable={false} onLoad={onImgLoad} />
      </article>

      <div ref={fadeRef} className="chroma-grid-overlay" />
    </div>
  );
}
