#!/bin/bash
# Database setup script for Supabase

echo "Setting up AT&T CRM Database..."

# This will be run after you create your Supabase project
# You'll need to paste your DATABASE_URL from Supabase

cat > .env.local << 'EOF'
# Copy these from Supabase → Project Settings → Database → Connection String
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres"

# Twilio (you'll add these later)
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_PHONE_NUMBER=""

# NVIDIA AI
NVIDIA_API_KEY="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"

# Vercel URL (update after deploy)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
EOF

echo "✅ Created .env.local template"
echo ""
echo "Next steps:"
echo "1. Create Supabase project at https://supabase.com"
echo "2. Get DATABASE_URL from Supabase dashboard"
echo "3. Replace DATABASE_URL in .env.local"
echo "4. Run: npx prisma db push"
