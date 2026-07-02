#!/bin/zsh
set -e

echo "===== XCODE CLOUD POST CLONE START ====="

cd /Volumes/workspace/repository

# Xcode Cloud 環境沒有 Node/npm，但 CapApp-SPM 的 Package.swift 引用
# node_modules 內的本地套件（@capacitor/app、capacitor-native-settings），
# 沒跑 npm ci 的話 xcodebuild 會在解析 SPM 依賴時失敗：
#   "Could not resolve package dependencies: ... node_modules/@capacitor/app
#    doesn't exist in file system"
# 因此先安裝官方 Node 二進位（不依賴 Homebrew），再 npm ci + cap sync。

NODE_VERSION=22.11.0
case "$(uname -m)" in
  arm64) NODE_ARCH=darwin-arm64 ;;
  *) NODE_ARCH=darwin-x64 ;;
esac

curl -fsSL "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-${NODE_ARCH}.tar.gz" -o /tmp/node.tar.gz
mkdir -p "$HOME/node"
tar -xzf /tmp/node.tar.gz -C "$HOME/node" --strip-components 1
export PATH="$HOME/node/bin:$PATH"

node -v
npm -v

npm ci

npx cap sync ios

echo "Verify Package.resolved exists"
ls -la ios/App/App.xcodeproj/project.xcworkspace/xcshareddata/swiftpm/Package.resolved || true

echo "===== XCODE CLOUD POST CLONE END ====="
