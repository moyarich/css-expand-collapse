#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE="$ROOT/README.md"
TARGET="$ROOT/packages/css-expand-collapse/README.md"

case "$#" in
  0)
    cp "$SOURCE" "$TARGET"
    echo "Synced README.md -> packages/css-expand-collapse/README.md"
    ;;
  1)
    case "$1" in
      --clean)
        rm -f "$TARGET"
        echo "Removed generated packages/css-expand-collapse/README.md"
        ;;
      *)
        echo "Usage: scripts/sync-package-readme.sh [--clean]" >&2
        exit 1
        ;;
    esac
    ;;
  *)
    echo "Usage: scripts/sync-package-readme.sh [--clean]" >&2
    exit 1
    ;;
esac
