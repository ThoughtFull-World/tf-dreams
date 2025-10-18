import { NextResponse } from "next/server";

/**
 * Diagnostic endpoint to check if environment variables are set
 * Access at: https://dreams.thoughtfull.world/api/check-env
 */
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return NextResponse.json({
    environment: process.env.NODE_ENV || "unknown",
    envVarsSet: {
      NEXT_PUBLIC_SUPABASE_URL: {
        isSet: !!supabaseUrl,
        value: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : "NOT SET",
        length: supabaseUrl?.length || 0,
      },
      NEXT_PUBLIC_SUPABASE_ANON_KEY: {
        isSet: !!supabaseKey,
        value: supabaseKey ? `${supabaseKey.substring(0, 20)}...` : "NOT SET",
        length: supabaseKey?.length || 0,
      },
    },
    status: (supabaseUrl && supabaseKey) ? "✅ All env vars set" : "❌ Missing env vars",
  });
}

