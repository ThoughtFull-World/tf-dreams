# Dream Journal Edge Function - Quick Start

**5-minute setup guide** for deploying the Dream Journal Supabase Edge Function.

---

## 📋 Prerequisites

- [ ] Supabase account ([sign up](https://supabase.com))
- [ ] Node.js & npm installed
- [ ] API keys ready:
  - ElevenLabs API key
  - Anthropic API key
  - Fal.ai API key
  - Cloudflare R2 credentials

---

## 🚀 Deployment Steps

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

### 2. Login & Link Project

```bash
supabase login
supabase link --project-ref <your-project-ref>
```

### 3. Setup Database

```bash
supabase db push
```

### 4. Create Storage Bucket

In Supabase Dashboard:
1. Go to **Storage** → **New bucket**
2. Name: `audio`
3. Make it **public**

### 5. Configure Environment Variables

```bash
supabase secrets set ELEVENLABS_API_KEY=sk-...
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
supabase secrets set FAL_API_KEY=...
supabase secrets set R2_ACCOUNT_ID=...
supabase secrets set R2_ACCESS_KEY_ID=...
supabase secrets set R2_SECRET_ACCESS_KEY=...
supabase secrets set R2_BUCKET_NAME=dream-videos
```

### 6. Deploy Function

```bash
cd supabase/functions
supabase functions deploy process-dream
```

### 7. Test

```bash
curl -X POST https://<project-ref>.supabase.co/functions/v1/process-dream \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{"textInput": "test dream", "generateVideo": false}'
```

---

## 📱 Frontend Integration

```typescript
const { data: { session } } = await supabase.auth.getSession();

const response = await fetch(
  `${supabaseUrl}/functions/v1/process-dream`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      textInput: userInput,
      generateVideo: true,
    }),
  }
);

const data = await response.json();
// data.storyNode, data.options, data.dreamId
```

---

## 🔍 Verify Deployment

✅ Check logs:
```bash
supabase functions logs process-dream
```

✅ List functions:
```bash
supabase functions list
```

✅ Test locally:
```bash
supabase functions serve process-dream --env-file ./supabase/functions/.env.local
```

---

## 📚 Documentation

- **Full Setup Guide**: [SETUP.md](./SETUP.md)
- **API Reference**: [functions/process-dream/API.md](./functions/process-dream/API.md)
- **Function README**: [functions/process-dream/README.md](./functions/process-dream/README.md)

---

## 🐛 Troubleshooting

**"Not authorized"**  
→ Ensure user is logged in and JWT is valid

**"API key not configured"**  
→ Run `supabase secrets list` and verify all keys are set

**Timeout errors**  
→ Disable video generation: `"generateVideo": false`

**Database errors**  
→ Run migrations: `supabase db push`

---

## 💰 Cost Estimates

Per request (with video):
- ElevenLabs: ~$0.02 (audio transcription)
- Claude: ~$0.01 (story generation)
- Fal.ai: ~$0.10 (video generation)
- **Total: ~$0.13 per request**

Without video: **~$0.03 per request**

---

## 🎯 Next Steps

1. Implement rate limiting in your frontend
2. Add error boundaries for API failures
3. Monitor usage in each provider's dashboard
4. Set up usage alerts
5. Consider caching frequently accessed stories

---

## 📞 Support

- [Supabase Docs](https://supabase.com/docs)
- [ElevenLabs Docs](https://elevenlabs.io/docs)
- [Anthropic Docs](https://docs.anthropic.com)
- [Fal.ai Docs](https://fal.ai/docs)
- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)

---

**Ready to build amazing dream experiences! 🌙✨**

