# ✨ ThoughtFull Dreams

> Transform your dreams into visual stories with AI

ThoughtFull Dreams is an innovative web application that turns your dream recordings into beautiful AI-generated videos. Simply speak your dream, and watch it come to life.

**Made with 💜 at Cursor Hackathon SG '25**

🌐 **Live App**: [dreams.thoughtfull.world](https://dreams.thoughtfull.world)

---

## 🎯 Features

- 🎤 **Voice Recording**: Speak your dreams naturally (up to 60 seconds)
- 🤖 **AI Story Generation**: Transform voice into coherent narratives using OpenAI GPT-4
- 🧠 **Memory-Aware**: Mem0 recalls your past dreams for personalized storytelling
- 🎬 **Video Creation**: Generate stunning videos with Fal.ai
- 📚 **Dream Library**: Access all your past dreams with magic link authentication
- 🔗 **Social Sharing**: Share your dream videos with a unique link
- 🎨 **Beautiful UI**: Glassmorphic design with smooth animations
- 🔐 **Passwordless Auth**: Secure magic link authentication via Supabase

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase CLI
- Supabase account
- Cloudflare R2 account (for video storage)
- ElevenLabs API key
- OpenAI API key
- Fal.ai API key
- Mem0 API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ThoughtFull-World/tf-dreams.git
   cd tf-dreams
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your keys:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start Supabase locally** (optional for development)
   ```bash
   npx supabase start
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

---

## 📁 Project Structure

```
tf-dreams/
├── src/
│   ├── app/                  # Next.js 14 App Router
│   │   ├── page.tsx         # Main homepage & recording flow
│   │   ├── library/         # Dream library page
│   │   ├── share/           # Public sharing pages
│   │   └── auth/            # Authentication callback
│   ├── components/          # React components
│   │   ├── Recorder.tsx     # Audio recording component
│   │   ├── ProgressSteps.tsx # Video generation progress
│   │   ├── AppLayout.tsx    # Main layout wrapper
│   │   └── AuthDialog.tsx   # Magic link login
│   └── lib/                 # Utilities & types
│       ├── api.ts           # API client
│       ├── auth-context.tsx # Auth state management
│       └── types.ts         # TypeScript types
├── supabase/
│   ├── functions/           # Edge Functions
│   │   ├── magic-link/      # Authentication
│   │   ├── process-dream/   # Main processing pipeline
│   │   ├── generate-video/  # Video generation
│   │   ├── check-video-status/ # Poll video status
│   │   └── get-random-video/ # Random public dreams
│   └── migrations/          # Database migrations
├── public/                  # Static assets
└── docs/                    # Documentation
    ├── changelogs/          # Feature updates & changes
    ├── setup/               # Setup & integration guides
    ├── deployment/          # Deployment instructions
    └── design/              # Design system & UI docs
```

---

## 🔧 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Supabase Client** - Authentication & data

### Backend
- **Supabase** - PostgreSQL database & auth
- **Edge Functions** - Serverless Deno functions
- **Cloudflare R2** - Video & audio storage
- **ElevenLabs** - Speech-to-text transcription
- **Mem0** - Personal memory & context retrieval
- **OpenAI GPT-4** - Story generation
- **Fal.ai** - Video generation

### Deployment
- **Vercel** - Frontend hosting
- **Supabase** - Backend & database
- **Cloudflare R2** - Media CDN

---

## 🎨 Design System

- **Colors**: Purple/Cyan/Magenta gradients
- **Style**: Glassmorphism with backdrop blur
- **Typography**: Modern, clean, accessible
- **Components**: Reusable, responsive, animated

See [`docs/design/DESIGN_SYSTEM.md`](./docs/design/DESIGN_SYSTEM.md) for details.

---

## 📚 Documentation

### Setup & Configuration
- [Quick Start Guide](./docs/setup/QUICKSTART.md)
- [Magic Link Authentication Setup](./docs/setup/MAGIC_LINK_SETUP.md)
- [Frontend Integration Guide](./docs/setup/FRONTEND_INTEGRATION_GUIDE.md)
- [Supabase API Integration](./docs/setup/SUPABASE_API_INTEGRATION.md)

### Deployment
- [Cloudflare Deployment](./docs/deployment/CLOUDFLARE_DEPLOYMENT.md)
- [Production Deployment Guide](./docs/deployment/DEPLOY_NOW.md)

### Design & UI
- [Design System](./docs/design/DESIGN_SYSTEM.md)
- [Glassmorphism Implementation](./docs/design/GLASSMORPHISM_IMPLEMENTATION.md)
- [macOS-Style Redesign](./docs/design/MACOS_REDESIGN.md)

### Changelogs
- [Feature Updates](./docs/changelogs/)
- [Authentication Implementation](./docs/changelogs/AUTHENTICATION_IMPLEMENTATION.md)
- [UI/UX Improvements](./docs/changelogs/UI_UX_IMPROVEMENTS.md)

---

## 🔐 Authentication

ThoughtFull Dreams uses **passwordless authentication** via magic links:

1. User enters email address
2. Magic link sent via Supabase Auth
3. Click link to authenticate
4. Session persists across devices

See [`docs/setup/MAGIC_LINK_SETUP.md`](./docs/setup/MAGIC_LINK_SETUP.md) for configuration.

---

## 🎬 Video Generation Pipeline

```
1. 🎤 Record Audio (60s max)
   ↓
2. 📝 Transcribe with ElevenLabs
   ↓
3. 🧠 Retrieve Context with Mem0
   ↓
4. 🤖 Generate Story with OpenAI GPT-4
   ↓
5. 🎬 Create Video with Fal.ai
   ↓
6. ☁️ Store in Cloudflare R2
   ↓
7. ✅ Ready to view & share
```

---

## 🌐 Environment Variables

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Supabase Edge Functions
```env
ELEVENLABS_API_KEY=...
MEM0_API_KEY=...
OPENAI_API_KEY=sk-...
FAL_API_KEY=...
R2_ENDPOINT=https://...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=tf-dreams
R2_PUBLIC_URL=https://...
SITE_URL=https://dreams.thoughtfull.world
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Cursor Hackathon SG '25** - For the inspiration and deadline
- **Supabase** - For the amazing backend platform
- **Fal.ai** - For stunning video generation
- **OpenAI** - For GPT-4 storytelling
- **ElevenLabs** - For audio transcription
- **Mem0** - For personal memory & context

---

## 📞 Contact

- **GitHub**: [@ThoughtFull-World](https://github.com/ThoughtFull-World)
- **Live App**: [dreams.thoughtfull.world](https://dreams.thoughtfull.world)

---

**Made with 💜 at Cursor Hackathon SG '25**
