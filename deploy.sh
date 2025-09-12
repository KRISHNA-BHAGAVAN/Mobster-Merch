#!/bin/bash

set -e  # Exit immediately if a command fails
set -o pipefail

echo "🚀 Starting deployment..."

# Navigate to app root
cd ~/app

echo "📦 Installing frontend dependencies & building..."
cd frontend
npm install
npm run build

echo "📦 Installing backend dependencies..."
cd ../backend
npm install

echo "📂 Copying frontend build to nginx directory..."
cd ..
sudo cp -r frontend/dist/* /var/www/og_frontend/

echo "🛠️ Testing nginx config..."
sudo nginx -t

echo "🔄 Restarting nginx..."
sudo systemctl restart nginx

echo "🔄 Restarting PM2 backend process..."
pm2 restart og-backend

echo "✅ Deployment complete!"
