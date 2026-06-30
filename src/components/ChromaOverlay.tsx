import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import './ChromaOverlay.css';

interface CardZone {
  id: string;
  x: number; y: number;
  w: number; h: number;
}

interface ChromaOverlayProps {
  cards: CardZone[];
  refW: number;
  refH: number;
  zoneRef?: React.RefObject<HTMLDivElement | null>;
}

const pct = (px: number, ref: number) => `${(px / ref) * 100}%`;

export default function ChromaOverlay({ cards, refW, refH, zoneRef }: ChromaOverlayProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);
  const setX = useRef<((v: number) => void) | null>(null);
  const setY = useRef<((v: number) => void) | null>(null);
  const pos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (zoneRef) zoneRef.current = el;
    setX.current = gsap.quickSetter(el, '--x', 'px');
    setY.current = gsap.quickSetter(el, '--y', 'px');
    const { width, height } = el.getBoundingClientRect();
    pos.current = { x: width / 2, y: height / 2 };
    setX.current(pos.current.x);
    setY.current(pos.current.y);
  }, []);

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
    card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    card.style.setProperty('--my', `${e.clientY - rect.top}px`);
  };

  const cardTops = [cards[0].y, cards[1].y, cards[2].y, cards[3].y];
  const cardLefts = [Math.min(cards[0].x, cards[2].x), Math.min(cards[0].x, cards[2].x), cards[2].x, cards[3].x];
  const topBound = Math.min(...cardTops);
  const leftBound = Math.min(...cardLefts);
  const bottomBound = Math.max(cards[2].y + cards[2].h, cards[3].y + cards[3].h);
  const rightBound = Math.max(cards[0].x + cards[0].w, cards[1].x + cards[1].w, cards[3].x + cards[3].w);
  const totalW = rightBound - leftBound;
  const totalH = bottomBound - topBound;

  return (
    <div
      className="chroma-overlay"
      style={{
        left: pct(leftBound, refW),
        top: pct(topBound, refH),
        width: pct(totalW, refW),
        height: pct(totalH, refH),
        '--r': '220px',
      } as React.CSSProperties}
    >
      <div
        ref={rootRef}
        className="chroma-zone"
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
      >
        {cards.map((c) => (
          <div
            key={c.id}
            className="chroma-spot"
            style={{
              left: pct(c.x - leftBound, totalW),
              top: pct(c.y - topBound, totalH),
              width: pct(c.w, totalW),
              height: pct(c.h, totalH),
            }}
            onMouseMove={handleCardMove}
          />
        ))}
        <div ref={fadeRef} className="chroma-fade-mask" />
      </div>
    </div>
  );
}
