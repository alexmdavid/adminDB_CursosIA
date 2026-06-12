# ===== ETAPA 1: Compilar el backend Go =====
FROM golang:1.26-alpine AS builder

WORKDIR /app/backend

# Instalar dependencias del sistema
RUN apk add --no-cache gcc musl-dev

# Copiar archivos de dependencias
COPY backend/go.mod backend/go.sum ./

# Descargar dependencias
RUN go mod download

# Copiar el código fuente
COPY backend/ .

# Compilar el binario
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o admin-backend .

# ===== ETAPA 2: nginx para el frontend + backend =====
FROM nginx:alpine

# Instalar el binario del backend
COPY --from=builder /app/backend/admin-backend /usr/local/bin/admin-backend

# Eliminar config default de nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiar el frontend (solo el index.html)
COPY index.html /usr/share/nginx/html/index.html

# Copiar configuración de nginx para proxy reverso al backend
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto
EXPOSE 80

# Script de inicio: arrancar backend + nginx
COPY start.sh /start.sh
RUN chmod +x /start.sh

CMD ["/start.sh"]