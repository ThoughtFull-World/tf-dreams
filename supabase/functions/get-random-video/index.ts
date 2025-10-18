import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

/**
 * Get Random Video Function
 * 
 * Returns a random video URL from generated dreams
 * Used for dynamic background videos on the homepage
 */

interface RandomVideoResponse {
  video_url: string;
  story_content?: string;
  created_at?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, content-type, x-client-info, apikey",
      },
    });
  }

  try {
    // Get Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all story nodes that have video URLs
    // We fetch multiple and pick one randomly for better performance
    const { data, error } = await supabase
      .from("story_nodes")
      .select("video_url, content, created_at")
      .not("video_url", "is", null)
      .order("created_at", { ascending: false })
      .limit(20); // Get last 20 videos

    if (error) {
      console.error("Database error:", error);
      throw new Error(`Failed to fetch videos: ${error.message}`);
    }

    if (!data || data.length === 0) {
      // No videos available, return a default/fallback
      return new Response(
        JSON.stringify({
          video_url: null,
          message: "No videos available yet",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Pick a random video from the results
    const randomIndex = Math.floor(Math.random() * data.length);
    const randomVideo = data[randomIndex];

    const response: RandomVideoResponse = {
      video_url: randomVideo.video_url,
      story_content: randomVideo.content?.substring(0, 100), // First 100 chars
      created_at: randomVideo.created_at,
    };

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );

  } catch (error: any) {
    console.error("Error getting random video:", error);
    
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to get random video",
        video_url: null,
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

