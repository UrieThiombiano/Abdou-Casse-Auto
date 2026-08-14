#!/usr/bin/env bash
set -e

cd /workspace

# GD extension (image processing for listing photos) isn't in the base
# PHP image and isn't apt-managed there, so it has to be compiled per
# container. Skip if already present (e.g. a different base image).
if command -v docker-php-ext-install >/dev/null 2>&1 && ! php -m | grep -qi '^gd$'; then
  sudo apt-get update -qq || true
  sudo apt-get install -y libpng-dev libjpeg-dev libwebp-dev libfreetype6-dev zlib1g-dev
  sudo docker-php-ext-configure gd --with-jpeg --with-webp --with-freetype
  sudo docker-php-ext-install -j"$(nproc)" gd
  # docker-php-ext-enable loses PHP_INI_DIR under sudo's reset env, so
  # write the ini directly instead of relying on it.
  sudo bash -c 'echo "extension=gd" > /usr/local/etc/php/conf.d/docker-php-ext-gd.ini'
fi

if [ -f composer.json ]; then
  composer install --no-interaction
else
  echo "Pas encore de projet Laravel ici : lancer 'composer create-project laravel/laravel .' pour demarrer."
fi

if [ -f package.json ]; then
  npm install
fi

if [ -f artisan ] && [ -f .env ]; then
  php artisan key:generate --ansi
fi
