import { useRef, useEffect, useMemo } from 'react';
import gsap from 'gsap';
import GradualBlur from './GradualBlur';

const IMAGES = Array.from({ length: 18 }, (_, i) => ({
  src: `/assets/works-grid/${String(i + 1).padStart(2, '0')}.png`,
  alt: `作品 ${i + 1}`,
}));

type CardShape = 'portrait' | 'square' | 'landscape' | 'wide';

interface CardDef {
  src: string;
  alt: string;
  shape: CardShape;
}

const SHAPE_CLASSES: Record<CardShape, string> = {
  portrait: 'aspect-[3/4]',
  square: 'aspect-square',
  landscape: 'aspect-[4/3]',
  wide: 'aspect-[16/9]',
};

function createRows(): CardDef[][] {
  const shapes: CardShape[] = [
    'portrait', 'landscape', 'square', 'wide', 'portrait', 'square',
    'landscape', 'square', 'portrait', 'wide', 'square', 'landscape',
    'wide', 'portrait', 'landscape', 'square', 'portrait', 'wide',
  ];
  const cards: CardDef[] = IMAGES.map((img, i) => ({
    ...img,
    shape: shapes[i],
  }));
  return [cards.slice(0, 6), cards.slice(6, 12), cards.slice(12, 18)];
}

export default function SectionWorksGrid() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const rows = useMemo(() => createRows(), []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const tracks = section.querySelectorAll<HTMLDivElement>('.scroll-track');
    const tweens: gsap.core.Tween[] = [];

    const ctx = gsap.context(() => {
      tracks.forEach((track, i) => {
        const halfWidth = track.scrollWidth / 2;
        // 每行不同速度，营造层次感
        const durations = [38, 42, 36];
        const speed = durations[i] ?? 40;

        gsap.set(track, { x: 0 });

        const tween = gsap.to(track, {
          x: -halfWidth,
          duration: speed,
          ease: 'none',
          repeat: -1,
        });
        tweens.push(tween);
      });
    }, section);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-black py-[clamp(60px,8vw,150px)] overflow-hidden"
    >
      {/* 左侧黑色渐变遮罩 */}
      <div
        className="absolute left-0 top-0 bottom-0 z-10 pointer-events-none"
        style={{ width: 'clamp(80px,10vw,200px)', background: 'linear-gradient(to right, black 0%, transparent 100%)' }}
      />
      {/* 右侧黑色渐变遮罩 */}
      <div
        className="absolute right-0 top-0 bottom-0 z-10 pointer-events-none"
        style={{ width: 'clamp(80px,10vw,200px)', background: 'linear-gradient(to left, black 0%, transparent 100%)' }}
      />

      <div className="flex flex-col gap-[clamp(16px,2vw,32px)]">
        {rows.map((row, ri) => (
          <div key={ri} className="scroll-track flex gap-[clamp(12px,1.5vw,24px)] will-change-transform select-none" style={{ width: 'max-content' }}>
            {/* 第一组作品 */}
            {row.map((card, ci) => (
              <div
                key={`a-${ci}`}
                className={`${SHAPE_CLASSES[card.shape]} flex-shrink-0 overflow-hidden rounded-[clamp(8px,1vw,16px)] bg-[#1a1a1a]`}
                style={{
                  width: card.shape === 'wide' ? 'clamp(240px,24vw,420px)' :
                         card.shape === 'landscape' ? 'clamp(200px,20vw,340px)' :
                         card.shape === 'portrait' ? 'clamp(160px,16vw,260px)' :
                         'clamp(180px,18vw,300px)',
                  boxShadow: '0 0 0 1px rgba(255,255,255,0.06)',
                }}
              >
                <img
                  src={card.src}
                  alt={card.alt}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  draggable={false}
                />
              </div>
            ))}
            {/* 第二组重复作品（实现无缝循环） */}
            {row.map((card, ci) => (
              <div
                key={`b-${ci}`}
                className={`${SHAPE_CLASSES[card.shape]} flex-shrink-0 overflow-hidden rounded-[clamp(8px,1vw,16px)] bg-[#1a1a1a]`}
                style={{
                  width: card.shape === 'wide' ? 'clamp(240px,24vw,420px)' :
                         card.shape === 'landscape' ? 'clamp(200px,20vw,340px)' :
                         card.shape === 'portrait' ? 'clamp(160px,16vw,260px)' :
                         'clamp(180px,18vw,300px)',
                  boxShadow: '0 0 0 1px rgba(255,255,255,0.06)',
                }}
              >
                <img
                  src={card.src}
                  alt={card.alt}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
      <GradualBlur position="bottom" height="8rem" strength={2} divCount={6} curve="bezier" />
    </section>
  );
}
