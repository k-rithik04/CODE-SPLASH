#!/usr/bin/env bash
set -euo pipefail

echo "========================================="
echo "  CodeSplash - GitHub Pages Build Script"
echo "========================================="

# Validate required env vars
required_vars=("NEXT_PUBLIC_SUPABASE_URL" "NEXT_PUBLIC_SUPABASE_ANON_KEY")
for var in "${required_vars[@]}"; do
  if [ -z "${!var:-}" ]; then
    echo "ERROR: Missing required env var: $var"
    exit 1
  fi
done

echo "[1/4] Checking Node.js..."
node --version || { echo "ERROR: Node.js not found"; exit 1; }
npm --version || { echo "ERROR: npm not found"; exit 1; }

echo "[2/4] Installing dependencies..."
npm ci

echo "[3/4] Linting..."
npm run lint

echo "[4/4] Building static export for GitHub Pages..."
echo "  Supabase URL: ${NEXT_PUBLIC_SUPABASE_URL:0:30}..."
npm run build:ghpages

if [ -d "./out" ]; then
  FILE_COUNT=$(find ./out -type f | wc -l)
  echo ""
  echo "Build successful! Output in ./out ($FILE_COUNT files)"
  echo ""
  echo "To test locally:"
  echo "  npx serve out"
  echo ""
  echo "To deploy manually:"
  echo "  npx gh-pages -d out"
else
  echo "ERROR: ./out directory not found after build"
  exit 1
fi
