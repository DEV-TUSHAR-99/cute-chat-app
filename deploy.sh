#!/bin/bash

echo "🚀 Cute Chat App - Free Hosting Deployment Helper"
echo "================================================"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git not found. Install karo: apt-get install git (Linux) ya brew install git (Mac)"
    exit 1
fi

# Generate encryption key if not already set
if [ -z "$CHAT_ENCRYPTION_KEY" ]; then
    echo "⚠️  CHAT_ENCRYPTION_KEY environment variable not set"
    echo "🔑 Generating new encryption key..."
    ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    echo "✅ Generated key: $ENCRYPTION_KEY"
    echo ""
    echo "⚠️  IMPORTANT: Ye key save karo! Production mein yehi key use hoga."
    echo "   Vercel/Render mein env var set karna hoga."
else
    ENCRYPTION_KEY="$CHAT_ENCRYPTION_KEY"
    echo "✅ Using existing CHAT_ENCRYPTION_KEY from environment"
fi

echo ""
echo "📦 Step 1: Git Initialization"
if [ -d .git ]; then
    echo "   Git repository already initialized"
else
    git init
    git add .
    git commit -m "Initial commit - Cute Chat App"
    echo "   ✅ Git initialized"
fi

echo ""
echo "🔧 Step 2: Create .env file for local testing"
cat > .env << EOF
CHAT_ENCRYPTION_KEY=$ENCRYPTION_KEY
PORT=3001
NODE_ENV=production
EOF
echo "   ✅ .env created"

echo ""
echo "🌐 Step 3: Vercel Deployment Instructions"
echo "=========================================="
echo ""
echo "Agar aap Vercel use karna chahte hain (RECOMMENDED):"
echo ""
echo "1. GitHub account banao: https://github.com/signup"
echo "2. Repository banao aur code push karo:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/cute-chat-app.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Vercel pe deploy karo:"
echo "   - https://vercel.com/signup (GitHub se)"
echo "   - 'Import Project' → 'Deploy'"
echo "   - Framework: Other"
echo "   - Environment Variables add karo:"
echo "     * CHAT_ENCRYPTION_KEY = $ENCRYPTION_KEY"
echo "     * NODE_ENV = production"
echo ""
echo "4. Done! free URL mil jayega: https://cute-chat-app.vercel.app"
echo ""
echo "=========================================="
echo ""
echo "🎯 Or use Render: https://render.com"
echo "   - New Web Service"
echo "   - Connect GitHub repo"
echo "   - Build: npm install, Start: npm start"
echo "   - Env vars: CHAT_ENCRYPTION_KEY=$ENCRYPTION_KEY, NODE_ENV=production"
echo "   - Free plan select karo"
echo ""
echo "=========================================="
echo ""
echo "✅ Setup complete!"
echo ""
echo "⚠️  Next steps:"
echo "   1. GitHub repository banayein (agar nahi hai)"
echo "   2. Code upload karein: git push origin main"
echo "   3. Vercel/Render pe deploy karein"
echo "   4. Environment variable set karein: CHAT_ENCRYPTION_KEY=$ENCRYPTION_KEY"
echo ""
echo "🔐 Your encryption key: $ENCRYPTION_KEY"
echo "   (Isko safe rakho - copy karo kisi safe jagah!)"
