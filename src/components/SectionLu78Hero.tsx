import { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';

const HERO_IMAGES = ['/assets/lu78/hero-media/hero-1.webp', '/assets/lu78/hero-media/hero-3.webp'];
const TOTAL_SLIDES = HERO_IMAGES.length;

export default function SectionLu78Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imagesReady, setImagesReady] = useState<Record<number, boolean>>({});
  const slideRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<number | null>(null);

  const goToSlide = useCallback((index: number) => {
    if (!slideRef.current) return;
    const slides = slideRef.current.children;
    const target = slides[index] as HTMLElement;
    if (!target) return;

    // 当前图片淡出
    const current = slides[currentSlide] as HTMLElement;
    if (current && current !== target) {
      gsap.to(current, { opacity: 0, duration: 0.8, ease: 'power2.inOut' });
    }

    // 新图片淡入 + 缩放
    gsap.fromTo(target, { opacity: 0, scale: 1.04 }, { opacity: 1, scale: 1, duration: 1.2, ease: 'power3.out' });

    setCurrentSlide(index);
  }, [currentSlide]);

  // 自动轮播
  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      setCurrentSlide(prev => {
        const next = (prev + 1) % TOTAL_SLIDES;
        return next;
      });
    }, 4000);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, []);

  // 切换动画
  useEffect(() => {
    if (!slideRef.current) return;
    const slides = slideRef.current.children;
    [...slides].forEach((slide, i) => {
      const el = slide as HTMLElement;
      if (i === currentSlide) {
        gsap.to(el, { opacity: 1, scale: 1, duration: 1.2, ease: 'power3.out' });
      } else {
        gsap.to(el, { opacity: 0, scale: 1.04, duration: 0.8, ease: 'power2.inOut' });
      }
    });
  }, [currentSlide]);

  return (
    <section
      id="lu78-hero"
      className="relative h-screen w-full overflow-hidden bg-black"
      style={{ height: '100dvh' }}
    >
      {/* 轮播图片容器 */}
      <div ref={slideRef} className="absolute -inset-px">
        {HERO_IMAGES.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`首页轮播 ${i + 1}`}
            className="absolute inset-0 w-full h-full"
            style={{
              objectFit: 'cover',
              opacity: i === 0 ? 1 : 0,
              filter: 'saturate(1.1)',
              transition: 'none',
            }}
            onLoad={() => setImagesReady(prev => ({ ...prev, [i]: true }))}
          />
        ))}
      </div>

      {/* 渐变叠加层 1: 线性渐变暗角 */}
      <div
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.16) 36%, rgba(0,0,0,0.38) 100%)',
        }}
      />

      {/* 渐变叠加层 2: 径向光斑 */}
      <div
        className="pointer-events-none absolute inset-0 z-[3]"
        style={{
          background:
            'radial-gradient(circle at 16% 56%, rgba(0,0,0,0.22), transparent 34%), radial-gradient(circle at 24% 40%, rgba(255,255,255,0.04), transparent 18%), radial-gradient(circle at 36% 50%, rgba(173,255,98,0.04), transparent 20%)',
        }}
      />

      {/* 轮播指示器 */}
      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/18 px-3 py-2 backdrop-blur-sm">
        {HERO_IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setCurrentSlide(i);
              if (intervalRef.current) window.clearInterval(intervalRef.current);
              intervalRef.current = window.setInterval(() => {
                setCurrentSlide(prev => (prev + 1) % TOTAL_SLIDES);
              }, 4000);
            }}
            className="rounded-full transition-all duration-500"
            style={{
              width: i === currentSlide ? '32px' : '10px',
              height: '10px',
              background: i === currentSlide ? '#fff' : 'rgba(255,255,255,0.45)',
            }}
            aria-label={`切换到第 ${i + 1} 个轮播媒体`}
          />
        ))}
      </div>

      {/* 向下滚动提示 */}
      <div className="absolute bottom-24 left-1/2 z-10 -translate-x-1/2 animate-bounce opacity-40">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
    </section>
  );
}
