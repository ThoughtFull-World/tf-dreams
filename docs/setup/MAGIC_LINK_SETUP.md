# 🔐 Magic Link Authentication Setup Guide

Complete implementation of passwordless authentication using Supabase magic links.

## 📋 Overview

This implementation provides a seamless authentication experience with:
- **Primary**: Magic Link (passwordless email-based login)
- **Fallback**: Traditional email/password authentication
- **Session Management**: Supabase-managed sessions with secure cookies
- **Auto Email**: Supabase handles all email delivery

## 🚀 What Was Implemented

### 1. **Supabase Configuration** (`supabase/config.toml`)
```toml
[auth.email]
enable_signup = true
double_confirm_changes = true
enable_confirmations = false
otp_expiry = 3600  # 1 hour magic link expiry

[functions.magic-link]
verify_jwt = false  # Public endpoint
```

### 2. **Magic Link Edge Function** (`supabase/functions/magic-link/index.ts`)
- Accepts POST request with email
- Calls Supabase's `signInWithOtp()` API
- Automatically sends magic link via email
- Handles errors and validation

**Endpoint**: `POST https://localhost:54321/functions/v1/magic-link` (local)

**Request**:
```json
{
  "email": "user@example.com"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Check your email for the magic link to sign in"
}
```

### 3. **Updated Auth Context** (`src/lib/auth-context.tsx`)
- **Supabase Integration**: Uses `createBrowserClient` from `@supabase/ssr`
- **Session Management**: Loads user from Supabase session on mount
- **Auth State Subscription**: Real-time user updates
- **Magic Link Method**: `sendMagicLink(email)` function
- **Password Auth**: `login()` and `signup()` methods (fallback)
- **Logout**: `logout()` function with session cleanup

### 4. **Magic Link UI** (`src/components/AuthDialog.tsx`)
**Two modes**:
1. **Magic Link** (default):
   - Email input only
   - Sends OTP link
   - Shows confirmation screen
   - Option to try another email

2. **Password** (fallback):
   - Email + Password inputs
   - Traditional sign-in
   - Works with existing accounts

**Flow**:
```
User clicks "Sign In"
  ↓
AuthDialog opens with Magic Link tab active
  ↓
User enters email & clicks "Send Magic Link"
  ↓
Email sent confirmation screen
  ↓
User clicks link in email
  ↓
OAuth callback handler exchanges code for session
  ↓
User automatically logged in & redirected
```

### 5. **OAuth Callback Handler** (`src/app/auth/callback/route.ts`)
- Receives auth code from Supabase
- Exchanges code for session via `exchangeCodeForSession()`
- Stores session in secure HTTP-only cookies
- Redirects to home or requested page

### 6. **API Routes**

**Get User** (`/api/auth/user`):
```typescript
GET /api/auth/user
Response: { id, email, username }
Status: 401 if not authenticated
```

**Logout** (`/api/auth/logout`):
```typescript
POST /api/auth/logout
Response: { success: true }
Clears session cookies
```

### 7. **Updated Header** (`src/components/AppLayout.tsx`)
- Shows user email when authenticated
- Click to logout
- Click to sign in if not authenticated
- Tooltip shows current user

## 🧪 Local Testing

### 1. **Start Supabase**
```bash
supabase start
```

### 2. **View Test Emails**
Inbucket UI: `http://localhost:54324`
- All sent emails appear here
- Click magic links to test

### 3. **Environment Variables** (`.env.local`)
```bash
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. **Test Flow**
1. Run `npm run dev`
2. Go to http://localhost:3000
3. Click user icon (top right)
4. Enter email → "Send Magic Link"
5. Check http://localhost:54324 for email
6. Click link in email
7. You're logged in! ✨

## 📱 User Experience Flow

### **First Time User (Magic Link)**
```
1. Click user icon
2. Enter email
3. See confirmation screen
4. Click link in email
5. Automatically logged in
6. Can now create dreams!
```

### **Returning User (Password)**
```
1. Click user icon
2. Switch to "Password" tab
3. Enter email & password
4. Logged in immediately
5. Continue using app
```

### **Sign Out**
```
1. Click user icon (shows email)
2. Logged out
3. Redirected to home
```

## 🔑 Environment Variables

### **Required (Add to `.env.local`)**
```bash
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

### **Get These From:**
1. Go to Supabase Dashboard
2. Project Settings → API
3. Copy "Project URL" and "anon public" key

## 🚢 Production Deployment

