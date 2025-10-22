import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { withAdminAuth } from '@/lib/auth-middleware';

async function updateBanner(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const body = await req.json();
  const { id } = await context.params;
  if (!supabaseAdmin) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  const { data, error } = await supabaseAdmin
    .from('banners')
    .update(body)
    .eq('id', id)
    .select('*')
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ banner: data });
}

async function deleteBanner(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    
    if (!supabaseAdmin) {
      console.error('[DELETE /api/banners/[id]] Supabase not configured');
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    console.log(`[DELETE /api/banners/[id]] Attempting to delete banner with id: ${id}`);

    // Retry logic for delete operation
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        // First check if the banner exists
        const { data: existingBanner, error: checkError } = await supabaseAdmin
          .from('banners')
          .select('id')
          .eq('id', id)
          .single();

        if (checkError) {
          console.error('[DELETE /api/banners/[id]] Banner not found:', checkError);
          return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
        }

        console.log(`[DELETE /api/banners/[id]] Banner exists, proceeding with deletion (attempt ${retryCount + 1})`);

        const { error } = await supabaseAdmin
          .from('banners')
          .delete()
          .eq('id', id);

        if (error) {
          console.error(`[DELETE /api/banners/[id]] Supabase delete error (attempt ${retryCount + 1}):`, error);
          
          // If it's a connection error, retry
          if (error.message.includes('fetch failed') || error.message.includes('timeout')) {
            retryCount++;
            if (retryCount < maxRetries) {
              console.log(`[DELETE /api/banners/[id]] Retrying delete in ${retryCount * 1000}ms...`);
              await new Promise(resolve => setTimeout(resolve, retryCount * 1000));
              continue;
            }
          }
          
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        console.log(`[DELETE /api/banners/[id]] Successfully deleted banner with id: ${id}`);
        return NextResponse.json({ success: true });
        
      } catch (retryError) {
        console.error(`[DELETE /api/banners/[id]] Retry error (attempt ${retryCount + 1}):`, retryError);
        retryCount++;
        
        if (retryCount < maxRetries) {
          console.log(`[DELETE /api/banners/[id]] Retrying delete in ${retryCount * 1000}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryCount * 1000));
        } else {
          throw retryError;
        }
      }
    }
    
    return NextResponse.json({ error: 'Failed to delete after retries' }, { status: 500 });
    
  } catch (error) {
    console.error('[DELETE /api/banners/[id]] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Protected admin endpoints
export const PATCH = withAdminAuth(updateBanner);
export const DELETE = withAdminAuth(deleteBanner);


