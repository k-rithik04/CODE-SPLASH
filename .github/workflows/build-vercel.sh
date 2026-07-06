#!/usr/bin/env bash
set -euo pipefail

echo "========================================="
echo "  CodeSplash - Vercel Build Script"
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

echo "[4/4] Building for Vercel..."
echo "  Supabase URL: ${NEXT_PUBLIC_SUPABASE_URL:0:30}..."
npm run build:vercel

echo ""
echo "Build successful! .next output ready for Vercel."
echo ""
echo "To deploy locally with Vercel CLI:"
echo "  vercel --prod"
