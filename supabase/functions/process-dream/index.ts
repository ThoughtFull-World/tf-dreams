import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { uploadToR2, type R2Config } from "./r2-client.ts";

/**
 * Main Edge Function: Process Dream Input
 * 
 * Handles dream journal entries with audio or text input:
 * 1. Authenticates user
 * 2. Converts audio to text (if audio provided)
 * 3. Retrieves relevant memories from Mem0
 * 4. Generates story content with OpenAI GPT-4
 * 5. Stores new memory in Mem0
 * 6. Saves to database
 * 7. Triggers async video generation (if enabled)
 * 8. Returns structured story node + options immediately
 * 
 * Note: Video generation happens asynchronously in the background.
 * The video URL will be added to the story node once ready.
 */

// ============================================================================
// TYPES
// ============================================================================

interface DreamInput {
  audioBase64?: string;          // Base64 encoded audio file
  audioMimeType?: string;        // e.g., "audio/webm"
  textInput?: string;            // Direct text input (alternative to audio)
  dreamId?: string;              // Existing dream session ID
  parentNodeId?: string;         // Parent story node (for branching)
  generateVideo?: boolean;       // Whether to generate video (default: true)
}

interface StoryNode {
  id: string;
  content: string;
  videoUrl?: string;
  createdAt: string;
}

interface StoryOption {
  id: string;
  optionText: string;
}

interface DreamResponse {
  dreamId: string;
  storyNode: StoryNode;
  options: StoryOption[];
  transcript: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert audio to text using ElevenLabs Speech-to-Text API
 */
async function transcribeAudio(
  audioBase64: string,
  mimeType: string
): Promise<string> {
  const elevenLabsApiKey = Deno.env.get("ELEVENLABS_API_KEY");
  if (!elevenLabsApiKey) {
    throw new Error("ELEVENLABS_API_KEY not configured");
  }

  console.log("Starting audio transcription with ElevenLabs...");

  // Convert base64 to blob
  const audioBuffer = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));
  const audioBlob = new Blob([audioBuffer], { type: mimeType });

  // Determine file extension based on mime type
  let fileExtension = "mp3";
  if (mimeType.includes("webm")) fileExtension = "webm";
  else if (mimeType.includes("wav")) fileExtension = "wav";
  else if (mimeType.includes("ogg")) fileExtension = "ogg";
  else if (mimeType.includes("m4a")) fileExtension = "m4a";
  else if (mimeType.includes("mpeg")) fileExtension = "mp3";
  else if (mimeType.includes("mp4")) fileExtension = "mp4";

  // Create form data for ElevenLabs Speech-to-Text API
  const formData = new FormData();
  formData.append("file", audioBlob, `audio.${fileExtension}`);
  formData.append("model_id", "scribe_v1"); // ElevenLabs STT model

  const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
    method: "POST",
    headers: {
      "xi-api-key": elevenLabsApiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("ElevenLabs STT error:", error);
    throw new Error(`ElevenLabs transcription failed: ${error}`);
  }

  const result = await response.json();
  console.log("Transcription complete:", result.text);
  return result.text;
}

/**
 * Add memory to Mem0
 */
async function addMemory(userId: string, dreamContent: string): Promise<void> {
  const mem0ApiKey = Deno.env.get("MEM0_API_KEY");
  if (!mem0ApiKey) {
    console.warn("MEM0_API_KEY not configured, skipping memory storage");
    return;
  }

  try {
    await fetch("https://api.mem0.ai/v1/memories/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${mem0ApiKey}`,
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: dreamContent }],
        user_id: userId,
      }),
    });
    console.log("Memory added to Mem0");
  } catch (error) {
    console.error("Failed to add memory to Mem0:", error);
  }
}

/**
 * Retrieve relevant memories from Mem0
 */
