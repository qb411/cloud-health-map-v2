#!/bin/bash

# Deploy the database cleanup edge function to Supabase

echo "🚀 Deploying database cleanup edge function..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Check if logged in
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase. Please run:"
    echo "   supabase login"
    exit 1
fi

# Deploy the function
echo "📦 Deploying function..."
supabase functions deploy database-cleanup

if [ $? -eq 0 ]; then
    echo "✅ Database cleanup function deployed successfully!"
    echo ""
    echo "🧪 Test the function:"
    echo "   supabase functions invoke database-cleanup --method POST"
    echo ""
    echo "🔗 Function URL:"
    echo "   https://your-project.supabase.co/functions/v1/database-cleanup"
    echo ""
    echo "📝 The function will now run automatically when your app loads (once per day)"
else
    echo "❌ Deployment failed"
    exit 1
fi