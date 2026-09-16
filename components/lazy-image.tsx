"use client";

import React, { useState } from "react";
import { ImageOff, Loader2 } from "lucide-react";

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
}

export default function LazyImage({
  src,
  alt,
  className = "",
  containerClassName = "",
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative overflow-hidden w-full h-full bg-gray-100 ${containerClassName}`}>
      {/* Shimmer / Skeleton while loading */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
          <div className="w-6 h-6 rounded-full border-2 border-rose-200 border-t-rose-500 animate-spin opacity-50" />
        </div>
      )}

      {/* Error Fallback */}
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 text-gray-400 p-2 text-center">
          <ImageOff className="w-6 h-6 mb-1 text-gray-300" />
          <span className="text-[10px] text-gray-400">Gagal memuat gambar</span>
        </div>
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? "opacity-100" : "opacity-0"
          } ${className}`}
          {...props}
        />
      )}
    </div>
  );
}
