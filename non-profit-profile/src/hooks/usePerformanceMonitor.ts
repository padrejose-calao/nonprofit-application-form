import { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: number;
  componentRenders: number;
  lastRenderTime: number;
  averageRenderTime: number;
}

export const usePerformanceMonitor = (componentName: string) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    componentRenders: 0,
    lastRenderTime: 0,
    averageRenderTime: 0
  });

  const startTimeRef = useRef<number>(0);
  const renderTimesRef = useRef<number[]>([]);
  const renderCountRef = useRef<number>(0);

  // Start performance measurement before render
  useEffect(() => {
    startTimeRef.current = performance.now();
  });

  // Measure after render
  useEffect(() => {
    const renderTime = performance.now() - startTimeRef.current;
    renderCountRef.current += 1;
    renderTimesRef.current.push(renderTime);

    // Keep only last 50 render times for average calculation
    if (renderTimesRef.current.length > 50) {
      renderTimesRef.current = renderTimesRef.current.slice(-50);
    }

    const averageRenderTime = renderTimesRef.current.reduce((a, b) => a + b, 0) / renderTimesRef.current.length;

    setMetrics({
      renderTime,
      memoryUsage: (performance as any).memory?.usedJSHeapSize,
      componentRenders: renderCountRef.current,
      lastRenderTime: renderTime,
      averageRenderTime
    });

    // Log performance warnings in development
    if (process.env.NODE_ENV === 'development') {
      if (renderTime > 100) {
        console.warn(`⚠️ Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
      
      if (renderCountRef.current > 100 && averageRenderTime > 50) {
        console.warn(`⚠️ Component ${componentName} has high average render time: ${averageRenderTime.toFixed(2)}ms`);
      }
    }
  });

  const logMetrics = () => {
    console.log(`📊 Performance Metrics for ${componentName}:`, {
      ...metrics,
      renderTime: `${metrics.renderTime.toFixed(2)}ms`,
      averageRenderTime: `${metrics.averageRenderTime.toFixed(2)}ms`,
      memoryUsage: metrics.memoryUsage ? `${(metrics.memoryUsage / 1024 / 1024).toFixed(2)} MB` : 'N/A'
    });
  };

  return { metrics, logMetrics };
};

// Hook for monitoring form field performance
export const useFieldPerformance = (fieldName: string, value: any) => {
  const [updateCount, setUpdateCount] = useState(0);
  const lastValueRef = useRef(value);
  const updateTimesRef = useRef<number[]>([]);

  useEffect(() => {
    if (value !== lastValueRef.current) {
      const now = performance.now();
      updateTimesRef.current.push(now);
      setUpdateCount(prev => prev + 1);
      lastValueRef.current = value;

      // Check for rapid updates (potential performance issue)
      const recentUpdates = updateTimesRef.current.filter(time => now - time < 1000);
      if (recentUpdates.length > 10 && process.env.NODE_ENV === 'development') {
        console.warn(`⚠️ Field ${fieldName} updated ${recentUpdates.length} times in last second`);
      }
    }
  }, [value, fieldName]);

  return { updateCount, isActive: updateCount > 0 };
};

// Hook for monitoring bundle size and load performance
export const useLoadPerformance = () => {
  const [loadMetrics, setLoadMetrics] = useState({
    domContentLoaded: 0,
    windowLoaded: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0
  });

  useEffect(() => {
    // Get performance timing
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paintEntries = performance.getEntriesByType('paint');

    const metrics = {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      windowLoaded: navigation.loadEventEnd - navigation.loadEventStart,
      firstContentfulPaint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
      largestContentfulPaint: 0
    };

    // Get LCP if available
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        setLoadMetrics(prev => ({
          ...prev,
          largestContentfulPaint: lastEntry.startTime
        }));
      });
      
      try {
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // LCP not supported
      }
      
      return () => observer.disconnect();
    }

    setLoadMetrics(metrics);
  }, []);

  return loadMetrics;
};

export default usePerformanceMonitor;