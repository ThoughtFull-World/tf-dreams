"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the hash fragment which contains the OAuth tokens
        const hash = typeof window !== 'undefined' ? window.location.hash : '';
        
        if (hash) {
          // Parse the fragment to get tokens
          const params = new URLSearchParams(hash.substring(1));
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          const expiresAt = params.get('expires_at');

          if (accessToken) {
            // Set the session in Supabase
            const supabase = createBrowserClient(
              process.env.NEXT_PUBLIC_SUPABASE_URL || "",
              process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
            );

            // Create a session from the tokens
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || "",
            });

            if (!error) {
              // Session set successfully, redirect to home
              router.push("/");
              return;
            }
          }
        }

        // If we get here, something went wrong
        router.push("/?auth_error=callback_failed");
      } catch (error) {
        console.error("Auth callback error:", error);
        router.push("/?auth_error=callback_failed");
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
        <p className="text-white">Signing you in...</p>
      </div>
    </div>
  );
}
