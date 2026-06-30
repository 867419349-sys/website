import React, { useEffect, useRef, useState, useMemo } from 'react';
import './GradualBlur.css';

const DEFAULT_CONFIG = {
  position: 'bottom',
  strength: 2,
  height: '6rem',
  divCount: 5,
  exponential: false,
  zIndex: 1000,
  animated: false,
  duration: '0.3s',
  easing: 'ease-out',
  opacity: 1,
  curve: 'linear',
  responsive: false,
  target: 'parent',
  className: '',
  style: {}
};

const CURVE_FUNCTIONS: Record<string, (p: number) => number> = {
  linear: p => p,
  bezier: p => p * p * (3 - 2 * p),
  'ease-in': p => p * p,
  'ease-out': p => 1 - Math.pow(1 - p, 2),
  'ease-in-out': p => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2)
};

const mergeConfigs = (...configs: object[]) => Object.assign({}, ...configs) as Record<string, unknown>;
const getGradientDirection = (position: string) =>
  ({ top: 'to top', bottom: 'to bottom', left: 'to left', right: 'to right' })[position] || 'to bottom';

export interface GradualBlurProps {
  position?: 'top' | 'bottom' | 'left' | 'right';
  strength?: number;
  height?: string;
  width?: string;
  divCount?: number;
  exponential?: boolean;
  curve?: 'linear' | 'bezier' | 'ease-in' | 'ease-out' | 'ease-in-out';
  opacity?: number;
  animated?: boolean | 'scroll';
  duration?: string;
  easing?: string;
  hoverIntensity?: number;
  target?: 'parent' | 'page';
  responsive?: boolean;
  zIndex?: number;
  onAnimationComplete?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

function GradualBlur(props: GradualBlurProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const config = useMemo(() => mergeConfigs(DEFAULT_CONFIG, props), [props]);

  const blurDivs = useMemo(() => {
    const divs = [];
    const increment = 100 / config.divCount;
    const currentStrength =
      isHovered && config.hoverIntensity ? (config.strength as number) * (config.hoverIntensity as number) : (config.strength as number);

    const curveFunc = CURVE_FUNCTIONS[config.curve as string] || CURVE_FUNCTIONS.linear;

    for (let i = 1; i <= (config.divCount as number); i++) {
      let progress = i / (config.divCount as number);
      progress = curveFunc(progress);

      let blurValue: number;
      if (config.exponential) {
        blurValue = Math.pow(2, progress * 4) * 0.0625 * currentStrength;
      } else {
        blurValue = 0.0625 * (progress * (config.divCount as number) + 1) * currentStrength;
      }

      const p1 = Math.round((increment * i - increment) * 10) / 10;
      const p2 = Math.round(increment * i * 10) / 10;
      const p3 = Math.round((increment * i + increment) * 10) / 10;
      const p4 = Math.round((increment * i + increment * 2) * 10) / 10;

      let gradient = `transparent ${p1}%, black ${p2}%`;
      if (p3 <= 100) gradient += `, black ${p3}%`;
      if (p4 <= 100) gradient += `, transparent ${p4}%`;

      const direction = getGradientDirection(config.position as string);

      const divStyle: React.CSSProperties = {
        position: 'absolute',
        inset: '0',
        maskImage: `linear-gradient(${direction}, ${gradient})`,
        WebkitMaskImage: `linear-gradient(${direction}, ${gradient})`,
        backdropFilter: `blur(${blurValue.toFixed(3)}rem)`,
        WebkitBackdropFilter: `blur(${blurValue.toFixed(3)}rem)`,
        opacity: config.opacity as number,
        transition:
          config.animated && config.animated !== 'scroll'
            ? `backdrop-filter ${config.duration} ${config.easing}`
            : undefined
      };

      divs.push(<div key={i} style={divStyle} />);
    }

    return divs;
  }, [config, isHovered]);

  const isVertical = ['top', 'bottom'].includes(config.position as string);
  const isHorizontal = ['left', 'right'].includes(config.position as string);
  const isPageTarget = config.target === 'page';

  const containerStyle: React.CSSProperties = {
    position: isPageTarget ? 'fixed' : 'absolute',
    pointerEvents: config.hoverIntensity ? 'auto' : 'none',
    zIndex: isPageTarget ? (config.zIndex as number) + 100 : (config.zIndex as number),
    ...config.style as React.CSSProperties,
  };

  if (isVertical) {
    containerStyle.height = config.height as string;
    containerStyle.width = (config.width || '100%') as string;
    containerStyle[config.position as string] = 0;
    containerStyle.left = 0;
    containerStyle.right = 0;
  } else if (isHorizontal) {
    containerStyle.width = (config.width || config.height) as string;
    containerStyle.height = '100%';
    containerStyle[config.position as string] = 0;
    containerStyle.top = 0;
    containerStyle.bottom = 0;
  }

  return (
    <div
      ref={containerRef}
      className={`gradual-blur ${config.target === 'page' ? 'gradual-blur-page' : 'gradual-blur-parent'} ${config.className}`}
      style={containerStyle}
      onMouseEnter={config.hoverIntensity ? () => setIsHovered(true) : undefined}
      onMouseLeave={config.hoverIntensity ? () => setIsHovered(false) : undefined}
    >
      <div className="gradual-blur-inner" style={{ position: 'relative', width: '100%', height: '100%' }}>
        {blurDivs}
      </div>
    </div>
  );
}

export default React.memo(GradualBlur);
