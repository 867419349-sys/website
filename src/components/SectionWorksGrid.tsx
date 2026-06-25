import { useRef, useEffect, useMemo } from 'react';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';

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
  const trackRef = useRef<HTMLDivElement>(null);
  const rows = useMemo(() => createRows(), []);

  useEffect(() => {
    const track = trackRef.current;
    const section = sectionRef.current;
    if (!track || !section) return;

    const ctx = gsap.context(() => {
      // Entrance animation
      gsap.fromTo(
        track,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Draggable with slow inertia for gentle horizontal scrolling
      Draggable.create(track, {
        type: 'x',
        inertia: true,
        bounds: {
          minX: -(track.scrollWidth - section.clientWidth + 40),
          maxX: 40,
        },
        edgeResistance: 0.92,
        dragResistance: 0.45,
        throwResistance: 3500,
        cursor: 'grab',
        activeCursor: 'grabbing',
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-black py-[clamp(60px,8vw,150px)] overflow-hidden"
    >
      <div
        ref={trackRef}
        className="flex flex-col gap-[clamp(16px,2vw,32px)] will-change-transform select-none"
        style={{ width: 'max-content', paddingLeft: 'clamp(20px,3vw,60px)', paddingRight: 'clamp(20px,3vw,60px)' }}
      >
        {rows.map((row, ri) => (
          <div key={ri} className="flex gap-[clamp(12px,1.5vw,24px)]">
            {row.map((card, ci) => (
              <div
                key={ci}
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
    </section>
  );
}