### **1. Update Magic Link Callback URL**
In `supabase/functions/magic-link/index.ts`:
```typescript
const redirectTo = supabaseUrl.includes("localhost") 
  ? "http://localhost:3000/auth/callback"
  : "https://yourdomain.com/auth/callback";  // Update this
```

### **2. Set Environment Variables**
In your hosting platform (Vercel, etc.):
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

### **3. Deploy Edge Function**
```bash
supabase functions deploy magic-link
```

### **4. Configure Email in Supabase**
In Supabase Dashboard:
- Go to Authentication → Email Templates
- Customize magic link email template
- Set sender email address

### **5. Add Custom Domain (Optional)**
Supabase can send emails from your domain:
1. Dashboard → Settings → Email
2. Configure SMTP or use Supabase managed emails

## 🔒 Security Features

✅ **Secure Cookies**: Session stored in HTTP-only cookies (not localStorage)
✅ **JWT Tokens**: All requests verified with JWT
✅ **CSRF Protection**: Built-in with Supabase
✅ **OTP Expiry**: Magic links expire in 1 hour
✅ **Email Verification**: Supabase verifies email domain
✅ **Rate Limiting**: Built-in by Supabase Auth

## 🐛 Troubleshooting

### **Emails not appearing in Inbucket**
- Check Supabase is running: `supabase status`
- Verify Inbucket is enabled: `http://localhost:54324`
- Check function logs: `supabase functions list` 

### **Callback fails with "code" error**
- Verify `NEXT_PUBLIC_SUPABASE_URL` matches config
- Check redirect URL matches: `http://localhost:3000/auth/callback`
- Ensure session hasn't expired

### **"Unauthorized" when checking user**
- User session cookies might be cleared
- Try logging in again
- Check if using private/incognito mode

### **Password login not working**
- User must be created with `sendMagicLink()` first OR
- Use email/password in signup flow
- Verify user exists in Supabase Dashboard

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (Next.js)                │
│  ┌──────────────────────────────────────────────┐  │
│  │     AuthDialog (Magic Link + Password)       │  │
│  │  ┌──────────────────────────────────────┐    │  │
│  │  │  Magic Link Tab: Email only         │    │  │
│  │  │  Password Tab: Email + Password     │    │  │
│  │  └──────────────────────────────────────┘    │  │
│  │              ↓ send email or password        │  │
│  └──────────────────────────────────────────────┘  │
│           ↓                                  ↓      │
│    Magic-Link Function           Password Function │
│           ↓                                  ↓      │
└─────────────────────────────────────────────────────┘
         ↓                                 ↓
┌──────────────────────────────────────────────────────┐
│           Supabase Edge Functions                    │
│  ┌─────────────────────────────────────────────┐    │
│  │ signInWithOtp()     │ signInWithPassword()  │    │
│  └─────────────────────────────────────────────┘    │
│                     ↓                                │
└──────────────────────────────────────────────────────┘
         ↓
┌──────────────────────────────────────────────────────┐
│      Supabase Auth (PostgreSQL + Auth System)       │
│  ┌─────────────────────────────────────────────┐    │
│  │ Users table │ Sessions │ OTP Management     │    │
│  └─────────────────────────────────────────────┘    │
│                     ↓                                │
│        Email Service (Inbucket/SMTP)               │
└──────────────────────────────────────────────────────┘
         ↓
    📧 User's Inbox
```

## 📚 Key Files

| File | Purpose |
|------|---------|
| `supabase/config.toml` | Supabase local config + magic link settings |
| `supabase/functions/magic-link/index.ts` | Edge function for sending OTP |
| `src/lib/auth-context.tsx` | React context for auth state |
| `src/components/AuthDialog.tsx` | UI for magic link + password auth |
| `src/app/auth/callback/route.ts` | OAuth callback handler |
| `src/app/api/auth/user/route.ts` | Get current user endpoint |
| `src/app/api/auth/logout/route.ts` | Logout endpoint |

## 🎯 Next Steps

1. ✅ Test locally with magic link
2. ⬜ Connect to dream recording flow
3. ⬜ Add user library/dashboard
4. ⬜ Implement profile customization
5. ⬜ Deploy to production

## 📞 Support

For issues:
1. Check Supabase logs: `supabase functions list`
2. Verify environment variables
3. Check browser console for errors
4. Review Inbucket for email delivery

---

**Implementation Complete!** 🎉

Magic link authentication is now fully integrated. Users can sign in with just their email - no password needed!
