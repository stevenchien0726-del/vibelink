#!/bin/sh
set -e

echo "Install Node dependencies"
npm ci

echo "Sync Capacitor iOS"
npx cap sync ios

echo "Done post-clone setup"
