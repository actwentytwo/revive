#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "[revolution-dev] REVIVE uses the shared local MongoDB instance configured by MONGODB_URI."
echo "[revolution-dev] Start shared Mongo with your local mongo helper, then REVIVE will use its own database from MONGODB_URI."

exec bash "${SCRIPT_DIR}/check-dev-mongo.sh"
