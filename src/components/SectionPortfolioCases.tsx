import { useRef, useEffect, useCallback, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const FW = 4480;
const FH = 2318;
const pct = (v: number, base: number) => `${((v / base) * 100).toFixed(3)}%`;
const A = '/assets/portfolio-cases';

interface Layer { file: string; iw: number; ih: number; cx: number; cy: number }
interface Card {
  id: string; iw: number; ih: number; x: number; y: number;
  works: Layer[];
  texts: Layer[];
}

const CARDS: Card[] = [
  { id:'01', iw:1065, ih:1287, x:136, y:764,
    works:[{ file:'01作品.png', iw:790, ih:576, cx:617.88, cy:1639.32 }],
    texts:[{ file:'01文字.png', iw:718, ih:189, cx:649.12, cy:1216.09 }] },
  { id:'02', iw:1186, ih:1377, x:520, y:941,
    works:[{ file:'02作品.png', iw:762, ih:618, cx:1140.77, cy:1883.94 }],
    texts:[{ file:'02字体.png', iw:724, ih:392, cx:1077.94, cy:1450.63 }] },
  { id:'03', iw:1021, ih:1378, x:1177, y:372,
    works:[{ file:'03作品.png', iw:721, ih:546, cx:1706.24, cy:1356.93 }],
    texts:[{ file:'03字体.png', iw:726, ih:359, cx:1673.73, cy:878.77 }] },
  { id:'04', iw:1024, ih:1279, x:1572, y:972,
    works:[{ file:'04作品.png', iw:710, ih:514, cx:2055.85, cy:1882.62 }],
    texts:[{ file:'04字体.png', iw:701, ih:484, cx:2110.67, cy:1411.33 }] },
  { id:'05', iw:1172, ih:1418, x:2198.13, y:518.96,
    works:[{ file:'05作品.png', iw:688, ih:487, cx:2755.69, cy:1488.57 }],
    texts:[{ file:'05字体.png', iw:691, ih:424, cx:2760.21, cy:1047.96 }] },
  { id:'06', iw:1160, ih:1333, x:2663, y:972,
    works:[{ file:'06作品.png', iw:813, ih:635, cx:3273.04, cy:1867.46 }],
    texts:[{ file:'06字体.png', iw:663, ih:332, cx:3192.38, cy:1418.98 }] },
  { id:'07', iw:1108, ih:1378, x:3243, y:552,
    works:[{ file:'07作品.png', iw:697, ih:523, cx:3738.36, cy:1537.75 }],
    texts:[{ file:'07字体.png', iw:725, ih:614, cx:3741.95, cy:1084.96 }] },
];

export default function SectionPortfolioCases() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lastHovered = useRef<number | null>(null);
  const dropDone = useRef(false);
  const scatterTime = useRef(0);
  const currentScore = useRef(Infinity);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);

  const resetCards = useCallback(() => {
    if (!dropDone.current) return;
    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    cards.forEach(c => { c.style.removeProperty('--tx'); c.style.removeProperty('--ty'); });
    gsap.to(cards, { x: 0, y: 0, scale: 1, duration: 0.4, ease: 'power2.out' });
    lastHovered.current = null;
  }, []);

  const scatterFrom = useCallback((hoveredIndex: number) => {
    if (!dropDone.current) return;
    if (lastHovered.current === hoveredIndex) return;
    lastHovered.current = hoveredIndex;
    scatterTime.current = Date.now();
    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    const hc = CARDS[hoveredIndex];
    const cx = hc.x + hc.iw / 2;
    const cy = hc.y + hc.ih / 2;

    cards.forEach((card, i) => {
      if (i === hoveredIndex) {
        card.style.setProperty('--tx', '0');
        card.style.setProperty('--ty', '0');
        gsap.to(card, { scale: 1.08, duration: 0.35, ease: 'power2.out' });
      } else {
        const tc = CARDS[i];
        const dx = tc.x + tc.iw / 2 - cx;
        const dy = tc.y + tc.ih / 2 - cy;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const tx = (dx / dist) * 100;
        const ty = (dy / dist) * 100;
        card.style.setProperty('--tx', String(tx));
        card.style.setProperty('--ty', String(ty));
        gsap.to(card, { x: tx, y: ty, scale: 0.92, duration: 0.4, ease: 'power2.out' });
      }
    });
  }, []);

  useEffect(() => {
    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    if (cards.length === 0 || !sectionRef.current) return;

    let dropTimer: ReturnType<typeof setTimeout> | null = null;

    const ctx = gsap.context(() => {
      // 初始状态
      gsap.set(cards, { y: -400, opacity: 0 });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top bottom',
        onEnter: () => {
          dropDone.current = false;
          if (dropTimer) clearTimeout(dropTimer);
          cards.forEach((card, i) => {
            const tl = gsap.timeline({ delay: i * 0.18 });
            tl.fromTo(card,
              { y: -400, opacity: 0, scale: 0.92 },
              { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'power4.in' },
              0
            );
            tl.to(card, { scale: 1.05, duration: 0.08, ease: 'power2.out' });
            tl.to(card, { scale: 1, duration: 0.2, ease: 'back.out(2)' });
          });
          const totalTime = (cards.length - 1) * 0.18 + 0.8 + 0.08 + 0.2 + 0.1;
          dropTimer = setTimeout(() => { dropDone.current = true; }, totalTime * 1000);
        },
        onLeaveBack: () => {
          dropDone.current = false;
          if (dropTimer) clearTimeout(dropTimer);
          gsap.set(cards, { y: -400, opacity: 0 });
        },
      });
    }, sectionRef);

    return () => {
      if (dropTimer) clearTimeout(dropTimer);
      ctx.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full" style={{ background: '#ededed', overflow: 'visible' }}>
      <div className="relative w-full overflow-visible" style={{ aspectRatio: `${FW} / ${FH}` }}
        onMouseMove={(e) => {
          if (!dropDone.current) return;
          const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
          const rect = e.currentTarget.getBoundingClientRect();
          const scaleX = FW / rect.width;
          const scaleY = FH / rect.height;
          const mx = (e.clientX - rect.left) * scaleX;
          const my = (e.clientY - rect.top) * scaleY;
          let best = -1, bestScore = Infinity;
          CARDS.forEach((c, i) => {
            const el = cards[i];
            const ox = el ? parseFloat(el.style.getPropertyValue('--tx') || '0') : 0;
            const oy = el ? parseFloat(el.style.getPropertyValue('--ty') || '0') : 0;
            const cx = c.x + c.iw / 2 + ox;
            const cy = c.y + c.ih / 2 + oy;
            const dx = (mx - cx) / (c.iw / 2);
            const dy = (my - cy) / (c.ih / 2);
            const score = dx * dx + dy * dy; // 归一化距离平方
            if (score < bestScore && score < 0.7) { bestScore = score; best = i; }
          });
          if (best >= 0 && best !== lastHovered.current) {
            currentScore.current = bestScore;
            scatterFrom(best);
          } else if (best < 0 && Date.now() - scatterTime.current > 400) {
            resetCards();
          }
        }}
        onMouseLeave={resetCards}
      >
        <img src={`${A}/PROJECT.png`} alt="" className="absolute"
          style={{ left:pct(104.5,FW), top:pct(201,FH), width:pct(2396,FW), height:pct(369,FH) }}
          draggable={false} />
        <img src={`${A}/精选作品.png`} alt="精选作品" className="absolute"
          style={{ left:pct(228.5,FW), top:pct(294.5,FH), width:pct(1257,FW), height:pct(309,FH) }}
          draggable={false} />

        {CARDS.map((c, i) => (
          <div key={c.id} ref={el => { cardRefs.current[i] = el; }} className="absolute"
            style={{ left:pct(c.x,FW), top:pct(c.y,FH), width:pct(c.iw,FW), height:pct(c.ih,FH) }}>
            <img src={`${A}/${c.id}.png`} alt="" className="absolute inset-0 w-full h-full"
              onMouseEnter={() => { if (dropDone.current) scatterFrom(i); }}
              onClick={() => {
                if (c.id === '02') setVideoSrc(`${A}/videos/节日彩蛋.mp4`);
                if (c.id === '04') setVideoSrc(`${A}/videos/情景模式.mp4`);
              }}
              style={{ cursor: (c.id === '02' || c.id === '04') ? 'pointer' : undefined }}
              draggable={false} />
            {[...c.works, ...c.texts].map(l => (
              <img key={l.file} src={`${A}/${l.file}`} alt="" className="absolute" draggable={false}
                style={{
                  pointerEvents: 'none',
                  width: pct(l.iw, c.iw), height: pct(l.ih, c.ih),
                  left: pct(l.cx - l.iw/2 - c.x, c.iw),
                  top: pct(l.cy - l.ih/2 - c.y, c.ih),
                }} />
            ))}
          </div>
        ))}
      </div>
      {videoSrc && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setVideoSrc(null)}
        >
          <video
            src={videoSrc}
            controls
            autoPlay
            className="max-w-[80%] max-h-[80%]"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}
