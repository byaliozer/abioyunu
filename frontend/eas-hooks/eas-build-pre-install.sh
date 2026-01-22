#!/bin/bash
# EAS Build pre-install hook
# This removes the CI environment variable to prevent yarn from using --frozen-lockfile

echo "=== EAS Pre-Install Hook ==="
echo "Disabling frozen-lockfile mode..."

# Unset CI to prevent frozen-lockfile
unset CI

# Also create .yarnrc to disable frozen-lockfile
echo "--install.frozen-lockfile false" > .yarnrc

echo "Pre-install hook completed"