async function getRelevantMemories(userId: string, query: string): Promise<string> {
  const mem0ApiKey = Deno.env.get("MEM0_API_KEY");
  if (!mem0ApiKey) {
    console.warn("MEM0_API_KEY not configured, no memories retrieved");
    return "";
  }

  try {
    // Use POST for search with query in body (updated Mem0 API)
    const response = await fetch(
      "https://api.mem0.ai/v1/memories/search/",
      {
        method: "POST",
        headers: {
          "Authorization": `Token ${mem0ApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query,
          user_id: userId,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Mem0 search failed:", errorText);
      return "";
    }

    const data = await response.json();
    if (data.results && data.results.length > 0) {
      const memories = data.results.map((r: any) => r.memory).join("\n");
      console.log(`Retrieved ${data.results.length} memories from Mem0`);
      return memories;
    }
  } catch (error) {
    console.error("Failed to retrieve memories from Mem0:", error);
  }

  return "";
}

/**
 * Generate story content using OpenAI GPT with Mem0 memory
 */
async function generateStoryNode(
  transcript: string,
  userId: string,
  parentNodeId?: string,
  supabase?: any,
  dreamId?: string
): Promise<{ content: string; options: string[] }> {
  const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openaiApiKey) {
    throw new Error("OPENAI_API_KEY not configured");
  }

  console.log("Generating story with OpenAI + Mem0...");

  // Get relevant memories from Mem0
  const memories = await getRelevantMemories(userId, transcript);

  // Build context from previous nodes if continuing a dream
  let context = "";
  if (parentNodeId && supabase && dreamId) {
    const { data: previousNodes } = await supabase
      .from("story_nodes")
      .select("content")
      .eq("dream_id", dreamId)
      .order("created_at", { ascending: true });

    if (previousNodes && previousNodes.length > 0) {
      context = previousNodes.map((n: any) => n.content).join("\n\n");
    }
  }

  // Create prompt for OpenAI
  const systemPrompt = `You are a creative dream journal assistant. Based on the user's dream description, generate a vivid, immersive narrative continuation of their dream. Make it surreal, emotionally resonant, and engaging.

Then, provide 3 choices for how the dream could continue. Each choice should be a single sentence describing an action or direction.

You must respond ONLY with valid JSON in this exact format:
{
  "content": "The narrative paragraph...",
  "options": ["Option 1 text", "Option 2 text", "Option 3 text"]
}`;

  let userPrompt = `User's dream: ${transcript}\n\nCreate a vivid dream narrative and provide 3 choices for how it could continue.`;
  
  if (memories) {
    userPrompt = `Relevant memories from past dreams:\n${memories}\n\n` + userPrompt;
  }
  
  if (context) {
    userPrompt = `Previous dream context:\n${context}\n\n` + userPrompt;
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 1024,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("OpenAI API error:", error);
    throw new Error(`OpenAI generation failed: ${error}`);
  }

  const result = await response.json();
  const contentText = result.choices[0].message.content;
  
  // Parse JSON response from OpenAI
  const parsed = JSON.parse(contentText);
  console.log("Story generation complete");

  // Store this dream in Mem0 for future context
  await addMemory(userId, `Dream: ${transcript}\nStory: ${parsed.content}`);
  
  return {
    content: parsed.content,
    options: parsed.options,
  };
}

/**
 * Generate video using Fal.ai based on story content
 */
async function generateVideo(storyContent: string): Promise<Uint8Array> {
  const falApiKey = Deno.env.get("FAL_API_KEY");
  if (!falApiKey) {
    throw new Error("FAL_API_KEY not configured");
  }

  console.log("Generating video with Fal.ai Lightning (optimized for speed)...");

  // Extract key visual elements from story for prompt
  const promptForVideo = `Dreamy, surreal scene: ${storyContent.substring(0, 200)}. Cinematic, ethereal lighting, fantasy art style.`;

  // Use Fal.ai's Lightning model for 6x faster generation (10-20s instead of 60-120s)
  const response = await fetch("https://fal.run/fal-ai/fast-animatediff/text-to-video", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Key ${falApiKey}`,
    },
    body: JSON.stringify({
      prompt: promptForVideo,
      negative_prompt: "ugly, blurry, low quality, distorted, deformed, artifacts",
      num_frames: 32,              // 4 seconds at 8 fps (max supported by model)
      num_inference_steps: 6,      // Optimized for speed
      guidance_scale: 6.0,         // Balanced quality vs speed
      fps: 8,                      // 8 frames per second
      motion_scale: 1.3,           // Dynamic movement
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Fal.ai error:", error);
    throw new Error(`Fal.ai video generation failed: ${error}`);
  }

  const result = await response.json();
  
  // Download the generated video
  const videoUrl = result.video?.url || result.images?.[0]?.url;
  if (!videoUrl) {
    throw new Error("No video URL returned from Fal.ai");
  }

  const videoResponse = await fetch(videoUrl);
  const videoBuffer = await videoResponse.arrayBuffer();
  
  console.log("Video generation complete");
  return new Uint8Array(videoBuffer);
}

/**
 * Upload audio to Supabase Storage
 */
async function uploadAudio(
  supabase: any,
  audioBase64: string,
  mimeType: string,
  userId: string,
  dreamId: string
): Promise<string> {
  console.log("Uploading audio to Supabase Storage...");

  const audioBuffer = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));
  const fileName = `${userId}/${dreamId}/${Date.now()}.webm`;

  const { data, error } = await supabase.storage
    .from("audio")
    .upload(fileName, audioBuffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    console.error("Supabase Storage error:", error);
    throw new Error(`Audio upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("audio")
    .getPublicUrl(fileName);

  console.log("Audio uploaded successfully");
  return urlData.publicUrl;
}

/**
 * Upload video to Cloudflare R2
 */
async function uploadVideoToR2(
  videoBuffer: Uint8Array,
  userId: string,
  dreamId: string,
  nodeId: string
): Promise<string> {
  const r2Config: R2Config = {
    accountId: Deno.env.get("R2_ACCOUNT_ID")!,
    accessKeyId: Deno.env.get("R2_ACCESS_KEY_ID")!,
    secretAccessKey: Deno.env.get("R2_SECRET_ACCESS_KEY")!,
    bucketName: Deno.env.get("R2_BUCKET_NAME")!,
    publicUrl: Deno.env.get("R2_PUBLIC_URL"),
  };

  if (!r2Config.accountId || !r2Config.accessKeyId || !r2Config.secretAccessKey || !r2Config.bucketName) {
    throw new Error("R2 credentials not configured");
  }

  console.log("Uploading video to Cloudflare R2...");

  const filePath = `videos/${userId}/${dreamId}/${nodeId}.mp4`;
  
  const publicUrl = await uploadToR2(
    videoBuffer,
    filePath,
    "video/mp4",
    r2Config
  );

  console.log("Video uploaded successfully to R2");
  return publicUrl;
}

/**
 * Generate video asynchronously and update database when ready
 */
async function generateVideoAsync(
  storyContent: string,
  userId: string,
  dreamId: string,
  nodeId: string,
  supabaseUrl: string,
  supabaseServiceKey: string
): Promise<void> {
  try {
    console.log(`[Async] Starting video generation for node ${nodeId}`);
    
    // Generate video
    const videoBuffer = await generateVideo(storyContent);
    console.log("[Async] Video generated successfully");
    
    // Upload to R2
    const videoUrl = await uploadVideoToR2(videoBuffer, userId, dreamId, nodeId);
    console.log(`[Async] Video uploaded: ${videoUrl}`);
    
    // Update database with video URL
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { error } = await supabase
      .from("story_nodes")
      .update({ video_url: videoUrl })
      .eq("id", nodeId);
    
    if (error) {
      console.error("[Async] Failed to update video URL:", error);
      throw error;
    }
    
    console.log(`[Async] Video URL updated in database for node ${nodeId}`);
  } catch (error) {
    console.error("[Async] Video generation pipeline failed:", error);
    throw error;
  }
}

/**
 * Save dream and story data to Supabase database
 */
async function saveDreamData(
  supabase: any,
  userId: string,
  transcript: string,
  storyContent: string,
  storyOptions: string[],
  videoUrl: string | null,
  dreamId?: string,
  parentNodeId?: string
): Promise<DreamResponse> {
  console.log("Saving dream data to database...");

  // Create or update dream entry
  let finalDreamId = dreamId;
  if (!finalDreamId) {
    const { data: dreamData, error: dreamError } = await supabase
      .from("dreams")
      .insert({
        user_id: userId,
        transcript: transcript,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (dreamError) {
      throw new Error(`Failed to create dream: ${dreamError.message}`);
    }

    finalDreamId = dreamData.id;
  } else {
    // Update existing dream with new transcript
    await supabase
      .from("dreams")
      .update({ transcript: transcript })
      .eq("id", finalDreamId);
  }

  // Create story node
  const { data: nodeData, error: nodeError } = await supabase
    .from("story_nodes")
    .insert({
      dream_id: finalDreamId,
      parent_node_id: parentNodeId || null,
      content: storyContent,
      video_url: videoUrl,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (nodeError) {
    throw new Error(`Failed to create story node: ${nodeError.message}`);
  }

  // Create story options
  const optionsToInsert = storyOptions.map((optionText) => ({
    story_node_id: nodeData.id,
    option_text: optionText,
    next_node_id: null, // Will be populated when user makes a choice
  }));

  const { data: optionsData, error: optionsError } = await supabase
    .from("story_options")
    .insert(optionsToInsert)
    .select();

  if (optionsError) {
    throw new Error(`Failed to create story options: ${optionsError.message}`);
  }

  console.log("Dream data saved successfully");

  return {
    dreamId: finalDreamId,
    storyNode: {
      id: nodeData.id,
      content: nodeData.content,
      videoUrl: nodeData.video_url,
      createdAt: nodeData.created_at,
    },
    options: optionsData.map((opt: any) => ({
      id: opt.id,
      optionText: opt.option_text,
    })),
    transcript: transcript,
  };
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

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
    console.log("Function invoked");
    
    // 1. AUTHENTICATE USER
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const authHeader = req.headers.get("Authorization");

    console.log("Environment check:", {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      hasAuthHeader: !!authHeader
    });

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Verifying user authentication...");
    
    // Extract JWT token from Authorization header
    const jwt = authHeader.replace("Bearer ", "");
    
    // Verify user authentication by passing JWT explicitly
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    
    if (authError) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized", details: authError.message }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    
    if (!user) {
      console.error("No user found");
      return new Response(
        JSON.stringify({ error: "Unauthorized", details: "No user found" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing dream for user: ${user.id}`);

    // 2. PARSE REQUEST BODY
    const body: DreamInput = await req.json();
    const {
      audioBase64,
      audioMimeType,
      textInput,
      dreamId,
      parentNodeId,
      generateVideo: shouldGenerateVideo = true,
    } = body;

    // 3. CONVERT AUDIO TO TEXT (if audio provided)
    let transcript: string;
    if (audioBase64) {
      if (!audioMimeType) {
        throw new Error("audioMimeType required when sending audio");
      }
      transcript = await transcribeAudio(audioBase64, audioMimeType);
      
      // Upload audio to Supabase Storage
      await uploadAudio(
        supabase,
        audioBase64,
        audioMimeType,
        user.id,
        dreamId || "temp"
      );
    } else if (textInput) {
      transcript = textInput;
    } else {
      throw new Error("Either audioBase64 or textInput must be provided");
    }

    // 4. GENERATE STORY CONTENT WITH OPENAI + MEM0
    const { content, options } = await generateStoryNode(
      transcript,
      user.id,
      parentNodeId,
      supabase,
      dreamId
    );

    // 5. SAVE TO DATABASE (without video first)
    const response = await saveDreamData(
      supabase,
      user.id,
      transcript,
      content,
      options,
      null, // No video yet
      dreamId,
      parentNodeId
    );

    // 6. TRIGGER ASYNC VIDEO GENERATION (if enabled)
    if (shouldGenerateVideo) {
      console.log("Triggering async video generation...");
      
      // Fire and forget - generate video in background
      generateVideoAsync(
        content,
        user.id,
        response.dreamId,
        response.storyNode.id,
        supabaseUrl,
        supabaseServiceKey
      ).catch((error) => {
        console.error("Async video generation failed:", error);
      });
      
      console.log("Video generation started in background");
    }

    // 7. RETURN RESPONSE IMMEDIATELY
    return new Response(JSON.stringify({
      ...response,
      videoStatus: shouldGenerateVideo ? "generating" : "disabled"
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });

  } catch (error: any) {
    console.error("Error processing dream:", error);
    
    return new Response(
      JSON.stringify({
        error: error.message || "Internal server error",
        details: error.toString(),
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

