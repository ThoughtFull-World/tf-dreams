# 🎬 Video Length Configuration

## Current Settings

**Video Duration:** 5 seconds  
**Generation Time:** ~60-90 seconds

### Parameters:
```typescript
{
  num_frames: 40,          // 5 seconds at 8 fps
  num_inference_steps: 6,  // Optimized for speed
  guidance_scale: 6.0,     // Quality vs speed balance
  fps: 8,                  // Frames per second
  motion_scale: 1.3,       // Dynamic movement
}
```

---

## Duration Options

### Quick Reference Table

| Frames | FPS | Duration | Est. Generation Time | Use Case |
|--------|-----|----------|---------------------|----------|
| 12 | 8 | 1.5s | 30-50s | Quick preview |
| 24 | 8 | 3s | 40-60s | Short clip |
| **40** | **8** | **5s** | **60-90s** | **Recommended** ⭐ |
| 56 | 8 | 7s | 90-120s | Longer scene |
| 80 | 8 | 10s | 120-180s | Full scene |

---

## How to Change Video Duration

### Option 1: Quick Presets

#### Short (3 seconds)
```typescript
num_frames: 24,  // 3s at 8 fps
```

#### Medium (5 seconds) - Current ⭐
```typescript
num_frames: 40,  // 5s at 8 fps
```

#### Long (10 seconds)
```typescript
num_frames: 80,  // 10s at 8 fps
```

### Option 2: Custom Duration

**Formula:** `num_frames = duration_in_seconds × fps`

**Example for 7 seconds:**
```typescript
num_frames: 56,  // 7 seconds × 8 fps
```

---

## Performance Impact

### Generation Time Scaling

Roughly linear with frame count:
- **Double frames** ≈ **Double generation time**
- 12 frames → 30-50s
- 24 frames → 40-60s
- 40 frames → 60-90s
- 80 frames → 120-180s

### Cost Scaling

Fal.ai charges per generation, frame count affects:
- **More frames** = **Longer generation** = **Slightly higher cost**
- But price difference is minimal (same API call)

---

## Recommendations by Use Case

### 🚀 Fast Prototyping
```typescript
num_frames: 12,  // 1.5s, ~30-50s generation
```
- Quickest iteration
- Test prompts and settings
- MVP testing

### ⚡ Production (Recommended)
```typescript
num_frames: 40,  // 5s, ~60-90s generation
```
- Good user experience
- Reasonable wait time
- Shows full dream scene
- **Current setting** ✅

### 🎨 Premium/Showcase
```typescript
num_frames: 80,  // 10s, ~120-180s generation
```
- Longer storytelling
- More detailed scenes
- For special/featured dreams
- Users willing to wait

---

## Alternative: Variable Length by Tier

You could offer different lengths based on user tier:

```typescript
const framesByTier = {
  free: 24,      // 3s - Quick dreams
  premium: 40,   // 5s - Standard
  pro: 80,       // 10s - Extended
};

const numFrames = framesByTier[userTier] || 40;
```

---

## Testing Results

After deployment, monitor:
1. **Average generation time** - Should be ~60-90s
2. **User completion rate** - How many wait for video
3. **Error rate** - Longer videos more likely to timeout
4. **User feedback** - Is 5s long enough?

---

## Adjusting After Deployment

If generation takes too long:
- Reduce to 24 frames (3s)
- Or reduce inference_steps to 4

If users want longer videos:
- Increase to 56 frames (7s)
- Or offer as premium feature

---

## Current Configuration Summary

✅ **Duration:** 5 seconds  
✅ **Frame count:** 40  
✅ **FPS:** 8  
✅ **Est. time:** 60-90 seconds  
✅ **Quality:** Good  
✅ **User experience:** Balanced  

This is a sweet spot between video length and generation speed! 🎯

