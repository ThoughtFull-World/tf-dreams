import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // For cloud Supabase, the tokens are in the URL fragment (#access_token=...)
  // The Supabase browser client automatically handles extracting and setting the session
  // from the fragment, so we just need to redirect to the app
  
  const { searchParams } = new URL(request.url);
  const next = searchParams.get('next') || '/library';

  // Redirect to library - the auth context will pick up the session automatically
  return NextResponse.redirect(new URL(next, request.url));
}
