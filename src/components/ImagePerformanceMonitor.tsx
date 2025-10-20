'use client';

import { useEffect, useState } from 'react';

interface ImagePerformanceMetrics {
  totalImages: number;
  loadedImages: number;
  failedImages: number;
  averageLoadTime: number;
  slowImages: number;
}

export function ImagePerformanceMonitor() {
  const [metrics, setMetrics] = useState<ImagePerformanceMetrics>({
    totalImages: 0,
    loadedImages: 0,
    failedImages: 0,
    averageLoadTime: 0,
    slowImages: 0
  });

  useEffect(() => {
    const startTimes = new Map<string, number>();
    const loadTimes: number[] = [];

    const handleImageLoad = (event: Event) => {
      const img = event.target as HTMLImageElement;
      const startTime = startTimes.get(img.src);
      
      if (startTime) {
        const loadTime = performance.now() - startTime;
        loadTimes.push(loadTime);
        
        setMetrics(prev => ({
          ...prev,
          loadedImages: prev.loadedImages + 1,
          averageLoadTime: loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length,
          slowImages: loadTimes.filter(time => time > 1000).length
        }));
      }
    };

    const handleImageError = () => {
      setMetrics(prev => ({
        ...prev,
        failedImages: prev.failedImages + 1
      }));
    };

    const handleImageStart = (event: Event) => {
      const img = event.target as HTMLImageElement;
      startTimes.set(img.src, performance.now());
    };

    // Monitor all images on the page
    const images = document.querySelectorAll('img');
    setMetrics(prev => ({ ...prev, totalImages: images.length }));

    images.forEach(img => {
      img.addEventListener('load', handleImageLoad);
      img.addEventListener('error', handleImageError);
      img.addEventListener('loadstart', handleImageStart);
    });

    return () => {
      images.forEach(img => {
        img.removeEventListener('load', handleImageLoad);
        img.removeEventListener('error', handleImageError);
        img.removeEventListener('loadstart', handleImageStart);
      });
    };
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded-lg text-xs z-50">
      <div className="font-bold mb-2">Image Performance</div>
      <div>Total: {metrics.totalImages}</div>
      <div>Loaded: {metrics.loadedImages}</div>
      <div>Failed: {metrics.failedImages}</div>
      <div>Avg Time: {metrics.averageLoadTime.toFixed(0)}ms</div>
      <div>Slow: {metrics.slowImages}</div>
    </div>
  );
}
