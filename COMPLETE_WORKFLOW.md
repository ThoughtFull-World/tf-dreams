# Complete Dream Journal Workflow

## 🎯 Complete Audio-to-Video Pipeline

Your system is fully functional with all 9 steps working perfectly!

---

## 📊 **Complete Workflow Steps:**

### **1. User Uploads Voice Recording**
```javascript
const audioBlob = await recordAudio(); // From user's microphone
const audioBase64 = await blobToBase64(audioBlob);
```

### **2. Audio Saved in Supabase Storage**
- Bucket: `audio`
- Path: `{user_id}/{dream_id}/{timestamp}.{ext}`
- Linked to user in database

### **3. ElevenLabs Transcribes Audio to Text**
- Model: `scribe_v1`
- Converts speech → text transcript

### **4. Mem0 Retrieves Dream Memories**
- Searches past dreams for context
- Provides relevant memories to AI

### **5. OpenAI Generates Story**
- Model: GPT-4
- Creates immersive dream narrative
- Generates 3 continuation options

### **6. Database Saves Dream + Story**
Tables:
- `dreams` - Main dream record
- `story_nodes` - Story content
- `story_options` - Branching choices

### **7. Fal.ai Generates Video**
- Model: fast-animatediff/text-to-video
- Creates 16-frame dream video
- ~60-120 seconds generation time

### **8. Video Stored in Cloudflare R2 + Database**
- Upload to R2 bucket
- URL format: `https://dreams.thoughtfull.world/videos/{user_id}/{dream_id}/{node_id}.mp4`
- Database stores `video_url` field

### **9. Custom Domain for Videos**
- ✅ **Video Domain**: `https://dreams.thoughtfull.world/`
- Configured via `R2_PUBLIC_URL` environment variable

---

## 🔐 **Authentication Functions**

### **Signup**
```bash
POST https://vnoyyctltxouigjyqvav.supabase.co/functions/v1/signup

Body:
{
  "email": "user@example.com",
  "password": "password123",
  "metadata": {
    "name": "John Doe"
  }
}

Response:
{
  "success": true,
  "user": {
    "id": "...",
    "email": "...",
    "created_at": "..."
  }
}
```

### **Login**
```bash
POST https://vnoyyctltxouigjyqvav.supabase.co/functions/v1/login

Body:
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "user": {...},
  "session": {...},
  "access_token": "eyJ...",
  "refresh_token": "..."
}
```

---

## 📡 **API Endpoints**

### **Deployed Edge Functions:**

1. **`signup`** - Create new user account
   - URL: `https://vnoyyctltxouigjyqvav.supabase.co/functions/v1/signup`
   - Auth: ❌ Not required

2. **`login`** - User authentication  
   - URL: `https://vnoyyctltxouigjyqvav.supabase.co/functions/v1/login`
   - Auth: ❌ Not required

3. **`process-dream`** - Main dream processing
   - URL: `https://vnoyyctltxouigjyqvav.supabase.co/functions/v1/process-dream`
   - Auth: ✅ Required (Bearer token)

4. **`generate-video`** - Video generation
   - URL: `https://vnoyyctltxouigjyqvav.supabase.co/functions/v1/generate-video`
   - Auth: ✅ Required

5. **`check-video-status`** - Check video status
   - URL: `https://vnoyyctltxouigjyqvav.supabase.co/functions/v1/check-video-status`
   - Auth: ✅ Required

---

## 🎬 **Complete Flow Example**

```javascript
// 1. User Signup
const signupResponse = await fetch(
  'https://vnoyyctltxouigjyqvav.supabase.co/functions/v1/signup',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'user@example.com',
      password: 'password123'
    })
  }
);

// 2. User Login
const loginResponse = await fetch(
  'https://vnoyyctltxouigjyqvav.supabase.co/functions/v1/login',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'user@example.com',
      password: 'password123'
    })
  }
);

const { access_token } = await loginResponse.json();

// 3. Record Audio and Process Dream
const audioBlob = await recordAudio(); // Your recording function
const audioBase64 = await blobToBase64(audioBlob);

const dreamResponse = await fetch(
  'https://vnoyyctltxouigjyqvav.supabase.co/functions/v1/process-dream',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      audioBase64: audioBase64,
      audioMimeType: 'audio/webm',
      generateVideo: false // Set true for immediate video
    })
  }
);

const dream = await dreamResponse.json();
// dream = { dreamId, storyNode, options, transcript }

// 4. Generate Video (Optional - can be done later)
const videoResponse = await fetch(
  'https://vnoyyctltxouigjyqvav.supabase.co/functions/v1/generate-video',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      storyNodeId: dream.storyNode.id
    })
  }
);

const video = await videoResponse.json();
// video = { success: true, videoUrl: "https://dreams.thoughtfull.world/..." }

// 5. Check Video Status (for polling)
const statusResponse = await fetch(
  `https://vnoyyctltxouigjyqvav.supabase.co/functions/v1/check-video-status?nodeId=${dream.storyNode.id}`,
  {
    headers: {
      'Authorization': `Bearer ${access_token}`
    }
  }
);

