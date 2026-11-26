#!/bin/sh
# Assemble only public website files for Cloudflare Pages. Run from any directory.
# Usage: sh tools/package-site.sh /absolute/path/to/empty-output-directory
set -eu

if [ "$#" -ne 1 ]; then
  echo "Usage: sh tools/package-site.sh /absolute/path/to/empty-output-directory" >&2
  exit 1
fi

destination=$1
case "$destination" in
  /*) ;;
  *) echo "Output directory must be an absolute path." >&2; exit 1 ;;
esac

project_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)

# Never delete or overwrite an existing release or checkout.
if [ -e "$destination" ]; then
  if [ ! -d "$destination" ] || [ -n "$(ls -A "$destination")" ]; then
    echo "Output directory must be empty: $destination" >&2
    exit 1
  fi
else
  mkdir -p "$destination"
fi

cp "$project_root/index-v2.html" "$destination/index.html"
for directory in assets functions privacy-policy work-with-me 404_not_found author; do
  cp -R "$project_root/$directory" "$destination/"
done
for file in _routes.json robots.txt sitemap.xml sitemap_index.xml tib-admin-avatar.png; do
  cp "$project_root/$file" "$destination/"
done

# Explicitly include published posts; do not copy templates, research or drafts.
mkdir -p "$destination/blog/annual-strength-training-calendar"
cp "$project_root/blog/index.html" "$destination/blog/index.html"
cp "$project_root/blog/annual-strength-training-calendar/index.html" \
  "$destination/blog/annual-strength-training-calendar/index.html"

echo "Cloudflare Pages website assembled at $destination"
