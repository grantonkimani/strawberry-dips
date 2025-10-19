import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const healthChecks = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    checks: {} as Record<string, any>,
  };

  try {
    // Database connectivity check
    const { data, error } = await supabase
      .from('products')
      .select('id')
      .limit(1);
    
    healthChecks.checks.database = {
      status: error ? 'unhealthy' : 'healthy',
      error: error?.message,
      responseTime: Date.now(),
    };

    if (error) {
      healthChecks.status = 'unhealthy';
    }

    // Environment variables check
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    ];

    healthChecks.checks.environment = {
      status: 'healthy',
      missing: requiredEnvVars.filter(env => !process.env[env]),
    };

    if (healthChecks.checks.environment.missing.length > 0) {
      healthChecks.status = 'unhealthy';
    }

    // API response time
    healthChecks.checks.api = {
      status: 'healthy',
      responseTime: Date.now(),
    };

    return NextResponse.json(healthChecks, {
      status: healthChecks.status === 'healthy' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (error) {
    healthChecks.status = 'unhealthy';
    healthChecks.checks.error = {
      message: error instanceof Error ? error.message : 'Unknown error',
    };

    return NextResponse.json(healthChecks, { status: 503 });
  }
}
