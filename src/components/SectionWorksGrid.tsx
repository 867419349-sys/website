import { useRef, useEffect, useMemo } from 'react';
import gsap from 'gsap';

const TOTAL = 15;
const IMAGES = Array.from({ length: TOTAL }, (_, i) => ({
  src: `/assets/works-grid/${String(i + 1).padStart(2, '0')}.jpg`,
  alt: `作品 ${i + 1}`,
}));

interface CardDef { src: string; alt: string; }

function createRows(): CardDef[][] {
  const cards: CardDef[] = IMAGES.map((img) => ({ ...img }));
  return [cards.slice(0, 5), cards.slice(5, 10), cards.slice(10, 15)];
}

const CARD_W = 'clamp(160px,18vw,280px)';
const CARD_W_EXPANDED = 'clamp(270px,30vw,476px)';
const DRAG_THRESHOLD = 3;
const BASE_SPEED = 50; // px/s，基准自动滚动速度

export default function SectionWorksGrid() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const rows = useMemo(() => createRows(), []);
  const rafRef = useRef<number>(0);
  const velRef = useRef<number>(BASE_SPEED);
  const targetVelRef = useRef<number>(BASE_SPEED);
  const posRef = useRef<number[]>([0, 0, 0]);
  const hwRef = useRef<number[]>([0, 0, 0]);
  const dragRef = useRef<{
    startMouseX: number;
    basePositions: number[]; // 按下时 rAF 计算出的位置（不含拖拽偏移）
    lastMouseX: number;
    lastTime: number;
    prevMouseX: number;
    prevTime: number;
    moved: boolean;
    allCards: HTMLElement[];
  } | null>(null);
  const velTweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const tracks = Array.from(section.querySelectorAll<HTMLDivElement>('.scroll-track'));
    const allCards = tracks.flatMap((t) => Array.from(t.querySelectorAll('.wcard'))) as HTMLElement[];

    const hwList: number[] = [];
    tracks.forEach((track) => {
      hwList.push(track.scrollWidth / 2);
      track.style.transform = 'translate3d(0, 0, 0)';
    });
    hwRef.current = hwList;

    // ---- rAF：始终运行，驱动自动滚动 ----
    let lastTime = performance.now();
    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const ds = dragRef.current;
      const vel = velRef.current;

      for (let i = 0; i < tracks.length; i++) {
        // 自动滚动位置（始终运行）
        let x = posRef.current[i] - vel * dt;
        const hw = hwList[i];
        if (x < -hw) x += hw;
        else if (x > 0) x -= hw;
        posRef.current[i] = x;

        // 拖拽偏移叠加
        if (ds && ds.moved) {
          const dx = ds.lastMouseX - ds.startMouseX;
          x += dx;
        }

        tracks[i].style.transform = `translate3d(${x}px, 0, 0)`;
      }

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    // ---- 拖拽：不停止自动滚动，而是叠加偏移 ----
    const onDown = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.scroll-track')) return;
      e.preventDefault();

      velTweenRef.current?.kill();

      dragRef.current = {
        startMouseX: e.clientX,
        basePositions: [...posRef.current],
        lastMouseX: e.clientX,
        lastTime: Date.now(),
        prevMouseX: e.clientX,
        prevTime: Date.now(),
        moved: false,
        allCards,
      };
    };

    const onMove = (e: MouseEvent) => {
      const ds = dragRef.current;
      if (!ds) return;

      const dx = e.clientX - ds.startMouseX;
      if (!ds.moved && Math.abs(dx) < DRAG_THRESHOLD) return;

      if (!ds.moved) {
        ds.moved = true;
        ds.allCards.forEach((c) => c.style.transition = 'none');
        tracks.forEach((t) => t.style.cursor = 'grabbing');
      }

      ds.prevMouseX = ds.lastMouseX;
      ds.prevTime = ds.lastTime;
      ds.lastMouseX = e.clientX;
      ds.lastTime = Date.now();
      // 位置在 rAF 循环中更新，这里只记录鼠标
    };

    const onUp = () => {
      const ds = dragRef.current;
      if (!ds) return;

      ds.allCards.forEach((c) => c.style.transition = '');
      tracks.forEach((t) => t.style.cursor = '');

      // 把拖拽偏移融入 velRef，让 rAF 复位
      const dragDx = ds.lastMouseX - ds.startMouseX;
      for (let i = 0; i < tracks.length; i++) {
        posRef.current[i] += dragDx;
        // 包裹回合法范围
        const hw = hwList[i];
        while (posRef.current[i] < -hw) posRef.current[i] += hw;
        while (posRef.current[i] > 0) posRef.current[i] -= hw;
      }

      if (ds.moved) {
        const dtMs = ds.lastTime - ds.prevTime;
        const mouseDx = ds.lastMouseX - ds.prevMouseX;
        const mouseVel = dtMs > 10 ? mouseDx / dtMs * 1000 : 0;
        // 拖拽速度影响自动滚动速度：同向加速，反向减速
        velRef.current = BASE_SPEED - mouseVel;
      }

      // 速度平滑回归基准
      velTweenRef.current = gsap.to(velRef, {
        current: targetVelRef.current,
        duration: ds.moved ? 2.5 : 0.4,
        ease: 'power2.out',
        overwrite: 'auto',
      });

      dragRef.current = null;
    };

    tracks.forEach((t) => t.addEventListener('mousedown', onDown));
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    return () => {
      cancelAnimationFrame(rafRef.current);
      velTweenRef.current?.kill();
      tracks.forEach((t) => t.removeEventListener('mousedown', onDown));
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-black py-[clamp(60px,8vw,150px)] overflow-hidden cursor-grab"
    >
      <style>{`
        .wcard {
          width: ${CARD_W};
          height: ${CARD_W};
          border-radius: clamp(8px,1vw,16px);
          overflow: hidden;
          background: #1a1a1a;
          box-shadow: 0 0 0 1px rgba(255,255,255,0.06);
          transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1),
                      box-shadow 0.4s ease;
        }
        .wcard:hover {
          width: ${CARD_W_EXPANDED} !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.15) !important;
          z-index: 20 !important;
        }
      `}</style>

      <div
        className="absolute left-0 top-0 bottom-0 z-10 pointer-events-none"
        style={{ width: 'clamp(80px,10vw,200px)', background: 'linear-gradient(to right, black 0%, transparent 100%)' }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 z-10 pointer-events-none"
        style={{ width: 'clamp(80px,10vw,200px)', background: 'linear-gradient(to left, black 0%, transparent 100%)' }}
      />

      <div className="flex flex-col gap-[clamp(16px,2vw,32px)]">
        {rows.map((row, ri) => (
          <div
            key={ri}
            className="scroll-track flex gap-[clamp(12px,1.5vw,24px)] will-change-transform select-none"
            style={{ width: 'max-content' }}
          >
            {row.map((card, ci) => (
              <div key={`${ri}-${ci}-a`} className="wcard flex-shrink-0">
                <img
                  src={card.src} alt={card.alt}
                  className="h-full w-full object-cover pointer-events-none"
                  loading="lazy" draggable={false}
                />
              </div>
            ))}
            {row.map((card, ci) => (
              <div key={`${ri}-${ci}-b`} className="wcard flex-shrink-0">
                <img
                  src={card.src} alt={card.alt}
                  className="h-full w-full object-cover pointer-events-none"
                  loading="lazy" draggable={false}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
