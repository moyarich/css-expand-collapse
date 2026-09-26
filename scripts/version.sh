#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

case "$#" in
  1) ;;
  *)
    echo "Usage: npm run release -- <package>=<version|major|minor|patch|premajor|preminor|prepatch|prerelease>" >&2
    exit 1
    ;;
esac

case "$1" in
  *=*)
    PACKAGE_SELECTOR="${1%%=*}"
    VERSION_SPEC="${1#*=}"
    ;;
  *)
    echo "Expected package=version, for example css-expand-collapse=patch." >&2
    exit 1
    ;;
esac

case "$PACKAGE_SELECTOR" in
  ""|*[!A-Za-z0-9._-]*)
    echo "Package selector must be a package directory name under packages/, such as css-expand-collapse." >&2
    exit 1
    ;;
esac

case "$VERSION_SPEC" in
  major|minor|patch|premajor|preminor|prepatch|prerelease|[0-9]*.[0-9]*.[0-9]*)
    ;;
  *)
    echo "Invalid version: $VERSION_SPEC" >&2
    exit 1
    ;;
esac

PACKAGE_DIRECTORY="packages/$PACKAGE_SELECTOR"
PACKAGE_PATH="$ROOT/$PACKAGE_DIRECTORY"
PACKAGE_JSON="$PACKAGE_PATH/package.json"

case "$(test -f "$PACKAGE_JSON" && printf yes || printf no)" in
  yes) ;;
  no)
    echo "Package not found: $PACKAGE_DIRECTORY" >&2
    exit 1
    ;;
esac

case "$(git -C "$ROOT" status --porcelain)" in
  "") ;;
  *)
    echo "Working tree must be clean before creating a package release." >&2
    exit 1
    ;;
esac

PACKAGE_NAME="$(node -p "require(process.argv[1]).name || ''" "$PACKAGE_JSON")"

case "$PACKAGE_NAME" in
  "")
    echo "$PACKAGE_DIRECTORY/package.json is missing a package name." >&2
    exit 1
    ;;
esac

npm version "$VERSION_SPEC" \
  --workspace "$PACKAGE_NAME" \
  --git-tag-version=false

VERSION="$(node -p "require(process.argv[1]).version" "$PACKAGE_JSON")"
TAG_NAME="$PACKAGE_SELECTOR@$VERSION"

git -C "$ROOT" add "$PACKAGE_DIRECTORY/package.json" package-lock.json
git -C "$ROOT" commit -m "release: $TAG_NAME"
git -C "$ROOT" tag "$TAG_NAME"

printf '\nCreated release %s\n' "$TAG_NAME"
printf 'Push the release commit and tag with:\n'
printf '  git push --follow-tags\n'