const status = await statusResponse.json();
// status = { nodeId, videoUrl, status: "ready" | "pending" }
```

---

## 🌐 **Video URL Structure**

**Custom Domain:** `https://dreams.thoughtfull.world/`

**Full URL Pattern:**
```
https://dreams.thoughtfull.world/videos/{user_id}/{dream_id}/{node_id}.mp4
```

**Example:**
```
https://dreams.thoughtfull.world/videos/81c771d6-e4c4-4ffe-882e-d113a00480d3/ecfee84f-e6a4-495f-9fde-62bab741f8f9/c778cf59-c8ad-4c7a-935d-94185f6ebebb.mp4
```

---

## 🔑 **Environment Variables Configured**

```bash
# AI Services
OPENAI_API_KEY=sk-...              # GPT-4 + Whisper
ELEVENLABS_API_KEY=sk-...          # Speech-to-text
MEM0_API_KEY=...                   # Memory management
FAL_API_KEY=...                    # Video generation

# Storage
R2_ACCOUNT_ID=...                  # Cloudflare account
R2_ACCESS_KEY_ID=...               # R2 credentials
R2_SECRET_ACCESS_KEY=...           # R2 secret
R2_BUCKET_NAME=...                 # Bucket name
R2_PUBLIC_URL=https://dreams.thoughtfull.world  # ✅ Custom domain

# Supabase (Auto-configured)
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

---

## 📦 **Database Schema**

### **Tables:**

1. **`dreams`**
   - `id` (UUID, PK)
   - `user_id` (UUID, FK → auth.users)
   - `transcript` (TEXT)
   - `created_at` (TIMESTAMP)

2. **`story_nodes`**
   - `id` (UUID, PK)
   - `dream_id` (UUID, FK → dreams)
   - `parent_node_id` (UUID, FK → story_nodes, nullable)
   - `content` (TEXT)
   - `video_url` (TEXT, nullable) ← **Points to https://dreams.thoughtfull.world/**
   - `created_at` (TIMESTAMP)

3. **`story_options`**
   - `id` (UUID, PK)
   - `story_node_id` (UUID, FK → story_nodes)
   - `option_text` (TEXT)
   - `next_node_id` (UUID, FK → story_nodes, nullable)

### **Storage:**

- **Bucket:** `audio` (Public)
  - Stores user voice recordings
  - Linked via user_id in database

---

## ✅ **All Systems GO!**

**Status:** Production Ready ✨

| Component | Status | Notes |
|-----------|--------|-------|
| Audio Upload | ✅ Working | Supabase Storage |
| Speech-to-Text | ✅ Working | ElevenLabs STT |
| Memory Retrieval | ✅ Working | Mem0 |
| Story Generation | ✅ Working | OpenAI GPT-4 |
| Database | ✅ Working | All tables + RLS |
| Video Generation | ✅ Working | Fal.ai |
| Video Storage | ✅ Working | Cloudflare R2 |
| Custom Domain | ✅ Configured | dreams.thoughtfull.world |
| User Signup | ✅ Working | Edge Function |
| User Login | ✅ Working | Edge Function |

---

## 🚀 **Next Steps for Frontend:**

1. **Implement audio recording** (Web Audio API / React Native)
2. **Connect to signup/login** functions
3. **Send audio to process-dream** function
4. **Display story + options**
5. **Poll for video status** and display when ready
6. **Handle user navigation** through dream branches

**Your backend is 100% ready!** 🎉

---

## 📞 **Support & Resources:**

- **Dashboard:** https://supabase.com/dashboard/project/vnoyyctltxouigjyqvav
- **Functions:** https://supabase.com/dashboard/project/vnoyyctltxouigjyqvav/functions
- **Database:** https://supabase.com/dashboard/project/vnoyyctltxouigjyqvav/editor
- **Storage:** https://supabase.com/dashboard/project/vnoyyctltxouigjyqvav/storage

---

**Built with:** Supabase, OpenAI, ElevenLabs, Mem0, Fal.ai, Cloudflare R2

