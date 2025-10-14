#!/bin/sh
set -e

echo "🔧 Aplicando migrações..."
python3 manage.py migrate --noinput

echo "📦 Coletando arquivos estáticos..."
python manage.py collectstatic --noinput --clear

echo "🚀 Iniciando servidor Django..."
python3 manage.py runserver 0.0.0.0:8000
