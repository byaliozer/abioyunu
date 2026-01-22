#!/bin/bash
# EAS Build Pre-Install Hook
# This regenerates yarn.lock before the frozen-lockfile install

echo "=== PRE-INSTALL HOOK STARTED ==="
echo "Working directory: $(pwd)"
echo "Removing existing yarn.lock..."
rm -f yarn.lock

echo "Generating fresh yarn.lock..."
yarn install --no-frozen-lockfile

echo "=== PRE-INSTALL HOOK COMPLETED ==="
