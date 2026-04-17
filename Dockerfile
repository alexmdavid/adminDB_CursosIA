# Usamos nginx
FROM nginx:alpine

# Eliminamos la config default
RUN rm -rf /usr/share/nginx/html/*

# Copiamos tu HTML
COPY . /usr/share/nginx/html

# Exponer puerto
EXPOSE 80

# Ejecutar nginx
CMD ["nginx", "-g", "daemon off;"]