#!/bin/zsh
set -e

echo "===== XCODE CLOUD POST CLONE START ====="

cd /Volumes/workspace/repository

echo "Current directory:"
pwd

echo "Check available tools"
which node || true
which npm || true
which corepack || true

echo "Skip npm install on Xcode Cloud because Homebrew/Node is unavailable"

echo "Verify Package.resolved exists"
ls -la ios/App/App.xcodeproj/project.xcworkspace/xcshareddata/swiftpm/Package.resolved || true

echo "Verify Capacitor SPM package"
ls -la ios/App/CapApp-SPM
cat ios/App/CapApp-SPM/Package.swift

echo "===== XCODE CLOUD POST CLONE END ====="
