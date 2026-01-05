#!/bin/bash

# CentraPro Outlook OAuth2 - Quick Start Script

echo "🚀 Starting CentraPro with Outlook OAuth2 Integration..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js found: $(node -v)"
echo ""

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd server
npm install axios --save 2>/dev/null
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << 'EOF'
# Outlook OAuth2 Configuration
OUTLOOK_CLIENT_ID=your-client-id-here
OUTLOOK_CLIENT_SECRET=your-client-secret-here
OUTLOOK_REDIRECT_URI=http://localhost:4000/api/auth/outlook/callback

# Other configuration
JWT_SECRET=dev_secret_please_change
PORT=4000
EOF
    echo "⚠️  .env file created. Please update with your Azure AD credentials."
fi

cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd client
npm install
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update server/.env with your Azure AD credentials"
echo "2. Run: npm start (in server directory)"
echo "3. Run: npm run dev (in client directory)"
echo "4. Navigate to: http://localhost:5173"
echo "5. Go to Email Management → Authorize Outlook"
echo ""
echo "📚 For detailed setup: See OUTLOOK_OAUTH2_SETUP.md"
