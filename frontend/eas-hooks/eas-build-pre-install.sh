#!/bin/bash
set -e

echo "========================================"
echo "EAS Build Pre-Install Hook"
echo "========================================"
echo "Current directory: $(pwd)"
echo "Node version: $(node -v)"
echo "Yarn version: $(yarn -v)"

# Remove old yarn.lock and regenerate
echo "Regenerating yarn.lock..."
rm -f yarn.lock
yarn install --no-frozen-lockfile

echo "yarn.lock regenerated successfully!"
echo "========================================"
