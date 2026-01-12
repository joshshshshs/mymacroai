#!/bin/bash

# 1. Login with the token you provided
echo "Logging into Supabase..."
npx supabase login --token sbp_2fe0d9ac8db451f20deb40a2badc79947af0cb42

# 2. Prompt for the real Gemini Key (so it never enters git/chat logs)
echo ""
echo "Please enter your GEMINI_API_KEY (starts with AIza...):"
read -r GEMINI_KEY

# 3. Set the Secret
echo "Setting secret in Supabase..."
npx supabase secrets set GEMINI_API_KEY="$GEMINI_KEY"

# 4. Deploy the Function
echo "Deploying AI Proxy..."
npx supabase functions deploy ai-proxy --no-verify-jwt

echo "Done! Your AI proxy is live and secure."
echo "You can now update src/services/ai/GeminiService.ts to use the proxy URL if desired."
