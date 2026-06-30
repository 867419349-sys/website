import React, { useRef, useEffect, useCallback, useState } from 'react';
import ChromaOverlay from './ChromaOverlay';

/*
 * 坐标系统匹配新背景 bg.png (4418×2066)
 * Figma 原始 frame 坐标 (display:contents 穿透)
 */
const REF_W = 4418;
const REF_H = 2066;
const RATIO = REF_W / REF_H;

const pct = (px: number, ref: number) => `${(px / ref) * 100}%`;

interface Layer {
  src: string;
  cx: string; cy: string; cw: string; ch: string;
  z: number;
  rot?: number;
}

const LAYERS: Layer[] = [
  { src: '/assets/about/bg.png',
    cx: '0%', cy: '0%', cw: '100%', ch: '100%', z: 0 },
  { src: '/assets/about/design.png',
    cx: pct(529, REF_W), cy: pct(83, REF_H),
    cw: pct(2726, REF_W), ch: pct(1462, REF_H),
    z: 1 },
  { src: '/assets/about/character.png',
    cx: pct(427, REF_W), cy: pct(0, REF_H),
    cw: pct(3539, REF_W), ch: pct(2066, REF_H),
    z: 2 },
  { src: '/assets/about/education.png',
    cx: pct(2772, REF_W), cy: pct(342, REF_H),
    cw: pct(1046, REF_W), ch: pct(389, REF_H),
    z: 3 },
  { src: '/assets/about/work.png',
    cx: pct(2772, REF_W), cy: pct(759, REF_H),
    cw: pct(1093, REF_W), ch: pct(515, REF_H),
    z: 3 },
  { src: '/assets/about/skills.png',
    cx: pct(2733, REF_W), cy: pct(1296, REF_H),
    cw: pct(503, REF_W), ch: pct(483, REF_H),
    z: 3 },
  { src: '/assets/about/tools.png',
    cx: pct(3266, REF_W), cy: pct(1296, REF_H),
    cw: pct(552, REF_W), ch: pct(483, REF_H),
    z: 3 },
  { src: '/assets/about/hello.png',
    cx: pct(586, REF_W), cy: pct(520, REF_H),
    cw: pct(485, REF_W), ch: pct(431, REF_H),
    z: 4 },
  { src: '/assets/about/name.png',
    cx: pct(998, REF_W), cy: pct(758, REF_H),
    cw: pct(646, REF_W), ch: pct(200, REF_H),
    z: 4 },
  { src: '/assets/about/title.png',
    cx: pct(715.5, REF_W), cy: pct(997.74, REF_H),
    cw: pct(651, REF_W), ch: pct(100, REF_H),
    z: 4 },
  { src: '/assets/about/description.png',
    cx: pct(609, REF_W), cy: pct(1300, REF_H),
    cw: pct(728, REF_W), ch: pct(186, REF_H),
    z: 4 },
  { src: '/assets/about/ai-deco.png',
    cx: pct(2344.61, REF_W), cy: pct(695.74, REF_H),
    cw: pct(378, REF_W), ch: pct(242, REF_H),
    z: 5 },
  { src: '/assets/about/icon-edu.png',
    cx: pct(2820, REF_W), cy: pct(390, REF_H),
    cw: pct(104, REF_W), ch: pct(104, REF_H),
    z: 6 },
  { src: '/assets/about/icon-work.png',
    cx: pct(2820, REF_W), cy: pct(808, REF_H),
    cw: pct(104, REF_W), ch: pct(104, REF_H),
    z: 6 },
  { src: '/assets/about/icon-skills.png',
    cx: pct(2779, REF_W), cy: pct(1336, REF_H),
    cw: pct(104, REF_W), ch: pct(104, REF_H),
    z: 6 },
  { src: '/assets/about/icon-tools.png',
    cx: pct(3299, REF_W), cy: pct(1336, REF_H),
    cw: pct(104, REF_W), ch: pct(104, REF_H),
    z: 6 },
];

const TOTAL = LAYERS.length;

// 卡片区域：用于 ChromaOverlay 发光效果
const CARDS = [
  { id: 'edu', x: 2772, y: 342, w: 1046, h: 389 },
  { id: 'work', x: 2772, y: 759, w: 1093, h: 515 },
  { id: 'skills', x: 2733, y: 1296, w: 503, h: 483 },
  { id: 'tools', x: 3266, y: 1296, w: 552, h: 483 },
];

export default function SectionAbout() {
  const sectionRef = useRef<HTMLElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const loadedCount = useRef(0);

  const onAssetLoad = () => {
    loadedCount.current++;
    if (loadedCount.current >= TOTAL) setLoaded(true);
  };

  const syncSize = useCallback(() => {
    const section = sectionRef.current;
    const wrapper = wrapperRef.current;
    if (!section || !wrapper) return;
    const maxW = section.clientWidth;
    const maxH = section.clientHeight;
    let w: number, h: number;
    if (maxW / maxH > RATIO) { h = maxH; w = h * RATIO; }
    else { w = maxW; h = w / RATIO; }
    wrapper.style.width = `${w}px`;
    wrapper.style.height = `${h}px`;
  }, []);

  useEffect(() => {
    syncSize();
    window.addEventListener('resize', syncSize);
    return () => window.removeEventListener('resize', syncSize);
  }, [syncSize]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden flex items-center justify-center"
      style={{ minHeight: '100vh', background: '#06090e' }}
    >
      <div
        ref={wrapperRef}
        className="relative overflow-hidden select-none"
        style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.4s' }}
      >
        {LAYERS.map((a, i) => (
          <img
            key={i}
            src={a.src}
            alt=""
            className="absolute pointer-events-none"
            style={{
              left: a.cx,
              top: a.cy,
              width: a.cw,
              height: a.ch,
              zIndex: a.z,
              transform: a.rot ? `rotate(${a.rot}deg)` : undefined,
            }}
            draggable={false}
            onLoad={onAssetLoad}
          />
        ))}

        {/* Chroma 紫色发光交互覆盖层 */}
        <ChromaOverlay cards={CARDS} refW={REF_W} refH={REF_H} />
      </div>
    </section>
  );
}
