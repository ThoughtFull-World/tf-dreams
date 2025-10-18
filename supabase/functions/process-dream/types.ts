/**
 * Type definitions for Dream Journal Edge Function
 */

// ============================================================================
// DATABASE TYPES
// ============================================================================

export interface Dream {
  id: string;
  user_id: string;
  transcript: string;
  created_at: string;
}

export interface StoryNode {
  id: string;
  dream_id: string;
  parent_node_id: string | null;
  content: string;
  video_url: string | null;
  created_at: string;
}

export interface StoryOption {
  id: string;
  story_node_id: string;
  option_text: string;
  next_node_id: string | null;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface ProcessDreamRequest {
  /** Base64 encoded audio file (alternative to textInput) */
  audioBase64?: string;
  
  /** MIME type of audio file (required if audioBase64 provided) */
  audioMimeType?: string;
  
  /** Direct text input (alternative to audioBase64) */
  textInput?: string;
  
  /** Existing dream session ID (optional, for continuing a dream) */
  dreamId?: string;
  
  /** Parent story node ID (optional, for branching narratives) */
  parentNodeId?: string;
  
  /** Whether to generate video (default: true) */
  generateVideo?: boolean;
}

export interface ProcessDreamResponse {
  /** Dream session ID */
  dreamId: string;
  
  /** Generated story node */
  storyNode: {
    id: string;
    content: string;
    videoUrl?: string;
    createdAt: string;
  };
  
  /** Story continuation options */
  options: Array<{
    id: string;
    optionText: string;
  }>;
  
  /** Transcribed or provided text */
  transcript: string;
}

export interface ErrorResponse {
  error: string;
  details?: string;
}

// ============================================================================
// EXTERNAL API TYPES
// ============================================================================

export interface ElevenLabsSTTResponse {
  text: string;
  duration?: number;
  language?: string;
}

export interface ClaudeMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ClaudeResponse {
  id: string;
  type: "message";
  role: "assistant";
  content: Array<{
    type: "text";
    text: string;
  }>;
  model: string;
  stop_reason: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export interface ClaudeStoryOutput {
  content: string;
  options: string[];
}

export interface FalAIVideoRequest {
  prompt: string;
  negative_prompt?: string;
  num_frames?: number;
  num_inference_steps?: number;
  guidance_scale?: number;
}

export interface FalAIVideoResponse {
  video?: {
    url: string;
    content_type: string;
    width: number;
    height: number;
  };
  images?: Array<{
    url: string;
    content_type: string;
  }>;
}

// ============================================================================
// STORAGE TYPES
// ============================================================================

export interface SupabaseStorageResponse {
  path: string;
  id: string;
  fullPath: string;
}

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type AudioMimeType = 
  | "audio/webm"
  | "audio/webm;codecs=opus"
  | "audio/mp4"
  | "audio/mpeg"
  | "audio/wav"
  | "audio/ogg";

export type VideoMimeType = 
  | "video/mp4"
  | "video/webm";

