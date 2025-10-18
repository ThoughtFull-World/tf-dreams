import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

/**
 * Magic Link Authentication Function
 * 
 * Sends a magic link to user's email for passwordless login
 */

interface MagicLinkRequest {
  email: string;
}

interface MagicLinkResponse {
  success: boolean;
  message?: string;
  error?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, content-type, x-client-info, apikey",
      },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    // Create Supabase client (using service role key for auth functions)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const body: MagicLinkRequest = await req.json();
    const { email } = body;

    // Validate input
    if (!email) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Email is required",
        } as MagicLinkResponse),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Please enter a valid email address",
        } as MagicLinkResponse),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    console.log(`Sending magic link to: ${email}`);

    // Determine redirect URL based on environment
    const redirectTo = "http://localhost:3000";

    // Send magic link
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      console.error("Magic link error:", error);
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message || "Failed to send magic link",
        } as MagicLinkResponse),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    console.log(`Magic link sent successfully to: ${email}`);

    // Return success
    return new Response(
      JSON.stringify({
        success: true,
        message: "Check your email for the magic link to sign in",
      } as MagicLinkResponse),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );

  } catch (error: any) {
    console.error("Magic link function error:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to send magic link",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});
