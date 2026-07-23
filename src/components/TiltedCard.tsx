import { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { sounds } from '../utils/audio';
import './TiltedCard.css';

const springValues = { damping: 15, stiffness: 400, mass: 0.5 };

interface TiltedCardProps {
  imageSrc: string;
  altText?: string;
  containerHeight?: string;
  containerWidth?: string;
  scaleOnHover?: number;
  rotateAmplitude?: number;
  onLoad?: () => void;
  onError?: () => void;
  innerClassName?: string;
  children?: React.ReactNode;
}

export default function TiltedCard({
  imageSrc,
  altText = '',
  containerHeight = '100%',
  containerWidth = '100%',
  scaleOnHover = 1.05,
  rotateAmplitude = 12,
  onLoad,
  onError,
  innerClassName,
  children,
}: TiltedCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useSpring(useMotionValue(0), springValues);
  const rotateY = useSpring(useMotionValue(0), springValues);
  const scale = useSpring(1, springValues);

  function handleMouse(e: React.MouseEvent) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;
    rotateX.set((offsetY / (rect.height / 2)) * -rotateAmplitude);
    rotateY.set((offsetX / (rect.width / 2)) * rotateAmplitude);
    ref.current.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    ref.current.style.setProperty('--my', `${e.clientY - rect.top}px`);
  }

  function handleMouseEnter() {
    sounds.playHoverAbout();
    scale.set(scaleOnHover);
  }

  function handleMouseLeave() {
    scale.set(1);
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <figure
      ref={ref}
      className="tilted-card-figure"
      style={{ height: containerHeight, width: containerWidth }}
      onMouseMove={handleMouse}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className={`tilted-card-inner${innerClassName ? ` ${innerClassName}` : ''}`}
        style={{ rotateX, rotateY, scale }}
      >
        <img
          src={imageSrc}
          alt={altText}
          className="tilted-card-img"
          draggable={false}
          onLoad={onLoad}
          onError={onError}
        />
        {children}
      </motion.div>
    </figure>
  );
}
