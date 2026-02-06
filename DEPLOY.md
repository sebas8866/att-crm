# 🚀 AT&T CRM - Quick Deploy Guide

## Step 1: Create Supabase Database (2 minutes)

1. Go to https://supabase.com
2. Click "New Project"
3. Sign in with Google
4. Create organization (call it "att-crm")
5. Create project:
   - Name: `att-crm`
   - Database Password: (save this!)
   - Region: US East (N. Virginia)
6. Wait ~2 minutes for database to be ready
7. Go to Project Settings → Database
8. Copy the "Connection String" (URI format)
9. **Send me that connection string**

## Step 2: Deploy to Vercel (3 minutes)

1. Go to https://vercel.com
2. Sign in with GitHub (or create account)
3. Click "Add New Project"
4. Import from GitHub (you'll need to push this code first)

**OR use Vercel CLI:**
```bash
# I can run this for you once Supabase is ready
cd /Users/henryads/.openclaw/workspace/att-crm
npx vercel --prod
```

## Step 3: Twilio Setup (5 minutes)

1. Go to https://twilio.com/try-twilio
2. Sign up (free trial gives you $15 credit)
3. Get a phone number:
   - Phone Numbers → Manage → Buy a Number
   - Search for local number
   - Buy it (~$1/month)
4. Get your credentials:
   - Console Dashboard → Account SID
   - Console Dashboard → Auth Token
   - Your phone number

## Environment Variables

Once you have Supabase + Twilio, add these to Vercel:

```
DATABASE_URL=postgresql://postgres:... (from Supabase)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
NVIDIA_API_KEY=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
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## Webhook Setup

After deploy, set Twilio webhook:
1. Twilio Console → Phone Numbers → Active Numbers
2. Click your number
3. Messaging → Webhook
4. Set to: `https://your-app.vercel.app/api/twilio/webhook`
5. HTTP POST

---

**Ready to start? Create the Supabase project and send me the DATABASE_URL!**
