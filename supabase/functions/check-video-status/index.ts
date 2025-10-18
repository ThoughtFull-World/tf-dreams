import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

/**
 * Check Video Status Function
 * 
 * Checks if a video has been generated for a story node.
 * Used for polling video generation status.
 */

interface StatusResponse {
  nodeId: string;
  videoUrl: string | null;
  status: "ready" | "pending" | "not_found";
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
    // 1. AUTHENTICATE USER
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const authHeader = req.headers.get("Authorization");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract JWT token
    const jwt = authHeader.replace("Bearer ", "");
    
    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // 2. GET STORY NODE ID from query param or body
    let storyNodeId: string;

    if (req.method === "GET") {
      const url = new URL(req.url);
      storyNodeId = url.searchParams.get("nodeId") || "";
    } else {
      const body = await req.json();
      storyNodeId = body.storyNodeId || body.nodeId || "";
    }

    if (!storyNodeId) {
      throw new Error("nodeId is required");
    }

    // 3. CHECK DATABASE FOR VIDEO STATUS
    const { data: storyNode, error: nodeError } = await supabase
      .from("story_nodes")
      .select("id, video_url")
      .eq("id", storyNodeId)
      .single();

    if (nodeError || !storyNode) {
      return new Response(
        JSON.stringify({
          nodeId: storyNodeId,
          videoUrl: null,
          status: "not_found",
        } as StatusResponse),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // 4. RETURN STATUS
    const status: StatusResponse = {
      nodeId: storyNodeId,
      videoUrl: storyNode.video_url,
      status: storyNode.video_url ? "ready" : "pending",
    };

    return new Response(
      JSON.stringify(status),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );

  } catch (error: any) {
    console.error("Error checking video status:", error);
    
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to check video status",
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

