'use client';

import { useState, useRef, useEffect } from 'react';
import { ImageIcon, AlertCircle } from 'lucide-react';

interface OptimizedImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackIcon?: string;
  fallbackIconSize?: 'sm' | 'md' | 'lg' | 'xl';
  priority?: boolean;
  placeholder?: string;
}

export function OptimizedImage({ 
  src, 
  alt, 
  className = '', 
  fallbackIcon = '🍷',
  fallbackIconSize = 'lg',
  priority = false,
  placeholder
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  const iconSizes = {
    sm: 'text-2xl',
    md: 'text-4xl', 
    lg: 'text-6xl',
    xl: 'text-8xl'
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !src) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before image comes into view
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, src]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Generate a low-quality placeholder from the image URL
  const generateBlurPlaceholder = (imageUrl: string) => {
    // For now, we'll use a simple blur effect
    // In production, you might want to generate actual low-quality placeholders
    return imageUrl;
  };

  // Show placeholder while loading (but keep container for observer)
  if (!isInView && !priority) {
    return (
      <div 
        ref={imgRef}
        className={`bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${className}`}
      >
        <div className="animate-pulse">
          <div className="w-full h-full bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  // Show error state
  if (hasError || !src) {
    return (
      <div className={`bg-gradient-to-br from-red-100 to-amber-100 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <span className={`${iconSizes[fallbackIconSize]} mb-2 block`}>
            {fallbackIcon}
          </span>
          {hasError && (
            <div className="flex items-center justify-center text-red-600 text-xs">
              <AlertCircle className="h-3 w-3 mr-1" />
              Failed to load
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-red-600 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Low-quality image placeholder */}
      {src && isLoading && isInView && (
        <img
          src={generateBlurPlaceholder(src)}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ 
            filter: 'blur(10px)',
            transform: 'scale(1.1)',
            opacity: 0.7
          }}
        />
      )}

      {/* Actual image - only render when in view or priority */}
      {isInView && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-cover transition-all duration-500 ${
            isLoading ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
          }`}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'low'}
          style={{
            contentVisibility: 'auto',
            containIntrinsicSize: '300px 300px'
          }}
        />
      )}
    </div>
  );
}

// Specialized components for different use cases
export function ProductImage({ 
  src, 
  alt, 
  className = 'aspect-square',
  fallbackIcon = '🍷'
}: {
  src?: string;
  alt: string;
  className?: string;
  fallbackIcon?: string;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={className}
      fallbackIcon={fallbackIcon}
      fallbackIconSize="lg"
    />
  );
}

export function HeroImage({ 
  src, 
  alt, 
  className = 'aspect-video',
  priority = true
}: {
  src?: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={className}
      fallbackIcon="🍷"
      fallbackIconSize="xl"
      priority={priority}
    />
  );
}

export function ThumbnailImage({ 
  src, 
  alt, 
  className = 'w-16 h-16',
  fallbackIcon = '🍷'
}: {
  src?: string;
  alt: string;
  className?: string;
  fallbackIcon?: string;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={className}
      fallbackIcon={fallbackIcon}
      fallbackIconSize="sm"
    />
  );
}
