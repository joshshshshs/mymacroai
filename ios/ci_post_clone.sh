#!/bin/sh

# Fail on any error
set -e

# Log commands
set -x

# 1. Install Node.js (Homebrew is available in Xcode Cloud)
echo "Installing Node.js..."
brew install node
node -v
npm -v

# 2. Install Project Dependencies
echo "Installing npm dependencies..."
npm ci --legacy-peer-deps

# 3. Install CocoaPods Dependencies
echo "Installing CocoaPods..."
cd ios
pod install
cd ..

echo "Setup complete!"
