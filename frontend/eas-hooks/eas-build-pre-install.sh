#!/bin/bash
set -e

echo "========================================"
echo "EAS Build Pre-Install Hook"
echo "========================================"

# Remove yarn.lock to force npm usage
if [ -f "yarn.lock" ]; then
    echo "Removing yarn.lock to force npm..."
    rm -f yarn.lock
fi

# Remove any yarn config files
rm -f .yarnrc .yarnrc.yml 2>/dev/null || true

# Ensure package-lock.json exists
if [ ! -f "package-lock.json" ]; then
    echo "Creating package-lock.json with npm..."
    npm install --package-lock-only
fi

echo "Pre-install hook completed successfully!"
echo "========================================"
