// Error logging and monitoring system
interface ErrorLog {
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  context?: Record<string, any>;
  userId?: string;
  url?: string;
  userAgent?: string;
}

class ErrorLogger {
  private logs: ErrorLog[] = [];
  private maxLogs = 100;

  log(error: ErrorLog) {
    // Add to local logs
    this.logs.unshift({
      ...error,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
    });

    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${error.level.toUpperCase()}] ${error.message}`, error);
    }

    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoring(error);
    }
  }

  private async sendToMonitoring(error: ErrorLog) {
    try {
      await fetch('/api/monitoring/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(error),
      });
    } catch (e) {
      console.error('Failed to send error to monitoring:', e);
    }
  }

  getLogs(): ErrorLog[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }
}

export const errorLogger = new ErrorLogger();

// Global error handler
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    errorLogger.log({
      level: 'error',
      message: event.error?.message || 'Unknown error',
      stack: event.error?.stack,
      context: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    errorLogger.log({
      level: 'error',
      message: `Unhandled Promise Rejection: ${event.reason}`,
      context: { reason: event.reason },
    });
  });
}
