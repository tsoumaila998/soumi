import React, { useState } from 'react';
import { Film } from 'lucide-react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackTitle?: string;
  isPoster?: boolean;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt = '',
  className = '',
  fallbackTitle,
  isPoster = true,
  ...props
}) => {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (error || !src) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center bg-gradient-to-br from-[#16161d] to-[#22222d] text-zinc-400 p-4 select-none ${className}`}
      >
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          <Film className="w-8 h-8 text-zinc-600 animate-pulse" />
          {fallbackTitle && (
            <span className="text-xs font-medium text-zinc-300 line-clamp-2 px-2">
              {fallbackTitle}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-[#16161d] animate-pulse" />
      )}
      <img
        src={src}
        alt={alt || fallbackTitle || 'Media'}
        referrerPolicy="no-referrer"
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        {...props}
      />
    </div>
  );
};
