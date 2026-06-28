#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PORT_ONLY="false"

if [[ "${1:-}" == "--port-only" ]]; then
  PORT_ONLY="true"
fi

if [[ -z "${MONGODB_URI:-}" ]]; then
  MONGODB_URI="$(node "${SCRIPT_DIR}/lib/resolve-env.mjs" --get "apps/revolution-api" MONGODB_URI)"
fi
if [[ -z "${MONGODB_URI:-}" ]]; then
  MONGODB_URI="$(node "${SCRIPT_DIR}/lib/resolve-env.mjs" --get-from-file "apps/revolution-api" ".env.example" MONGODB_URI)"
fi
if [[ -z "${MONGODB_URI:-}" ]]; then
  echo "[revolution-dev] MONGODB_URI is not set in shell env, apps/revolution-api/.env(.local), or apps/revolution-api/.env.example."
  exit 1
fi
URI="${MONGODB_URI}"
read -r URI_HOST URI_PORT < <(MONGODB_URI="${URI}" node --input-type=module - <<'EOF'
const uri = process.env.MONGODB_URI;
const parsed = new URL(uri);
console.log(`${parsed.hostname || "127.0.0.1"} ${parsed.port || "27017"}`);
EOF
)
HOST="${DEV_MONGO_HOST:-$URI_HOST}"
PORT="${DEV_MONGO_PORT:-$URI_PORT}"

echo "[revolution-dev] checking tcp ${HOST}:${PORT}..."
if ! nc -z "${HOST}" "${PORT}" >/dev/null 2>&1; then
  echo "[revolution-dev] FAIL: cannot connect to ${HOST}:${PORT}"
  exit 1
fi

if [[ "${PORT_ONLY}" == "true" ]]; then
  echo "[revolution-dev] TCP connectivity to ${HOST}:${PORT} is OK."
  exit 0
fi

echo "[revolution-dev] checking MongoDB driver auth + ping..."
(
  cd "$REPO_ROOT"
  MONGODB_URI="${URI}" pnpm --filter @revolution/api exec node --input-type=module - <<'EOF'
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10_000 });
try {
  await client.connect();
  const result = await client.db().command({ ping: 1 });
  console.log(JSON.stringify({ ok: result.ok, db: client.db().databaseName }));
} catch (error) {
  console.error(`[revolution-dev] FAIL: MongoDB driver ping failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await client.close();
}
EOF
)

echo "[revolution-dev] Mongo connectivity OK."
