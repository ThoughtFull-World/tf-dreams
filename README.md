# ThoughtFull Dreams 🌙✨

Turn your morning dreams into magical videos!

## About

ThoughtFull Dreams is a mobile-first web app built for a 24-hour hackathon. It transforms your dream recordings into short, whimsical videos through a simple 3-step flow.

### The Experience

1. **Record** 🎤 - Capture your dream as a voice recording (up to 60 seconds)
2. **Generate** 🎬 - Watch as we transform your words into a video
3. **Share** 📱 - Get a shareable link to your dream video

## Tech Stack

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Framer Motion** for smooth animations
- Mobile-first, responsive design

### Backend (Coming Soon)

The backend will integrate:
- **Supabase** (Postgres, Storage, Edge Functions)
- **ElevenLabs** for speech-to-text
- **mem0** for story generation
- **fal.ai** for video generation

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm/yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd tf-dreams
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
# or
yarn install
```

3. Create environment file (optional for frontend-only):
```bash
cp .env.local.example .env.local
```

4. Run the development server:
```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
tf-dreams/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with gradient background
│   │   ├── page.tsx            # Main 3-step flow page
│   │   ├── globals.css         # Global styles
│   │   └── share/[token]/      # Shareable dream page
│   ├── components/
│   │   ├── Button.tsx          # Reusable button component
│   │   ├── ProgressSteps.tsx   # Pipeline progress visualization
│   │   └── Recorder.tsx        # Audio recording component
│   └── lib/
│       ├── types.ts            # TypeScript types
│       └── api.ts              # API placeholder functions
├── public/
│   └── logo.svg                # App logo
└── README.md
```

## Design

### Color Palette

The app uses a soft, pastel color scheme:
- **Mint**: `#B6F0DE`
- **Lavender**: `#D8C4F3`
- **Peach**: `#FFD7C2`
- **Sky**: `#BDE0FE`

### Design Principles

- Mobile-first responsive design
- Soft shadows and rounded corners (2-3rem radius)
- Smooth micro-interactions with Framer Motion
- Clean, minimal UI without heavy component libraries

## Current Status

✅ Frontend scaffolding complete
✅ 3-step user flow implemented
✅ Audio recording with MediaRecorder API
✅ Mock pipeline simulation
✅ Shareable link page

🚧 Coming Next:
- Supabase backend integration
- Speech-to-text with ElevenLabs
- Story generation with mem0
- Video generation with fal.ai
- Database and storage setup

## Development Notes

### Recording

The app uses the browser's `MediaRecorder` API to capture audio. Make sure to allow microphone access when prompted.

### Mocked Functionality

Currently, the following features are mocked with timers:
- Audio upload (500ms delay)
- Pipeline steps (2-3s each)
- Share tokens (timestamp-based)

These will be replaced with real API calls once the backend is integrated.

## Contributing

This is a hackathon project! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## License

MIT

---

Built with 💭 and ✨ for dreamers everywhere.

