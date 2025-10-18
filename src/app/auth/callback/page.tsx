"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the hash fragment which contains the OAuth tokens or errors
        const hash = typeof window !== 'undefined' ? window.location.hash : '';
        const href = typeof window !== 'undefined' ? window.location.href : '';
        
        // Debug logging
        console.log("🔍 Auth Callback Debug:");
        console.log("- Full URL:", href);
        console.log("- Hash:", hash);
        console.log("- Hash length:", hash.length);
        
        if (hash) {
          // Parse the fragment to get tokens or errors
          const params = new URLSearchParams(hash.substring(1));
          
          // Log all parameters
          console.log("📦 All hash parameters:");
          params.forEach((value, key) => {
            console.log(`  - ${key}:`, value.substring(0, 20) + "...");
          });
          
          // Check for errors first
          const error = params.get('error');
          const errorCode = params.get('error_code');
          const errorDescription = params.get('error_description');
          
          if (error) {
            console.error("❌ Auth error detected:");
            console.error("  - error:", error);
            console.error("  - error_code:", errorCode);
            console.error("  - error_description:", errorDescription);
            
            // Handle specific error cases
            if (errorCode === 'otp_expired') {
              console.log("↪️ Redirecting to home with link_expired error");
              router.push("/?auth_error=link_expired");
              return;
            }
            // Generic error
            console.log("↪️ Redirecting to home with auth_failed error");
            router.push("/?auth_error=auth_failed");
            return;
          }
          
          // No error, check for tokens
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          const tokenType = params.get('token_type');
          const expiresIn = params.get('expires_in');

          console.log("🔑 Token check:");
          console.log("  - access_token present:", !!accessToken);
          console.log("  - refresh_token present:", !!refreshToken);
          console.log("  - token_type:", tokenType);
          console.log("  - expires_in:", expiresIn);

          if (accessToken) {
            console.log("✅ Access token found, setting session...");
            
            // Set the session in Supabase
            const supabase = createBrowserClient(
              process.env.NEXT_PUBLIC_SUPABASE_URL || "",
              process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
            );

            // Create a session from the tokens
            const { data, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || "",
            });

            if (sessionError) {
              console.error("❌ Session error:", sessionError);
              router.push("/?auth_error=session_failed");
              return;
            }

            console.log("✅ Session set successfully:", data?.user?.email);
            console.log("↪️ Redirecting to home...");
            router.push("/");
            return;
          } else {
            console.warn("⚠️ No access token in hash");
          }
        } else {
          console.warn("⚠️ No hash fragment found in URL");
        }

        // If we get here, something went wrong
        console.error("❌ Callback failed - no valid tokens or errors found");
        router.push("/?auth_error=callback_failed");
      } catch (error) {
        console.error("💥 Auth callback exception:", error);
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
