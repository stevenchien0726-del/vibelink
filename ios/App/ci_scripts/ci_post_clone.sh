#!/bin/zsh
set -e

echo "===== XCODE CLOUD POST CLONE START ====="

cd /Volumes/workspace/repository

echo "Install Node.js by Homebrew"
brew update
brew install node

echo "Node version:"
node -v

echo "NPM version:"
npm -v

echo "Install Node dependencies"
npm ci

echo "Sync Capacitor iOS"
npx cap sync ios

echo "===== XCODE CLOUD POST CLONE END ====="
