#!/bin/bash

# Production Deployment Checklist Script
# Run this before deploying to verify everything is ready

echo "🚀 Production Deployment Checklist"
echo "=================================="

# Check if required files exist
echo "📁 Checking required files..."

if [ -f "package.json" ]; then
    echo "✅ package.json found"
else
    echo "❌ package.json missing"
    exit 1
fi

if [ -f ".env.production.example" ]; then
    echo "✅ Environment template found"
else
    echo "❌ .env.production.example missing"
    exit 1
fi

if [ -f "DEPLOYMENT.md" ]; then
    echo "✅ Deployment guide found"
else
    echo "❌ DEPLOYMENT.md missing"
    exit 1
fi

# Test build
echo ""
echo "🔨 Testing production build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed - fix errors before deploying"
    exit 1
fi

# Clean up build files
echo ""
echo "🧹 Cleaning up build files..."
rm -rf .next

echo ""
echo "✅ All checks passed! Ready for deployment."
echo ""
echo "Next steps:"
echo "1. Push your code to GitHub"
echo "2. Share the repository URL with your client"
echo "3. Have them create a Vercel account"
echo "4. Import the project from your GitHub repo"
echo "5. Configure environment variables using .env.production.example"
echo "6. Deploy!"
