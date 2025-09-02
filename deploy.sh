#!/bin/bash

echo "🚀 Starting production deployment..."

# Install dependencies
echo "📦 Installing dependencies..."
npm run install:all

# Build frontend
echo "🏗️ Building frontend..."
npm run build

# Copy production environment
if [ ! -f .env ]; then
    echo "📋 Copying production environment..."
    cp .env.production .env
fi

# Start production server
echo "🌟 Starting production server..."
npm start