# 🚀 Cloudflare Pages Deployment Guide

Deploy your ThoughtFull Dreams app to Cloudflare Pages!

---

## ⚡ Quick Start (Recommended Path)

1. **Commit your changes:** `git push origin main`
2. **Go to Cloudflare:** https://dash.cloudflare.com/
3. **Connect GitHub repository** via Pages
4. **Add environment variables** (Supabase URL & keys)
5. **Deploy!** Your app will be live in minutes!

---

## 📋 Prerequisites

- ✅ Cloudflare account (sign up at https://cloudflare.com)
- ✅ Wrangler CLI installed (done ✓)
- ✅ Your Supabase credentials
- ✅ Git repository

---

## 🎯 Deployment Methods

### Method 1: GitHub Integration (Recommended ✨)

This is the easiest and most reliable method for Next.js apps!

#### Step 1: Commit and Push Changes

Make sure all your latest changes are pushed to GitHub:

```bash
git add .
git commit -m "Configure for Cloudflare Pages deployment"
git push origin main
```

#### Step 2: Connect to Cloudflare Pages

1. **Go to Cloudflare Dashboard:**
   - Visit: https://dash.cloudflare.com/
   - Navigate to **Workers & Pages**

2. **Create New Project:**
   - Click **Create Application**
   - Select **Pages**
   - Click **Connect to Git**

3. **Select Repository:**
   - Choose: `ThoughtFull-World/tf-dreams`
   - Select branch: `main`
   - Click **Begin setup**

4. **Configure Build Settings:**
   - **Project name:** `thoughtfull-dreams`
   - **Framework preset:** Next.js (SSR)
   - **Build command:** `npm run build`
   - **Build output directory:** `.next`
   - Click **Save**

5. **Add Environment Variables:**
   - Before deploying, click **Add variable**
   - Add these three variables:

   | Variable Name | Value |
   |--------------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://vnoyyctltxouigjyqvav.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
   | `NEXT_PUBLIC_BASE_URL` | `https://thoughtfull-dreams.pages.dev` |

6. **Deploy!**
   - Click **Save and Deploy**
   - ☕ Wait 2-5 minutes for the build

#### Step 3: Automatic Deployments

Every push to `main` will automatically deploy! 🎉

**Preview Deployments:**
- Every pull request gets its own preview URL
- Test changes before merging

---

## 🔧 Configuration Files

### `wrangler.toml`
Configuration for manual deployments (not needed for GitHub integration):
```toml
name = "thoughtfull-dreams"
compatibility_date = "2024-10-18"
```

### `next.config.mjs`
Standard Next.js configuration:
- `images: { unoptimized: true }` - Better for edge deployment
- Supports dynamic routes (like `/share/[token]`)
- API routes work with Cloudflare Functions

### `package.json` Scripts
- `npm run build` - Build for production
- `npm run deploy` - Manual deploy via Wrangler (GitHub method recommended)
- `npm run dev` - Local development

---

## 📊 Deployment Process

When you run `npm run deploy`:

1. **Build** (`npm run build`):
   - Next.js generates static HTML/CSS/JS
   - Output goes to `out/` directory
   - All pages are pre-rendered

2. **Deploy** (`wrangler pages deploy`):
   - Uploads `out/` to Cloudflare Pages
   - Cloudflare CDN distributes globally
   - Your app is live in seconds!

---

## 🌐 Your Deployed URLs

After deployment, you'll get:

**Production:** `https://thoughtfull-dreams.pages.dev`
**Preview Deployments:** `https://[branch].[project].pages.dev`

### Custom Domain

To use a custom domain like `dreams.thoughtfull.world`:

1. Go to Cloudflare Dashboard → **Pages** → **thoughtfull-dreams**
2. Click **Custom Domains**
3. Click **Set up a custom domain**
4. Enter: `dreams.thoughtfull.world`
5. Follow DNS setup instructions
6. Update `NEXT_PUBLIC_BASE_URL` to your custom domain
7. Redeploy

---

## 🔄 Update Supabase URLs

After deployment, update your Supabase settings:

1. Go to: https://supabase.com/dashboard/project/vnoyyctltxouigjyqvav/auth/url-configuration

2. **Site URL:** `https://thoughtfull-dreams.pages.dev`

3. **Redirect URLs:** Add:
   ```
   https://thoughtfull-dreams.pages.dev/**
   https://thoughtfull-dreams.pages.dev/auth/callback
   ```

4. If you added a custom domain, add those URLs too!

---

## 🚀 Deployment Commands

### First Time Deployment
```bash
# 1. Login to Cloudflare
npx wrangler login

# 2. Build the app
npm run build

# 3. Deploy
npm run deploy
```

### Subsequent Deployments
```bash
npm run deploy
```

### Preview Deployment
```bash
npm run deploy:preview
```

### Check Deployment Status
```bash
npx wrangler pages deployment list --project-name=thoughtfull-dreams
```

### View Logs
```bash
npx wrangler pages deployment tail --project-name=thoughtfull-dreams
```

---

## 🐛 Troubleshooting

### Issue: "Project not found"

**Solution:** Create the project first:
```bash
npx wrangler pages project create thoughtfull-dreams
```

### Issue: Build fails with API route errors

**Solution:** The app is configured for static export. API routes in `src/app/api/` are not used and can be ignored or deleted.

### Issue: Environment variables not working

**Solution:** 
1. Make sure variables are prefixed with `NEXT_PUBLIC_`
2. Redeploy after adding variables
3. Check variables in Cloudflare Dashboard

### Issue: Images not loading

**Solution:** Images are set to `unoptimized: true` in config. If using external images, verify CORS settings.

### Issue: Dynamic routes not working

**Solution:** All routes are pre-rendered at build time. Dynamic content fetching (like from Supabase) works client-side.

---

## 💰 Cloudflare Pages Pricing

**Free Tier:**
- ✅ Unlimited sites
- ✅ Unlimited requests
- ✅ Unlimited bandwidth
- ✅ 500 builds/month
- ✅ 1 build at a time

**Paid Plans:** $20/month for more builds and concurrent builds.

---

## 📈 Performance Benefits

- **Global CDN:** Your app loads fast worldwide
- **Edge Caching:** Static files cached at 200+ locations
- **DDoS Protection:** Built-in security
- **SSL/HTTPS:** Automatic SSL certificates
- **IPv6:** Full IPv6 support

---

## 🎯 Next Steps

1. **Deploy:** Run `npm run deploy`
2. **Test:** Visit your Pages URL
3. **Configure:** Add environment variables
4. **Update Supabase:** Add your Pages URL to allowed URLs
5. **Custom Domain:** (Optional) Set up custom domain
6. **Monitor:** Check analytics in Cloudflare Dashboard

---

## 📚 Useful Links

- **Cloudflare Dashboard:** https://dash.cloudflare.com/
- **Pages Documentation:** https://developers.cloudflare.com/pages/
- **Wrangler Docs:** https://developers.cloudflare.com/workers/wrangler/
- **Next.js on Pages:** https://developers.cloudflare.com/pages/framework-guides/nextjs/

---

## ✅ Checklist

Before deploying:
- [ ] Wrangler installed (`npx wrangler --version`)
- [ ] Logged in (`npx wrangler login`)
- [ ] Build succeeds (`npm run build`)
- [ ] Environment variables ready
- [ ] Supabase URLs updated

After deploying:
- [ ] Site loads correctly
- [ ] Can record dreams
- [ ] Videos generate
- [ ] Library page works
- [ ] Background video loads
- [ ] Authentication works

---

**Ready to deploy?** Run:

```bash
npm run deploy
```

🚀 **Your dream journal will be live in minutes!**

