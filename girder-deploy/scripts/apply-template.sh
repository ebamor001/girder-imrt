#!/bin/bash
set -e

PROJECT_TEMPLATE=${PROJECT_TEMPLATE:-thermolyse}

ROOT_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"

TEMPLATE_DIR="$ROOT_DIR/src/projects/${PROJECT_TEMPLATE}"
GIRDER_DIR="$ROOT_DIR/src/girder/girder/web/src"

echo "Template choisi : ${PROJECT_TEMPLATE}"

if [ ! -d "$TEMPLATE_DIR" ]; then
  echo "Erreur : template introuvable : $TEMPLATE_DIR"
  exit 1
fi

cp "$TEMPLATE_DIR/views/frontPageView.js" "$GIRDER_DIR/views/body/FrontPageView.js"
cp "$TEMPLATE_DIR/stylesheets/frontPage.styl" "$GIRDER_DIR/stylesheets/body/frontPage.styl"
cp "$TEMPLATE_DIR/stylesheets/header.styl" "$GIRDER_DIR/stylesheets/layout/header.styl"
cp "$TEMPLATE_DIR/stylesheets/globalNav.styl" "$GIRDER_DIR/stylesheets/layout/globalNav.styl"
cp "$TEMPLATE_DIR/utilities/translations.js" "$GIRDER_DIR/utilities/translations.js"


if [ -d "$TEMPLATE_DIR/public" ]; then
  GIRDER_PUBLIC_DIR="$ROOT_DIR/src/girder/girder/web/public"
  mkdir -p "$GIRDER_PUBLIC_DIR"
  cp -r "$TEMPLATE_DIR/public/"* "$GIRDER_PUBLIC_DIR/" 2>/dev/null || true
fi

echo "Template appliqué avec succès."
