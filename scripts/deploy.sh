#!/bin/bash

# Set higher memory limit
export NODE_OPTIONS="--max-old-space-size=8192"

echo "🚀 Starting deployment with increased memory allocation..."
echo "Memory allocated: $NODE_OPTIONS"

# Build the Next.js app with OpenNext
echo -e "\n📦 Building Next.js app with OpenNext..."
npx @opennextjs/cloudflare build

# Check if build was successful
if [ $? -eq 0 ]; then
  echo -e "\n🚀 Deploying to Cloudflare..."
  npx @opennextjs/cloudflare deploy
  
  if [ $? -eq 0 ]; then
    echo -e "\n✅ Deployment completed successfully!"
  else
    echo -e "\n❌ Deployment to Cloudflare failed."
    exit 1
  fi
else
  echo -e "\n❌ Build failed. Please check the errors above."
  exit 1
fi