#!/bin/bash

echo "🚀 AI Voice Call Analyzer - Setup"
echo "=================================="
echo ""

# Check if .env.local exists
if [ -f .env.local ]; then
    echo "✅ .env.local file already exists"
else
    echo "📝 Creating .env.local file..."
    cp .env.local.example .env.local
    echo "✅ Created .env.local file"
fi

echo ""
echo "📋 Next steps:"
echo "1. Get your free Groq API key from: https://console.groq.com/keys"
echo "2. Edit .env.local and add your API key"
echo "3. Run 'npm run dev' to start the application"
echo ""
echo "Need help? Check the README.md file for detailed instructions."
