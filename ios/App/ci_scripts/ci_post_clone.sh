#!/bin/zsh
set -e

echo "===== XCODE CLOUD POST CLONE START ====="

cd /Volumes/workspace/repository

echo "Current directory:"
pwd

echo "PATH:"
echo $PATH

# Xcode Cloud Node locations
export PATH="/opt/homebrew/bin:$PATH"
export PATH="/usr/local/bin:$PATH"

# Try common node locations
if [ -x "/usr/local/bin/node" ]; then
  export PATH="/usr/local/bin:$PATH"
fi

if [ -x "/opt/homebrew/bin/node" ]; then
  export PATH="/opt/homebrew/bin:$PATH"
fi

which node || true
which npm || true

node -v || true
npm -v || true

echo "Install dependencies"
npm ci

echo "Sync Capacitor"
npx cap sync ios

echo "===== XCODE CLOUD POST CLONE END ====="
