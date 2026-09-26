#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

case "$#" in
  1) MODE="$1" ;;
  *)
    echo "Use npm run release:check or npm run publish:lib." >&2
    exit 1
    ;;
esac

case "$MODE" in
  --dry-run) PUBLISH=false ;;
  --publish) PUBLISH=true ;;
  *)
    echo "Use npm run release:check or npm run publish:lib." >&2
    exit 1
    ;;
esac

case -f "$ROOT/.env" in
  1)
    set -a
    # shellcheck disable=SC1091
    source "$ROOT/.env"
    set +a
    ;;
esac

NPM_TAG="${NPM_TAG:-latest}"
NPM_ACCESS="${NPM_ACCESS:-public}"
NPM_REGISTRY="${NPM_REGISTRY:-https://registry.npmjs.org}"

case "$NPM_ACCESS" in
  public|restricted) ;;
  *)
    echo "NPM_ACCESS must be public or restricted." >&2
    exit 1
    ;;
esac

case "$NPM_TAG" in
  ""|[!A-Za-z]*|*[!A-Za-z0-9._-]*)
    echo "NPM_TAG must be a valid distribution tag, such as latest or next." >&2
    exit 1
    ;;
esac

case "$NPM_REGISTRY" in
  https://npm.pkg.github.com|https://npm.pkg.github.com/)
    REGISTRY_HOST="npm.pkg.github.com"
    REGISTRY_KIND="github"
    ;;
  https://registry.npmjs.org|https://registry.npmjs.org/)
    REGISTRY_HOST="registry.npmjs.org"
    REGISTRY_KIND="npm"
    ;;
  *)
    echo "Unsupported registry: $NPM_REGISTRY. Use GitHub Packages or npmjs.org." >&2
    exit 1
    ;;
esac

package_name() {
  node -p "require(process.argv[1]).name || ''" "$1/package.json"
}

package_version() {
  node -p "require(process.argv[1]).version || ''" "$1/package.json"
}

validate_package() {
  local package_directory="$1"
  local package_path="$ROOT/$package_directory"

  case -f "$package_path/package.json" in
    1) ;;
    *)
      echo "Package not found: $package_directory" >&2
      exit 1
      ;;
  esac

  local name
  local version
  name="$(package_name "$package_path")"
  version="$(package_version "$package_path")"

  case "$name" in
    "")
      echo "$package_directory/package.json is missing a package name." >&2
      exit 1
      ;;
  esac

  printf '\nValidating %s@%s (%s)\n' "$name" "$version" "$package_directory"

  npm run typecheck --workspace "$name" --if-present
  npm run test --workspace "$name" --if-present
  npm run build --workspace "$name" --if-present
  npm pack --workspace "$name" --dry-run
}

case "$PUBLISH" in
  false)
    PACKAGE_COUNT=0

    case "${PACKAGE_DIRECTORY:-}" in
      "")
        for package_json in "$ROOT"/packages/*/package.json; do
          case -f "$package_json" in
            1)
              package_directory="${package_json#"$ROOT/"}"
              package_directory="${package_directory%/package.json}"

              private="$(node -p "String(Boolean(require(process.argv[1]).private))" "$package_json")"
              case "$private" in
                false)
                  validate_package "$package_directory"
                  PACKAGE_COUNT=$((PACKAGE_COUNT + 1))
                  ;;
              esac
              ;;
          esac
        done
        ;;
      *)
        validate_package "$PACKAGE_DIRECTORY"
        PACKAGE_COUNT=1
        ;;
    esac

    case "$PACKAGE_COUNT" in
      0)
        echo "No publishable packages were found under packages/*." >&2
        exit 1
        ;;
    esac

    printf '\nRelease checks passed for %s package(s). Nothing was published.\n' "$PACKAGE_COUNT"
    exit 0
    ;;
esac

case "${PACKAGE_DIRECTORY:-}" in
  "")
    echo "PACKAGE_DIRECTORY is required for publishing, for example packages/css-expand-collapse." >&2
    exit 1
    ;;
esac

validate_package "$PACKAGE_DIRECTORY"

PACKAGE_PATH="$ROOT/$PACKAGE_DIRECTORY"
PACKAGE_NAME="$(package_name "$PACKAGE_PATH")"
PACKAGE_VERSION="$(package_version "$PACKAGE_PATH")"

case "$REGISTRY_KIND" in
  github)
    AUTH_TOKEN="${_GITHUB_TOKEN:-${NODE_AUTH_TOKEN:-}}"
    TOKEN_ERROR="Set _GITHUB_TOKEN before publishing to GitHub Packages."
    ;;
  npm)
    AUTH_TOKEN="${_NPM_TOKEN:-${NODE_AUTH_TOKEN:-}}"
    TOKEN_ERROR="Set _NPM_TOKEN before staging a release on npmjs.org."
    ;;
esac

case "$AUTH_TOKEN" in
  "")
    echo "$TOKEN_ERROR" >&2
    exit 1
    ;;
esac

CONFIG_DIR="$(mktemp -d)"
CONFIG_FILE="$CONFIG_DIR/npmrc"

cleanup() {
  rm -rf "$CONFIG_DIR"
}
trap cleanup EXIT

cat > "$CONFIG_FILE" <<EOF
registry=$NPM_REGISTRY
@moyarich:registry=$NPM_REGISTRY
//$REGISTRY_HOST/:_authToken=\${NODE_AUTH_TOKEN}
EOF

export NODE_AUTH_TOKEN="$AUTH_TOKEN"
export npm_config_userconfig="$CONFIG_FILE"

case "$REGISTRY_KIND" in
  github)
    npm publish \
      --workspace "$PACKAGE_NAME" \
      --access "$NPM_ACCESS" \
      --tag "$NPM_TAG"
    ;;
  npm)
    (
      cd "$PACKAGE_PATH"
      npm stage publish --access "$NPM_ACCESS" --tag "$NPM_TAG"
    )
    printf 'Staged %s@%s on npmjs.org. Approve the staged release with 2FA before it becomes public.\n' \
      "$PACKAGE_NAME" "$PACKAGE_VERSION"
    ;;
esac
