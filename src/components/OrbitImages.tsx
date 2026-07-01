import { useMemo, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import './OrbitImages.css';

function generateEllipsePath(cx: number, cy: number, rx: number, ry: number) {
  return `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy}`;
}

function generateCirclePath(cx: number, cy: number, r: number) {
  return generateEllipsePath(cx, cy, r, r);
}

function generateHeartPath(cx: number, cy: number, size: number) {
  const s = size / 30;
  return `M ${cx} ${cy + 12 * s} C ${cx - 20 * s} ${cy - 5 * s}, ${cx - 12 * s} ${cy - 18 * s}, ${cx} ${cy - 8 * s} C ${cx + 12 * s} ${cy - 18 * s}, ${cx + 20 * s} ${cy - 5 * s}, ${cx} ${cy + 12 * s}`;
}

function generateStarPath(cx: number, cy: number, outerR: number, innerR: number, points: number) {
  const step = Math.PI / points;
  let path = '';
  for (let i = 0; i < 2 * points; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = i * step - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    path += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  }
  return path + ' Z';
}

function OrbitItem({
  item, index, totalItems, path, itemSize, rotation, progress, fill,
}: {
  item: ReactNode;
  index: number;
  totalItems: number;
  path: string;
  itemSize: number;
  rotation: number;
  progress: any;
  fill: boolean;
}) {
  const itemOffset = fill ? (index / totalItems) * 100 : 0;
  const offsetDistance = useTransform(progress, (p: number) => `${(((p + itemOffset) % 100) + 100) % 100}%`);

  return (
    <motion.div
      className="orbit-item"
      style={{
        width: itemSize,
        height: itemSize,
        offsetPath: `path("${path}")`,
        offsetRotate: '0deg',
        offsetAnchor: 'center center',
        offsetDistance,
      }}
    >
      <div style={{ transform: `rotate(${-rotation}deg)` }}>{item}</div>
    </motion.div>
  );
}

interface OrbitImagesProps {
  images?: string[];
  altPrefix?: string;
  shape?: 'ellipse' | 'circle' | 'heart' | 'star';
  baseWidth?: number;
  radiusX?: number;
  radiusY?: number;
  radius?: number;
  starPoints?: number;
  starInnerRatio?: number;
  rotation?: number;
  duration?: number;
  itemSize?: number;
  direction?: 'normal' | 'reverse';
  fill?: boolean;
  width?: number | string;
  height?: number | string;
  className?: string;
  showPath?: boolean;
  pathColor?: string;
  pathWidth?: number;
  easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
  paused?: boolean;
  centerContent?: ReactNode;
  responsive?: boolean;
}

export default function OrbitImages({
  images = [],
  altPrefix = 'Orbiting image',
  shape = 'ellipse',
  baseWidth = 1400,
  radiusX = 700,
  radiusY = 170,
  radius = 300,
  starPoints = 5,
  starInnerRatio = 0.5,
  rotation = -8,
  duration = 40,
  itemSize = 64,
  direction = 'normal',
  fill = true,
  width = 100,
  height = 100,
  className = '',
  showPath = false,
  pathColor = 'rgba(255,255,255,0.05)',
  pathWidth = 2,
  easing = 'linear',
  paused = false,
  centerContent,
  responsive = false,
}: OrbitImagesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);
  const designCenterX = baseWidth / 2;
  const designCenterY = baseWidth / 2;

  const path = useMemo(() => {
    switch (shape) {
      case 'circle':
        return generateCirclePath(designCenterX, designCenterY, radius);
      case 'ellipse':
        return generateEllipsePath(designCenterX, designCenterY, radiusX, radiusY);
      case 'heart':
        return generateHeartPath(designCenterX, designCenterY, radius * 2);
      case 'star':
        return generateStarPath(designCenterX, designCenterY, radius, radius * starInnerRatio, starPoints);
      default:
        return generateEllipsePath(designCenterX, designCenterY, radiusX, radiusY);
    }
  }, [shape, designCenterX, designCenterY, radiusX, radiusY, radius, starPoints, starInnerRatio]);

  useLayoutEffect(() => {
    if (!responsive || !containerRef.current) return;
    const updateScale = () => {
      if (!containerRef.current) return;
      setScale(containerRef.current.clientWidth / baseWidth);
    };
    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [responsive, baseWidth]);

  const progress = useMotionValue(0);

  useEffect(() => {
    if (paused) return;
    const controls = animate(progress, direction === 'reverse' ? -100 : 100, {
      duration,
      ease: easing as any,
      repeat: Infinity,
      repeatType: 'loop',
    });
    return () => controls.stop();
  }, [progress, duration, easing, direction, paused]);

  const containerWidth = responsive ? '100%' : (typeof width === 'number' ? width : '100%');
  const containerHeight = responsive ? 'auto' : (typeof height === 'number' ? height : (typeof width === 'number' ? width : 'auto'));

  const items = images.map((src, idx) => (
    <img
      key={src}
      src={src}
      alt={`${altPrefix} ${idx + 1}`}
      draggable={false}
      className="orbit-image"
    />
  ));

  return (
    <div
      ref={containerRef}
      className={`orbit-container ${className}`}
      style={{
        width: containerWidth,
        height: containerHeight,
        aspectRatio: responsive ? '1 / 1' : undefined,
      }}
      aria-hidden="true"
    >
      <div
        className={responsive ? 'orbit-scaling-container orbit-scaling-container--responsive' : 'orbit-scaling-container'}
        style={{
          width: responsive ? baseWidth : '100%',
          height: responsive ? baseWidth : '100%',
          transform: responsive && scale !== null ? `translate(-50%, -50%) scale(${scale})` : undefined,
          visibility: responsive && scale === null ? 'hidden' : undefined,
        }}
      >
        <div
          className="orbit-rotation-wrapper"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {showPath && (
            <svg
              width="100%"
              height="100%"
              viewBox={`0 0 ${baseWidth} ${baseWidth}`}
              className="orbit-path-svg"
            >
              <path d={path} fill="none" stroke={pathColor} strokeWidth={pathWidth / (scale ?? 1)} />
            </svg>
          )}

          {items.map((item, index) => (
            <OrbitItem
              key={index}
              item={item}
              index={index}
              totalItems={items.length}
              path={path!}
              itemSize={itemSize}
              rotation={rotation}
              progress={progress}
              fill={fill}
            />
          ))}
        </div>
      </div>

      {centerContent && (
        <div className="orbit-center-content">
          {centerContent}
        </div>
      )}
    </div>
  );
}
