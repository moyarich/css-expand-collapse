#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE="$ROOT/README.md"
PACKAGE_DIRECTORY=""
CLEAN=false

usage() {
  cat <<'EOF'
Usage:
  scripts/sync-package-readme.sh --package-directory=<path> [--clean]

Options:
  --package-directory=<path>  Relative path to the package directory
                              Example: packages/my-package
  --clean                     Remove the generated package README
  -h, --help                  Show this help
EOF
}

case "$#" in
  0)
    usage >&2
    exit 1
    ;;
esac

for arg in "$@"; do
  case "$arg" in
    --package-directory=*)
      PACKAGE_DIRECTORY="${arg#*=}"
      ;;
    --clean)
      CLEAN=true
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $arg" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if [[ -z "$PACKAGE_DIRECTORY" ]]; then
  echo "Missing required option: --package-directory=<path>" >&2
  usage >&2
  exit 1
fi

case "$PACKAGE_DIRECTORY" in
  packages/*)
    ;;
  *)
    echo "Package directory must be under packages/: $PACKAGE_DIRECTORY" >&2
    exit 1
    ;;
esac

PACKAGE_PATH="$ROOT/$PACKAGE_DIRECTORY"
TARGET="$PACKAGE_PATH/README.md"

if [[ ! -d "$PACKAGE_PATH" ]]; then
  echo "Package directory not found: $PACKAGE_DIRECTORY" >&2
  exit 1
fi

if [[ "$CLEAN" == true ]]; then
  rm -f "$TARGET"
  echo "Removed generated $PACKAGE_DIRECTORY/README.md"
  exit 0
fi

if [[ ! -f "$SOURCE" ]]; then
  echo "Source README not found: $SOURCE" >&2
  exit 1
fi

cp "$SOURCE" "$TARGET"
echo "Synced README.md -> $PACKAGE_DIRECTORY/README.md"
