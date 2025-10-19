import { NextRequest, NextResponse } from 'next/server';

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

export async function POST(request: NextRequest) {
  try {
    const errorLog: ErrorLog = await request.json();

    // Log to console for immediate visibility
    console.error(`[MONITORING] ${errorLog.level.toUpperCase()}: ${errorLog.message}`, {
      timestamp: errorLog.timestamp,
      url: errorLog.url,
      context: errorLog.context,
      stack: errorLog.stack,
    });

    // In production, you would send this to a monitoring service like:
    // - Sentry
    // - LogRocket
    // - DataDog
    // - Custom logging service

    // For now, we'll just log it
    // TODO: Integrate with proper monitoring service

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Failed to process error log:', error);
    return NextResponse.json(
      { error: 'Failed to process error log' },
      { status: 500 }
    );
  }
}
