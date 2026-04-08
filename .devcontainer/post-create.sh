#!/usr/bin/env bash
set -euo pipefail

echo "[bootstrap] Installing frontend dependencies"
if [ -f package-lock.json ]; then
  if ! npm ci; then
    echo "[bootstrap] npm ci failed (likely lockfile drift). Falling back to npm install to recover."
    npm install
  fi
else
  npm install
fi

echo "[bootstrap] Frontend environment ready"
