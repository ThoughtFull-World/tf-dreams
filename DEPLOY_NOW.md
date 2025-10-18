# 🚀 Deploy to Cloudflare Pages - Do This Now!

## ✅ Build Status: WORKING

Your app builds successfully! Now follow these steps to deploy.

---

## 📝 Step-by-Step Deployment

### Step 1: Push Your Code to GitHub

```bash
cd /home/ian/tf-dreams-1

# Add all changes
git add .

# Commit
git commit -m "Add Cloudflare Pages deployment configuration"

# Push to main branch
git push origin main
```

---

### Step 2: Go to Cloudflare Dashboard

1. **Open your browser and go to:**
   ```
   https://dash.cloudflare.com/
   ```

2. **Sign in** to your Cloudflare account
   - If you don't have an account, sign up (it's free!)

---

### Step 3: Create New Pages Project

1. Click on **"Workers & Pages"** in the left sidebar

2. Click the **"Create application"** button

3. Select **"Pages"** tab

4. Click **"Connect to Git"**

---

### Step 4: Connect Your GitHub Repository

1. Click **"Connect GitHub"** or **"Connect account"**

2. Authorize Cloudflare to access your GitHub

3. Select your repository:
   - **Repository:** `ThoughtFull-World/tf-dreams`
   - **Branch:** `main`

4. Click **"Begin setup"**

---

### Step 5: Configure Build Settings

Fill in these settings:

| Setting | Value |
|---------|-------|
| **Project name** | `thoughtfull-dreams` |
| **Production branch** | `main` |
| **Framework preset** | **Next.js (SSR)** |
| **Build command** | `npm run build` |
| **Build output directory** | `.next` |

**Important:** Make sure you select **Next.js (SSR)**, NOT Next.js (Static)

---

### Step 6: Add Environment Variables

**Before clicking "Save and Deploy"**, scroll down to **Environment variables** section.

Click **"Add variable"** for each of these:

#### Variable 1: NEXT_PUBLIC_SUPABASE_URL
- **Variable name:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** `https://vnoyyctltxouigjyqvav.supabase.co`

#### Variable 2: NEXT_PUBLIC_SUPABASE_ANON_KEY
- **Variable name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZub3l5Y3RsdHhvdWlnanlxdmF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3Njg2NzAsImV4cCI6MjA3NjM0NDY3MH0.BX3aB2FedpSVJy27cBcC8b32WXb-lMGeDC9St8SeP-k`

#### Variable 3: NEXT_PUBLIC_BASE_URL
- **Variable name:** `NEXT_PUBLIC_BASE_URL`
- **Value:** `https://thoughtfull-dreams.pages.dev`
  (We'll update this after deployment if URL is different)

---

### Step 7: Deploy!

1. Click **"Save and Deploy"**

2. ☕ Wait 3-5 minutes while Cloudflare builds your app

3. Watch the build logs - you should see:
   ```
   ✓ Compiled successfully
   ✓ Generating static pages
   Build completed successfully!
   ```

4. Once done, you'll see: **"Success! Your site is live!"**

---

### Step 8: Get Your Deployment URL

After deployment completes, you'll see your URL:

**Format:** `https://thoughtfull-dreams.pages.dev`

Or it might be: `https://[random-name].pages.dev`

**Copy this URL!** You'll need it for the next step.

---

### Step 9: Update Supabase URLs

1. **Go to Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/vnoyyctltxouigjyqvav/auth/url-configuration
   ```

2. **Update Site URL:**
   - Change from: `http://localhost:3000`
   - To: `https://thoughtfull-dreams.pages.dev` (your actual Cloudflare URL)

3. **Add Redirect URLs:**
   Click "Add URL" and add:
   ```
   https://thoughtfull-dreams.pages.dev/**
   https://thoughtfull-dreams.pages.dev/auth/callback
   ```

4. Click **"Save"**

---

### Step 10: Update Environment Variable (If Needed)

If your Cloudflare URL is different from `thoughtfull-dreams.pages.dev`:

1. Go back to Cloudflare Dashboard
2. Click on your project
3. Go to **Settings** → **Environment variables**
4. Edit `NEXT_PUBLIC_BASE_URL` to match your actual URL
5. Click **"Save"**
6. Go to **Deployments** tab
7. Click **"Retry deployment"** on the latest deployment

---

### Step 11: Test Your Deployed App! 🎉

Visit your Cloudflare URL and test:

- ✅ Homepage loads
- ✅ Can record audio
- ✅ Dream generation works
- ✅ Video generates
- ✅ Library page loads
- ✅ Background video plays
- ✅ Random video changes on refresh

---

## 🎯 Quick Checklist

- [ ] Code pushed to GitHub
- [ ] Cloudflare account created
- [ ] GitHub connected to Cloudflare
- [ ] Repository selected
- [ ] Build settings configured (Next.js SSR)
- [ ] Environment variables added (all 3)
- [ ] First deployment completed
- [ ] Deployment URL copied
- [ ] Supabase URLs updated
- [ ] App tested and working

---

## 🔄 Future Deployments

After this initial setup, deployments are **automatic**!

Every time you push to GitHub:
```bash
git push origin main
```

Cloudflare automatically builds and deploys your changes! 🚀

---

## 🆘 Troubleshooting

### Build Fails

**Check:**
- Build command is `npm run build`
- Build output is `.next`
- Framework preset is **Next.js (SSR)**

### App Loads But Features Don't Work

**Check:**
- All 3 environment variables are set
- Supabase URLs are updated
- Environment variables have `NEXT_PUBLIC_` prefix

### "Unauthorized" Errors

**Check:**
- Supabase Site URL matches your Cloudflare URL
- Redirect URLs include your Cloudflare URL
- Anon key is correct

---

## 📱 Bonus: Custom Domain (Optional)

Want to use `dreams.thoughtfull.world`?

1. In Cloudflare Pages, go to **Custom domains**
2. Click **"Set up a custom domain"**
3. Enter: `dreams.thoughtfull.world`
4. Follow DNS instructions
5. Update `NEXT_PUBLIC_BASE_URL`
6. Update Supabase URLs
7. Redeploy

---

## ✅ You're Ready!

**Start with Step 1:** Push your code to GitHub!

Then follow steps 2-11 in order.

**Your dream journal will be live in ~10 minutes!** 🚀

