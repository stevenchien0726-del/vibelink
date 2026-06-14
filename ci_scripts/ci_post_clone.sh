#!/bin/zsh
set -e

echo "===== XCODE CLOUD POST CLONE START ====="

node -v || true
npm -v || true

npm ci

npx cap sync ios

echo "===== XCODE CLOUD POST CLONE END ====="
