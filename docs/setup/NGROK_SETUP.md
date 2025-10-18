# 🌐 ngrok Setup Guide for Magic Links

## ✅ ngrok Installed!

ngrok version 3.30.0 is now installed at `~/bin/ngrok`

---

## 🔑 Step 1: Get Your ngrok Auth Token

ngrok requires a free account:

1. **Sign up:** https://dashboard.ngrok.com/signup
2. **Get your authtoken:** https://dashboard.ngrok.com/get-started/your-authtoken
3. **Copy the authtoken** (looks like: `2abc123def456...`)

---

## 🚀 Step 2: Configure ngrok

Run this command with YOUR authtoken:

```bash
~/bin/ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
```

**Example:**
```bash
~/bin/ngrok config add-authtoken 2abc123def456ghi789jkl0mno1pqr2stu3vwx4yz
```

---

## 🎯 Step 3: Start ngrok Tunnel

Once authenticated, start ngrok:

```bash
~/bin/ngrok http 3000
```

You'll see output like:
```
ngrok

Session Status                online
Account                       your@email.com
Version                       3.30.0
Region                        United States (us)
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:3000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**Copy the HTTPS URL:** `https://abc123.ngrok-free.app`

---

## 🔧 Step 4: Update Supabase Settings

### **A. Update Site URL in Supabase Dashboard:**

1. Go to: https://supabase.com/dashboard/project/vnoyyctltxouigjyqvav/auth/url-configuration
2. Set **Site URL** to your ngrok URL:
   ```
   https://abc123.ngrok-free.app
   ```

### **B. Add Redirect URLs:**

In the same page, add to **Redirect URLs**:
```
https://abc123.ngrok-free.app/**
https://abc123.ngrok-free.app/auth/callback
http://localhost:3000/**
```

### **C. Save Changes**

---

## 📝 Step 5: Update Your Local Environment

Update `.env.local` with your ngrok URL:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://vnoyyctltxouigjyqvav.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_BASE_URL=https://abc123.ngrok-free.app  # ← Update this
```

**Restart your Next.js dev server:**
```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

---

## 🧪 Step 6: Test Magic Links!

1. **Open your ngrok URL** in a browser:
   ```
   https://abc123.ngrok-free.app
   ```

2. **Click "Sign In" button**

3. **Enter your email** and request magic link

4. **Check your email** for the magic link

5. **Click the link** - it will redirect to your ngrok URL

6. **You're signed in!** ✅

---

## 🎬 Quick Start Commands

```bash
# 1. Authenticate ngrok (one-time setup)
~/bin/ngrok config add-authtoken YOUR_TOKEN_HERE

# 2. Start ngrok tunnel
~/bin/ngrok http 3000

# 3. In another terminal, start Next.js (if not running)
cd /home/ian/tf-dreams-1
npm run dev

# 4. Open the ngrok HTTPS URL in your browser
```

---

## 📋 Troubleshooting

### **"Invalid redirect URL" error:**
- Make sure you added the ngrok URL to Supabase redirect URLs
- Include the wildcard: `https://your-url.ngrok-free.app/**`

### **Magic link doesn't work:**
- Verify the ngrok URL is still active (check terminal)
- ngrok URLs change each restart on free tier
- Update Supabase settings with new URL if restarted

### **"This site can't be reached":**
- Make sure ngrok is running: `ps aux | grep ngrok`
- Make sure Next.js dev server is running on port 3000

### **ngrok shows "Visit Site" button:**
- Free ngrok shows an interstitial page
- Just click "Visit Site" to continue
- This is normal for free tier

---

## 🔄 Important Notes

### **ngrok Free Tier:**
- ✅ HTTPS URL
- ✅ Unlimited tunnels
- ⚠️ URL changes each restart
- ⚠️ Shows interstitial "Visit Site" page

### **After Restarting ngrok:**
1. Get the new ngrok URL
2. Update Supabase redirect URLs
3. Update `.env.local`
4. Restart Next.js server

### **For Permanent Solution:**
- Deploy to production (Vercel, Netlify, etc.)
- Use custom domain
- No ngrok needed!

---

## 💡 Alternative: Keep Using Anonymous Sign-In

Remember, **you don't need magic links for local development!**

Your app already has:
- ✅ Anonymous sign-in (automatic, instant)
- ✅ Email/password (works perfectly on localhost)

ngrok is great for testing, but not required for development! 🚀

---

## 📊 Comparison

| Method | Setup | Ease | Production-Ready |
|--------|-------|------|------------------|
| Anonymous | ✅ Ready | ⭐⭐⭐⭐⭐ | ✅ Yes |
| Email/Password | ✅ Ready | ⭐⭐⭐⭐ | ✅ Yes |
| Magic Link + ngrok | 🔧 Setup | ⭐⭐⭐ | ⚠️ Dev only |
| Magic Link (Production) | 🚀 Deploy | ⭐⭐⭐⭐⭐ | ✅ Yes |

---

## ✅ Next Steps

1. **Get ngrok authtoken** from https://dashboard.ngrok.com/get-started/your-authtoken
2. **Run:** `~/bin/ngrok config add-authtoken YOUR_TOKEN`
3. **Start ngrok:** `~/bin/ngrok http 3000`
4. **Update Supabase** with the ngrok URL
5. **Test magic links!** 🎉

---

**Need help?** Just let me know your ngrok authtoken and I can configure it for you!

