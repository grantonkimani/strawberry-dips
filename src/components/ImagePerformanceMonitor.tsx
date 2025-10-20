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
    // Simple image count without performance monitoring to avoid re-render issues
    const images = document.querySelectorAll('img');
    setMetrics(prev => ({ ...prev, totalImages: images.length }));
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded-lg text-xs z-50">
      <div className="font-bold mb-2">Images</div>
      <div>Total: {metrics.totalImages}</div>
    </div>
  );
}
