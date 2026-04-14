#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET_ENV="$(printf '%s' "${1:-dev}" | tr '[:upper:]' '[:lower:]')"
ENV_FILE="${CREDENTIALS_ENV_FILE:-"$ROOT_DIR/scripts/credentials.${TARGET_ENV}.env"}"

default_auth_credentials="admin:admin@redecolmeia.dev:admin-pass,contributor:contributor@redecolmeia.dev:contributor-pass,partner:partner@redecolmeia.dev:partner-pass"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "credentials env file not found: $ENV_FILE" >&2
  echo "create it from template, for example:" >&2
  echo "cp \"$ROOT_DIR/scripts/credentials.${TARGET_ENV}.env.example\" \"$ENV_FILE\"" >&2
  exit 1
fi

set -a
source "$ENV_FILE"
set +a

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "missing DATABASE_URL in: $ENV_FILE" >&2
  exit 1
fi

database_token="${DATABASE_AUTH_TOKEN:-${TOKEN:-}}"
if [[ -z "$database_token" ]]; then
  echo "missing DATABASE_AUTH_TOKEN (or TOKEN) in: $ENV_FILE" >&2
  exit 1
fi

export DATABASE_AUTH_TOKEN="$database_token"
export AUTH_CREDENTIALS="${AUTH_CREDENTIALS:-$default_auth_credentials}"
export APP_ENV="${APP_ENV:-$TARGET_ENV}"

echo "starting API with environment: $TARGET_ENV"
echo "using DATABASE_URL and DATABASE_AUTH_TOKEN from: $ENV_FILE"
echo "using AUTH_CREDENTIALS from script default or shell override"
if [[ "$TARGET_ENV" != "dev" ]]; then
  echo "using reset delivery webhook: ${RESET_DELIVERY_WEBHOOK_URL:-<not-configured>}"
fi

cd "$ROOT_DIR/apps/api"
exec go run ./cmd/server
