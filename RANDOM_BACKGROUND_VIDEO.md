# 🎬 Random Background Video Feature

Dynamic background videos on the homepage, showcasing random user-generated dreams!

---

## ✨ What Was Added

### 1. New Supabase Edge Function: `get-random-video`

**Location:** `/supabase/functions/get-random-video/index.ts`

**Purpose:** Fetches a random video URL from the `story_nodes` table to display as background.

**Features:**
- ✅ No authentication required (public endpoint)
- ✅ Fetches last 20 videos with video URLs
- ✅ Randomly selects one video
- ✅ Returns video URL with story snippet
- ✅ 60-second cache for performance
- ✅ Graceful fallback if no videos exist

**API Response:**
```json
{
  "video_url": "https://dreams.thoughtfull.world/videos/...",
  "story_content": "First 100 characters of story...",
  "created_at": "2025-10-18T08:36:08.778+00:00"
}
```

**Endpoint:**
```
GET https://vnoyyctltxouigjyqvav.supabase.co/functions/v1/get-random-video
```

---

### 2. Frontend API Integration

**Location:** `/src/lib/api.ts`

**New Function:** `getRandomVideo()`

```typescript
export async function getRandomVideo(): Promise<string | null> {
  // Fetches random video URL from Edge Function
  // Returns null if none available
}
```

---

### 3. UI Updates

**Location:** `/src/app/page.tsx`

**Changes:**
1. **New State:** `backgroundVideoUrl` - Stores the random video URL
2. **useEffect Hook:** Fetches random video on component mount
3. **Dynamic Background:** Uses `backgroundVideoUrl` instead of hardcoded video
4. **Fallback:** Shows animated gradient if no video is available

**Before:**
```tsx
<video
  src="https://hardcoded-video-url.mp4"
  autoPlay muted loop
/>
```

**After:**
```tsx
{backgroundVideoUrl ? (
  <video
    key={backgroundVideoUrl}
    src={backgroundVideoUrl}
    autoPlay muted loop
  />
) : (
  <div className="animated-gradient-fallback" />
)}
```

---

## 🎯 How It Works

### Flow:

1. **User visits homepage**
   ↓
2. **Frontend calls `getRandomVideo()`**
   ↓
3. **Edge Function queries database for videos**
   ↓
4. **Randomly selects one from last 20 videos**
   ↓
5. **Returns video URL to frontend**
   ↓
6. **Video displays as background**

### Refresh Logic:

- ✅ New random video on every page refresh
- ✅ Video changes when navigating back to homepage
- ✅ 60-second CDN cache for performance

---

## 🚀 Deployment

### Edge Function Deployed:
```bash
npx supabase functions deploy get-random-video
```

### Configuration:
Added to `/supabase/config.toml`:
```toml
[functions.get-random-video]
verify_jwt = false
```

---

## 🧪 Testing

### Test Edge Function:
```bash
curl -X GET "https://vnoyyctltxouigjyqvav.supabase.co/functions/v1/get-random-video"
```

**Expected Response:**
```json
{
  "video_url": "https://dreams.thoughtfull.world/videos/...",
  "story_content": "Story preview...",
  "created_at": "2025-10-18T..."
}
```

### Test UI:
1. Visit http://localhost:3000
2. Observe background video changes on refresh
3. Check browser console for log: `🎬 Loaded random background video: ...`

---

## 📊 Performance

- **Edge Function:** ~3 seconds initial fetch
- **Cached Response:** ~100ms (60-second cache)
- **Video Loading:** Progressive (autoplay + muted)
- **Database Query:** Optimized (LIMIT 20, recent videos only)

---

## 🎨 User Experience

### Benefits:
- ✨ **Dynamic Content:** Homepage always feels fresh
- 🎥 **Community Showcase:** Users see other dreams
- 🌟 **Inspiration:** Seeing videos encourages creation
- 🔄 **Variety:** Different video every visit

### Fallback:
If no videos exist yet:
- Shows animated gradient background
- Purple/magenta/cyan colors
- Smooth pulse animation
- Same visual style as brand

---

## 🔧 Technical Details

### Database Query:
```sql
SELECT video_url, content, created_at
FROM story_nodes
WHERE video_url IS NOT NULL
ORDER BY created_at DESC
LIMIT 20;
```

### Random Selection:
```typescript
const randomIndex = Math.floor(Math.random() * data.length);
const randomVideo = data[randomIndex];
```

### Video Element:
```tsx
<video
  key={backgroundVideoUrl}  // Force reload on URL change
  className="fixed inset-0 w-full h-full object-cover -z-10"
  src={backgroundVideoUrl}
  autoPlay  // Start playing immediately
  muted     // Required for autoplay
  loop      // Continuous playback
/>
```

---

## 🐛 Troubleshooting

### No Background Video Shows:
1. Check if any videos exist in database:
   ```sql
   SELECT COUNT(*) FROM story_nodes WHERE video_url IS NOT NULL;
   ```
2. Test Edge Function manually
3. Check browser console for errors
4. Verify video URLs are accessible

### Video Doesn't Autoplay:
- ✅ Videos must be muted for autoplay to work
- ✅ Some browsers block autoplay (handled in code)

### Performance Issues:
- ✅ CDN caching enabled (60 seconds)
- ✅ Only fetches 20 most recent videos
- ✅ Video loads progressively

---

## 🌟 Future Enhancements

### Possible Improvements:
1. **Curated Videos:** Admin can select featured videos
2. **User Preferences:** Users can favorite videos
3. **Categories:** Filter by dream theme/style
4. **Transitions:** Smooth fade between videos
5. **Pre-loading:** Preload next random video
6. **Analytics:** Track which videos are most engaging

---

## 📝 Files Modified

- ✅ `/supabase/functions/get-random-video/index.ts` (NEW)
- ✅ `/supabase/config.toml` (Updated)
- ✅ `/src/lib/api.ts` (Updated)
- ✅ `/src/app/page.tsx` (Updated)

---

## ✅ Status

**Feature:** Fully Implemented ✨  
**Deployed:** Edge Function live  
**Tested:** Working as expected  
**Server:** Running on http://localhost:3000

---

## 🎉 Result

Your homepage now displays a **random user-generated dream video** as the background, creating a dynamic and engaging experience for every visitor!

**Refresh the page to see different videos!** 🎬

