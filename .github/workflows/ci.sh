#!/usr/bin/env bash
set -euo pipefail

echo "=== CodeSplash CI Script ==="

echo "Checking Node.js version..."
node --version
npm --version

echo "Installing dependencies..."
npm ci

echo "Running lint..."
npm run lint

echo "Running build..."
npm run build

echo "Running tests..."
if [ -f tests/run-all.js ]; then
  node tests/run-all.js
else
  echo "No test runner found, skipping tests."
fi

echo "=== CI Script Complete ==="
