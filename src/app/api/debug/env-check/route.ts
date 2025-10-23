import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  try {
    const envCheck: {
      supabaseUrl: boolean;
      supabaseUrlValue: string;
      serviceRoleKey: boolean;
      supabaseAdminClient: boolean;
      timestamp: string;
      databaseConnection?: boolean;
      databaseError?: string | null;
    } = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseUrlValue: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...',
      serviceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseAdminClient: !!supabaseAdmin,
      timestamp: new Date().toISOString()
    };

    // Test database connection if admin client is available
    if (supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin
          .from('categories')
          .select('count')
          .limit(1);
        
        envCheck.databaseConnection = !error;
        envCheck.databaseError = error?.message || null;
      } catch (dbError) {
        envCheck.databaseConnection = false;
        envCheck.databaseError = dbError instanceof Error ? dbError.message : 'Unknown error';
      }
    } else {
      envCheck.databaseConnection = false;
      envCheck.databaseError = 'Supabase admin client not available';
    }

    return NextResponse.json(envCheck);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check environment', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
