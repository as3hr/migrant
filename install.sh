#!/bin/bash
set -e

REPO="migrant-db/migrant"
VERSION="latest"

echo "Detecting OS and Architecture..."
OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
ARCH="$(uname -m)"

if [ "$OS" = "darwin" ]; then
    if [ "$ARCH" = "arm64" ] || [ "$ARCH" = "aarch64" ]; then
        TARGET="migrant-cli-macos-arm64"
    else
        TARGET="migrant-cli-macos-x64"
    fi
elif [ "$OS" = "linux" ]; then
    if [ "$ARCH" = "arm64" ] || [ "$ARCH" = "aarch64" ]; then
        TARGET="migrant-cli-linux-arm64"
    else
        TARGET="migrant-cli-linux-x64"
    fi
else
    echo "Unsupported OS: $OS"
    exit 1
fi

echo "Downloading $TARGET from $REPO..."

URL="https://github.com/$REPO/releases/latest/download/$TARGET"

curl -fsSL -o migrant "$URL"
chmod +x migrant

echo "Installing to /usr/local/bin (might require sudo password)..."
sudo mv migrant /usr/local/bin/migrant

echo "✅ Installed successfully! Type 'migrant' to start."
