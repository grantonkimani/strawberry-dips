'use client';

import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development or when explicitly enabled
    if (process.env.NODE_ENV !== 'development' && !localStorage.getItem('show-perf-monitor')) {
      return;
    }

    // Prevent multiple executions
    if (metrics) return;

    const measurePerformance = () => {
      if (typeof window === 'undefined' || !window.performance) return;

      try {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paintEntries = performance.getEntriesByType('paint');
        
        const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        const lcp = performance.getEntriesByType('largest-contentful-paint')[0];
        
        const performanceMetrics: PerformanceMetrics = {
          loadTime: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
          domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : 0,
          firstContentfulPaint: fcp ? fcp.startTime : 0,
          largestContentfulPaint: lcp ? lcp.startTime : 0,
          firstInputDelay: 0, // Would need FID observer
          cumulativeLayoutShift: 0, // Would need CLS observer
        };

        setMetrics(performanceMetrics);
        setIsVisible(true);
      } catch (error) {
        console.warn('Performance measurement failed:', error);
      }
    };

    // Measure after page load
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
    }

    return () => {
      window.removeEventListener('load', measurePerformance);
    };
  }, []); // Remove metrics from dependency array to prevent infinite loop

  if (!isVisible || !metrics) return null;

  const getScoreColor = (value: number, thresholds: { good: number; poor: number }) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.poor) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreText = (value: number, thresholds: { good: number; poor: number }) => {
    if (value <= thresholds.good) return 'Good';
    if (value <= thresholds.poor) return 'Needs Improvement';
    return 'Poor';
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-900">Performance Metrics</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-600">Load Time:</span>
          <span className={getScoreColor(metrics.loadTime, { good: 1000, poor: 3000 })}>
            {metrics.loadTime.toFixed(0)}ms
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">DOM Ready:</span>
          <span className={getScoreColor(metrics.domContentLoaded, { good: 1000, poor: 3000 })}>
            {metrics.domContentLoaded.toFixed(0)}ms
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">First Paint:</span>
          <span className={getScoreColor(metrics.firstContentfulPaint, { good: 1800, poor: 3000 })}>
            {metrics.firstContentfulPaint.toFixed(0)}ms
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Largest Paint:</span>
          <span className={getScoreColor(metrics.largestContentfulPaint, { good: 2500, poor: 4000 })}>
            {metrics.largestContentfulPaint.toFixed(0)}ms
          </span>
        </div>
      </div>
      
      <div className="mt-3 pt-2 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          Press F12 → Console for detailed metrics
        </div>
      </div>
    </div>
  );
}
