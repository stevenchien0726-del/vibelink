#!/bin/zsh
set -e

echo "===== XCODE CLOUD POST CLONE START ====="

cd /Volumes/workspace/repository

echo "Current directory:"
pwd

echo "Node version:"
node -v || true

echo "NPM version:"
npm -v || true

echo "Install Node dependencies"
npm ci

echo "Sync Capacitor iOS"
npx cap sync ios

echo "===== XCODE CLOUD POST CLONE END ====="
