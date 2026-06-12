#!/bin/sh

echo "🚀 Iniciando backend en el puerto 8080..."
/usr/local/bin/admin-backend &

echo "🌐 Iniciando nginx en el puerto 80..."
nginx -g 'daemon off;'