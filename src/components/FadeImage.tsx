import { useState } from 'react';

interface FadeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  onImgLoad?: () => void;
}

export default function FadeImage({ onImgLoad, style, ...props }: FadeImageProps) {
  const [ready, setReady] = useState(false);

  return (
    <img
      {...props}
      style={{
        ...style,
        opacity: ready ? 1 : 0,
        transition: 'opacity 0.4s ease',
      }}
      onLoad={(e) => {
        setReady(true);
        onImgLoad?.();
        props.onLoad?.(e);
      }}
    />
  );
}
