#!/usr/bin/env bash
set -e

cd /workspace

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
