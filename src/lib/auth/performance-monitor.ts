'use client';

interface AuthPerformanceMetrics {
  startTime: number;
  cacheHit?: number;
  jwtDecode?: number;
  apiCall?: number;
  totalTime?: number;
  source: 'cache' | 'jwt' | 'api' | 'firebase';
}

class AuthPerformanceMonitor {
  private metrics: Map<string, AuthPerformanceMetrics> = new Map();
  private isProduction = process.env.NODE_ENV === 'production';

  startMeasure(sessionId: string, source: AuthPerformanceMetrics['source']): void {
    if (this.isProduction) return; // Skip in production

    this.metrics.set(sessionId, {
      startTime: performance.now(),
      source
    });
  }

  markCacheHit(sessionId: string): void {
    if (this.isProduction) return;

    const metric = this.metrics.get(sessionId);
    if (metric) {
      metric.cacheHit = performance.now();
    }
  }

  markJWTDecode(sessionId: string): void {
    if (this.isProduction) return;

    const metric = this.metrics.get(sessionId);
    if (metric) {
      metric.jwtDecode = performance.now();
    }
  }

  markAPICall(sessionId: string): void {
    if (this.isProduction) return;

    const metric = this.metrics.get(sessionId);
    if (metric) {
      metric.apiCall = performance.now();
    }
  }

  endMeasure(sessionId: string): AuthPerformanceMetrics | null {
    if (this.isProduction) return null;

    const metric = this.metrics.get(sessionId);
    if (!metric) return null;

    metric.totalTime = performance.now() - metric.startTime;

    // Log performance results
    this.logMetrics(sessionId, metric);

    // Clean up
    this.metrics.delete(sessionId);

    return metric;
  }

  private logMetrics(sessionId: string, metric: AuthPerformanceMetrics): void {
    const { source, totalTime, cacheHit, jwtDecode, apiCall } = metric;

    console.group(`🔍 Auth Performance [${source}] - ${totalTime?.toFixed(2)}ms`);

    if (cacheHit) {
      console.log(`⚡ Cache hit: ${(cacheHit - metric.startTime).toFixed(2)}ms`);
    }

    if (jwtDecode) {
      const start = cacheHit || metric.startTime;
      console.log(`🔐 JWT decode: ${(jwtDecode - start).toFixed(2)}ms`);
    }

    if (apiCall) {
      const start = jwtDecode || cacheHit || metric.startTime;
      console.log(`🌐 API call: ${(apiCall - start).toFixed(2)}ms`);
    }

    // Performance assessment
    if (totalTime! < 100) {
      console.log('✅ Excellent performance');
    } else if (totalTime! < 500) {
      console.log('⚠️ Good performance');
    } else if (totalTime! < 1000) {
      console.log('⚠️ Slow performance');
    } else {
      console.log('❌ Very slow performance');
    }

    console.groupEnd();
  }

  // Get performance summary for analytics
  getPerformanceSummary(): any {
    if (this.isProduction) return null;

    return {
      timestamp: new Date().toISOString(),
      activeMetrics: this.metrics.size,
      environment: process.env.NODE_ENV
    };
  }
}

// Singleton instance
export const authPerformanceMonitor = new AuthPerformanceMonitor();

// Utility function to generate session IDs
export function generateSessionId(): string {
  return `auth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Enhanced logging utilities that respect production environment
export const authLogger = {
  debug: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`🔧 ${message}`, ...args);
    }
  },

  info: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`ℹ️ ${message}`, ...args);
    }
  },

  warn: (message: string, ...args: any[]) => {
    console.warn(`⚠️ ${message}`, ...args);
  },

  error: (message: string, ...args: any[]) => {
    console.error(`❌ ${message}`, ...args);
  },

  success: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`✅ ${message}`, ...args);
    }
  },

  performance: (message: string, timeMs: number) => {
    if (process.env.NODE_ENV !== 'production') {
      const emoji = timeMs < 100 ? '⚡' : timeMs < 500 ? '🚀' : timeMs < 1000 ? '⏱️' : '🐌';
      console.log(`${emoji} ${message}: ${timeMs.toFixed(2)}ms`);
    }
  }
};

// Performance timing utilities
export function measureAuthTime<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  const startTime = performance.now();

  return operation().then(result => {
    const endTime = performance.now();
    authLogger.performance(operationName, endTime - startTime);
    return result;
  }).catch(error => {
    const endTime = performance.now();
    authLogger.error(`${operationName} failed after ${(endTime - startTime).toFixed(2)}ms:`, error);
    throw error;
  });
}