# Quick Start Guide 🚀

## Install & Run (3 commands)

```bash
# 1. Install dependencies
npm install

# 2. Create environment file (optional - has defaults)
cp .env.local.example .env.local

# 3. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## Test the Flow

1. **Click "Start Recording"** - allow microphone access
2. **Speak for a few seconds** - describe a dream
3. **Click "Stop Recording"** - then confirm
4. **Click "Start Generate"** - watch the progress animation
5. **See your result** - with shareable link

## What's Working Now

✅ Full 3-step UI flow  
✅ Audio recording (browser MediaRecorder)  
✅ Progress animations  
✅ Mock pipeline simulation  
✅ Share page routing  
✅ Mobile-responsive design  

## What's Mocked (Coming Soon)

🚧 Audio upload → will use Supabase Storage  
🚧 Speech-to-text → will use ElevenLabs  
🚧 Story generation → will use mem0  
🚧 Video generation → will use fal.ai  

## File Structure

```
src/
├── app/
│   ├── page.tsx              # Main 3-step flow
│   ├── share/[token]/        # Share page
│   └── layout.tsx            # Root layout
├── components/
│   ├── Recorder.tsx          # Audio recording
│   ├── ProgressSteps.tsx     # Pipeline progress
│   └── Button.tsx            # Reusable button
└── lib/
    ├── types.ts              # TypeScript types
    └── api.ts                # API placeholders
```

## Design Tokens

```css
/* Pastel Colors */
mint:     #B6F0DE
lavender: #D8C4F3
peach:    #FFD7C2
sky:      #BDE0FE

/* Shadows & Borders */
shadow: 0 10px 30px rgba(0,0,0,0.06)
radius: 1.5-2rem (extra rounded)
```

## Browser Requirements

- Modern browser with `MediaRecorder` API support
- Microphone access permission
- JavaScript enabled

## Development Tips

- The app is mobile-first but works on desktop
- Check browser console for mock API logs
- Share links are timestamp-based for now
- All animations use Framer Motion

---

Need help? Check the main [README.md](./README.md)

