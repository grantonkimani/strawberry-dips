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

  log(error: Partial<ErrorLog>) {
    // Create complete error log with required fields
    const completeError: ErrorLog = {
      timestamp: new Date().toISOString(),
      level: error.level || 'error',
      message: error.message || 'Unknown error',
      stack: error.stack,
      context: error.context,
      userId: error.userId,
      url: error.url || (typeof window !== 'undefined' ? window.location.href : undefined),
      userAgent: error.userAgent || (typeof window !== 'undefined' ? navigator.userAgent : undefined),
    };

    // Add to local logs
    this.logs.unshift(completeError);

    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${completeError.level.toUpperCase()}] ${completeError.message}`, completeError);
    }

    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoring(completeError);
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
