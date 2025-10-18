import { Dream, DreamStatus } from "./types";
import { createBrowserClient } from "@supabase/ssr";

// ============================================================================
// SUPABASE CLIENT
// ============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the current user's access token
 */
async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
}

/**
 * Convert Blob to Base64 string
 */
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Process dream audio: transcribe, generate story
 * Note: Video generation is NOT triggered here - UI will trigger it separately
 */
export async function processDream(audioBlob: Blob): Promise<{
  dreamId: string;
  storyNodeId: string;
  transcript: string;
  story: string;
}> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  // Convert audio blob to base64
  const audioBase64 = await blobToBase64(audioBlob);
  const audioMimeType = audioBlob.type || "audio/webm";

  console.log("📤 Sending audio to process-dream function...");

  const response = await fetch(`${supabaseUrl}/functions/v1/process-dream`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      audioBase64,
      audioMimeType,
      generateVideo: false, // UI will trigger video generation separately
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to process dream");
  }

  const data = await response.json();
  
  console.log("✅ Dream processed successfully:", data);

  return {
    dreamId: data.dreamId,
    storyNodeId: data.storyNode.id,
    transcript: data.transcript,
    story: data.storyNode.content,
  };
}

/**
 * Trigger video generation for a story node (UI-triggered)
 */
export async function generateVideo(storyNodeId: string): Promise<{
  success: boolean;
  videoUrl?: string;
  error?: string;
}> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  console.log("🎥 Triggering video generation for story node:", storyNodeId);

  const response = await fetch(`${supabaseUrl}/functions/v1/generate-video`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      storyNodeId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to generate video");
  }

  const data = await response.json();
  console.log("✅ Video generation triggered:", data);
  
  return {
    success: data.success,
    videoUrl: data.videoUrl,
    error: data.error,
  };
}

/**
 * Check video generation status for a story node
 */
export async function checkVideoStatus(storyNodeId: string): Promise<{
  status: "ready" | "pending" | "not_found";
  videoUrl: string | null;
}> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(
    `${supabaseUrl}/functions/v1/check-video-status?nodeId=${storyNodeId}`,
    {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to check video status");
  }

  const data = await response.json();
  return {
    status: data.status,
    videoUrl: data.videoUrl,
  };
}

/**
 * Poll for video completion (checks every 5 seconds, max 2 minutes)
 */
export async function pollForVideo(
  storyNodeId: string,
  onProgress?: (secondsElapsed: number) => void
): Promise<string | null> {
  const maxAttempts = 24; // 24 * 5 seconds = 2 minutes
  let attempts = 0;

  while (attempts < maxAttempts) {
    attempts++;
    const secondsElapsed = attempts * 5;
    
    if (onProgress) {
      onProgress(secondsElapsed);
    }

    try {
      const result = await checkVideoStatus(storyNodeId);
      
      if (result.status === "ready" && result.videoUrl) {
        console.log("✅ Video ready:", result.videoUrl);
        return result.videoUrl;
      }
      
      if (result.status === "not_found") {
        console.error("❌ Story node not found");
        return null;
      }
      
      // Still pending, wait and retry
      console.log(`⏳ Video still generating... (${secondsElapsed}s elapsed)`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
      
    } catch (error) {
      console.error("Error checking video status:", error);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  console.warn("⚠️ Video generation timeout (2 minutes)");
  return null;
}

/**
 * Legacy function - now calls processDream
 * @deprecated Use processDream instead
 */
export async function uploadAudioAndCreateDream(file: Blob): Promise<Dream> {
  const result = await processDream(file);
  
  return {
    id: result.dreamId,
    status: DreamStatus.TRANSCRIBING,
    transcript: result.transcript,
    story: result.story,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Legacy function - now a no-op since processing happens in processDream
 * @deprecated Processing is now done automatically in processDream
 */
export async function startPipeline(dreamId: string): Promise<void> {
  console.log(`Pipeline already started for dream: ${dreamId}`);
}

/**
 * Fetch a dream by share token
 */
export async function getDreamByToken(token: string): Promise<Dream | null> {
  // Query Supabase for public dream data
  const { data, error } = await supabase
    .from("dreams")
    .select(`
      id,
      created_at,
      story_nodes!inner (
        id,
        content,
        video_url
      )
    `)
    .eq("share_token", token)
    .single();

  if (error || !data) {
    console.error("Failed to fetch dream:", error);
    return null;
  }

  const storyNode = (data as any).story_nodes;

  return {
    id: data.id,
    status: storyNode?.video_url ? DreamStatus.READY : DreamStatus.GENERATING_VIDEO,
    shareToken: token,
    videoUrl: storyNode?.video_url,
    story: storyNode?.content,
    createdAt: data.created_at,
  };
}

