import { useRef, useEffect, useState, useCallback, type MouseEvent as ReactMouseEvent } from 'react';
import gsap from 'gsap';

const CARD_COUNT = 21;
const CARDS = Array.from({ length: CARD_COUNT }, (_, i) => ({
  src: `/assets/lu78/card-wall/card-${String(i + 1).padStart(2, '0')}.webp`,
  alt: `卡片 ${i + 1}`,
}));

export default function SectionLu78Collage() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const wallRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, scrollLeft: 0 });
  const [loadedCount, setLoadedCount] = useState(0);
  const allLoaded = loadedCount >= CARD_COUNT;

  useEffect(() => {
    if (!allLoaded || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      const heading = sectionRef.current!.querySelector('.cardwall-heading');
      const subheading = sectionRef.current!.querySelector('.cardwall-subheading');
      const wall = sectionRef.current!.querySelector('.cardwall-container');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          toggleActions: 'play none none none',
        },
      });

      tl.fromTo(
        heading,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }
      )
        .fromTo(
          subheading,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
          '-=0.5'
        )
        .fromTo(
          wall,
          { opacity: 0, y: 60 },
          { opacity: 1, y: 0, duration: 1, ease: 'power4.out' },
          '-=0.3'
        );
    }, sectionRef);

    return () => ctx.revert();
  }, [allLoaded]);

  const handleMouseDown = useCallback((e: ReactMouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, scrollLeft: wallRef.current?.scrollLeft || 0 };
  }, []);

  const handleMouseMove = useCallback((e: ReactMouseEvent) => {
    if (!isDragging || !wallRef.current) return;
    e.preventDefault();
    const dx = e.clientX - dragStart.current.x;
    wallRef.current.scrollLeft = dragStart.current.scrollLeft - dx;
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    const cards = wallRef.current?.querySelectorAll('.wall-card');
    if (!cards) return;

    const handleEnter = (e: Event) => {
      const card = e.currentTarget as HTMLElement;
      gsap.to(card, {
        scale: 1.08,
        zIndex: 10,
        duration: 0.4,
        ease: 'power2.out',
        boxShadow: '0 24px 48px rgba(0,0,0,0.3)',
      });
    };
    const handleLeave = (e: Event) => {
      const card = e.currentTarget as HTMLElement;
      gsap.to(card, {
        scale: 1,
        zIndex: 1,
        duration: 0.5,
        ease: 'power2.out',
        boxShadow: 'rgba(255,255,255,0.05) 0px 0px 0px 1px',
      });
    };

    cards.forEach((card) => {
      card.addEventListener('mouseenter', handleEnter);
      card.addEventListener('mouseleave', handleLeave);
    });

    return () => {
      cards.forEach((card) => {
        card.removeEventListener('mouseenter', handleEnter);
        card.removeEventListener('mouseleave', handleLeave);
      });
    };
  }, [allLoaded]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-black py-[120px] sm:py-[180px] md:py-[250px] overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-4">
        {/* EVERYTHING TO → CREATE ANYTHING */}
        <div className="text-center mb-12 md:mb-20">
          <h3
            className="cardwall-heading font-medium uppercase leading-[0.9] tracking-[-0.08em]"
            style={{
              fontFamily: "'Urbanist', system-ui, -apple-system, 'Segoe UI', sans-serif",
              fontSize: 'clamp(2rem, 3.5vw, 5.8rem)',
              color: '#F2F0E8',
            }}
          >
            {/* Line 1: EVERY T HING — T is green */}
            <span className="block">
              {'EVERY'.split('').map((c, i) => (
                <span key={i}>{c}</span>
              ))}
              <span style={{ color: '#9CFF3F' }}>T</span>
              {'HING'.split('').map((c, i) => (
                <span key={i}>{c}</span>
              ))}
            </span>
            {/* Line 2: TO → CREA T E — arrow is green pill, T in CREATE is pink */}
            <span className="mt-2 block">
              <span className="inline-flex items-baseline gap-[0.15em]">
                {'TO'.split('').map((c, i) => (
                  <span key={i}>{c}</span>
                ))}
                <a
                  href="#"
                  className="inline-flex min-w-[3.25em] items-center justify-center rounded-full bg-[#9CFF3F] text-black no-underline mx-[0.08em]"
                  style={{ fontSize: '0.46em', height: '2.2em', verticalAlign: 'middle' }}
                  onClick={(e) => e.preventDefault()}
                >
                  →
                </a>
                {'CREA'.split('').map((c, i) => (
                  <span key={i}>{c}</span>
                ))}
                <span style={{ color: '#FFB8DF' }}>T</span>
                <span>E</span>
              </span>
            </span>
            {/* Line 3: ANYTHI N G — N is green */}
            <span className="mt-2 block">
              {'ANYTHI'.split('').map((c, i) => (
                <span key={i}>{c}</span>
              ))}
              <span style={{ color: '#9CFF3F' }}>N</span>
              <span>G</span>
            </span>
          </h3>

          <h2
            className="cardwall-subheading mt-6 md:mt-8 font-medium uppercase leading-[0.9] tracking-[-0.08em]"
            style={{
              fontFamily: "'Urbanist', system-ui, -apple-system, 'Segoe UI', sans-serif",
              fontSize: 'clamp(1.5rem, 3vw, 5.8rem)',
              color: '#F2F0E8',
            }}
          >
            {/* Line 1: CREATE DE S IGN — S is pink */}
            <span className="block">
              <span className="inline-flex items-baseline gap-[0.12em]">
                {'CREATE DE'.split('').map((c, i) => (
                  <span key={i}>{c}</span>
                ))}
                <span style={{ color: '#FFB8DF' }}>S</span>
                {'IGN'.split('').map((c, i) => (
                  <span key={i}>{c}</span>
                ))}
              </span>
            </span>
            {/* Line 2: WORK */}
            <span className="block mt-1">{'WORK'.split('').map((c, i) => (
              <span key={i}>{c}</span>
            ))}</span>
            {/* Line 3: A FU TURE — FU is green */}
            <span className="mt-2 block">
              <span className="inline-flex items-baseline gap-[0.12em]">
                <span>A </span>
                <span style={{ color: '#9CFF3F' }}>FU</span>
                {'TURE'.split('').map((c, i) => (
                  <span key={i}>{c}</span>
                ))}
              </span>
            </span>
          </h2>
        </div>
      </div>

      {/* 3D 卡片墙 */}
      <div
        ref={wallRef}
        className="cardwall-container relative overflow-x-auto overflow-y-hidden cursor-grab select-none"
        style={{
          perspective: '1200px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="flex gap-3 sm:gap-4 md:gap-5 px-4 sm:px-8 md:px-12 py-4 min-w-max mx-auto"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {CARDS.map((card, i) => {
            const distFromCenter = i - Math.floor(CARD_COUNT / 2);
            return (
              <div
                key={i}
                className="wall-card flex-shrink-0 overflow-hidden bg-[#1B1B1B] rounded-[clamp(12px,1.5vw,19px)] transition-transform duration-400 ease-out"
                style={{
                  width: 'clamp(130px, 14vw, 220px)',
                  aspectRatio: '1',
                  boxShadow: 'rgba(255,255,255,0.05) 0px 0px 0px 1px',
                  backfaceVisibility: 'hidden',
                  transform: `rotateY(${distFromCenter * 2.5}deg) translateZ(${Math.abs(distFromCenter) * -5}px)`,
                }}
              >
                <img
                  src={card.src}
                  alt={card.alt}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  onLoad={() => setLoadedCount((c) => c + 1)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
