'use client';

import { useState } from 'react';
import Image from 'next/image';

interface SafeImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  quality?: number;
}

export function SafeImage({ 
  src, 
  alt, 
  width, 
  height, 
  className = '',
  fill = false,
  priority = false,
  sizes,
  quality = 85
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  // For Supabase images, use unoptimized to avoid server-side fetch issues on production
  const isSupabaseImage = src?.includes('supabase.co');
  
  // If image fails to load, show fallback
  const handleError = () => {
    if (!hasError) {
      setHasError(true);
    }
  };

  // Fallback to placeholder if image fails
  if (hasError) {
    return (
      <div className={`${fill ? 'absolute inset-0' : ''} ${className} bg-gradient-to-br from-pink-100 to-red-100 flex items-center justify-center`}>
        <span className="text-4xl">🍓</span>
      </div>
    );
  }

  const imageProps: any = {
    src,
    alt,
    className,
    loading: priority ? ('eager' as const) : ('lazy' as const),
    quality,
    unoptimized: isSupabaseImage, // Disable optimization for Supabase images to avoid server-side fetch issues
    onError: handleError,
    ...(fill ? { fill: true } : { width, height }),
    ...(sizes ? { sizes } : {}),
  };

  return <Image {...imageProps} />;
}

