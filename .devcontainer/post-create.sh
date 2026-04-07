#!/usr/bin/env bash
set -euo pipefail

echo "[bootstrap] Installing frontend dependencies"
if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

echo "[bootstrap] Frontend environment ready"
