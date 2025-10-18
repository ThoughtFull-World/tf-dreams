# ✅ UI-Triggered Video Generation

## Problem:
The async video generation in the `process-dream` Edge Function was unreliable. Edge Functions have a 150-second timeout, and "fire-and-forget" async operations may be terminated when the function returns.

## Solution:
**The UI now explicitly triggers video generation** as a separate API call after story generation completes.

---

## How It Works Now:

### **Old Flow (Unreliable):**
```
UI → process-dream → 
      1. Transcribe
      2. Generate Story
      3. Fire-and-forget video generation (❌ unreliable)
      4. Return immediately
```

### **New Flow (Reliable):**
```
UI → process-dream (generateVideo: false) →
      1. Transcribe
      2. Generate Story
      3. Return immediately ✅

UI → generate-video (explicit call) →
      1. Generate video
      2. Upload to R2
      3. Update database
      4. Return success ✅

UI → poll for video →
      Check every 5s until ready ✅
```

---

## Code Changes:

### **1. New API Function** (`src/lib/api.ts`):

```typescript
/**
 * Trigger video generation for a story node
 */
export async function generateVideo(storyNodeId: string): Promise<{
  success: boolean;
  videoUrl?: string;
  error?: string;
}> {
  const token = await getAccessToken();
  
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

  const data = await response.json();
  console.log("✅ Video generation triggered:", data);
  
  return data;
}
```

### **2. Updated UI Flow** (`src/app/page.tsx`):

```typescript
const startGeneration = async (blob: Blob) => {
  try {
    // Step 1: Process dream (NO video generation)
    const result = await processDream(blob, false); // ← false = no async video
    
    setDreamId(result.dreamId);
    setStoryNodeId(result.storyNodeId);
    setTranscript(result.transcript);
    setStory(result.story);
    
    // Step 2: Explicitly trigger video generation from UI
    console.log("🎥 Triggering video generation from UI...");
    await generateVideo(result.storyNodeId); // ← Explicit UI call
    
    // Step 3: Poll for video completion
    const video = await pollForVideo(result.storyNodeId, (secondsElapsed) => {
      console.log(`⏳ Waiting for video... ${secondsElapsed}s elapsed`);
    });
    
    if (video) {
      setVideoUrl(video);
      console.log("✅ Video ready:", video);
    }
    
    setStep("complete");
  } catch (error) {
    console.error("❌ Dream generation failed:", error);
    setShowRetry(true);
  }
};
```

---

## Benefits:

✅ **Reliable** - UI controls the entire flow
✅ **Traceable** - Each step is a separate HTTP request
✅ **Debuggable** - Clear logs for each stage
✅ **Timeout-proof** - No dependency on Edge Function async behavior
✅ **Explicit control** - UI decides when to start video generation

---

## API Flow:

```
┌─────────────────────┐
│  User Records Audio │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ processDream(blob,  │
│ generateVideo=false)│
│                     │
│ → Transcribe (STT)  │
│ → Generate Story    │
│ → Save to DB        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ generateVideo(      │
│   storyNodeId)      │
│                     │
│ → Fal.ai generation │
│ → Upload to R2      │
│ → Update DB         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ pollForVideo(       │
│   storyNodeId)      │
│                     │
│ → Check every 5s    │
│ → Max 2 minutes     │
│ → Return video URL  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Display Video     │
└─────────────────────┘
```

---

## Console Logs:

When you test the app, you'll see:

```
🎤 Starting transcription...
📤 Sending audio to process-dream function...
✅ Dream processed successfully: { dreamId, storyNode, transcript }
📝 Transcription complete: "I dreamed about..."
✨ Story generation complete
🎥 Triggering video generation from UI...
🎥 Triggering video generation for story node: abc-123
✅ Video generation triggered: { success: true }
✅ Video generation request sent
⏳ Waiting for video... 5s elapsed
⏳ Waiting for video... 10s elapsed
⏳ Waiting for video... 15s elapsed
✅ Video ready: https://dreams.thoughtfull.world/videos/...
```

---

## Edge Functions Used:

1. **`process-dream`** - Transcription + Story Generation
   - Input: `{ audioBase64, audioMimeType, generateVideo: false }`
   - Output: `{ dreamId, storyNode, transcript }`

2. **`generate-video`** - Video Generation (UI-triggered)
   - Input: `{ storyNodeId }`
   - Output: `{ success, videoUrl }`

3. **`check-video-status`** - Status Polling
   - Input: `{ nodeId }`
   - Output: `{ status, videoUrl }`

---

## Files Modified:

1. ✅ `src/lib/api.ts` - Added `generateVideo()` function
2. ✅ `src/app/page.tsx` - Updated to explicitly call `generateVideo()`

---

## Testing:

### **1. Start Dev Server:**
```bash
npm run dev
```

### **2. Open Browser:**
```
http://localhost:3000
```

### **3. Test Flow:**
1. Click microphone and record audio
2. Watch console logs:
   - ✅ Transcription completes quickly
   - ✅ Story generates quickly
   - 🎥 Video generation explicitly triggered
   - ⏳ Polling starts
   - ✅ Video appears when ready

---

## Troubleshooting:

### **"Failed to generate video" error:**
- Check browser console for detailed error
- Verify `generate-video` Edge Function is deployed
- Check Fal.ai has credits
- Verify R2 credentials are set

### **Video takes too long:**
- Fal.ai typically takes 30-60 seconds
- Max timeout is 2 minutes (24 checks × 5s)
- Check Edge Function logs in Supabase Dashboard

### **Video never appears:**
- Check `generate-video` function logs
- Verify the function completed successfully
- Check database for `video_url` in `story_nodes` table

---

**Status**: ✅ **UI-Triggered Video Generation Active!**

Video generation is now explicitly controlled by the UI, making it much more reliable and debuggable.

