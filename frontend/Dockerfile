# Étape 1 : Construction de l'application React avec Node.js
FROM node:22-alpine AS builder

WORKDIR /app

# Déclaration des arguments de build pour Vite
ARG VITE_API_URL=""
ARG VITE_CLOUDINARY_CLOUD_NAME="demo"
ARG VITE_CLOUDINARY_UPLOAD_PRESET="genealogie_unsigned"

ENV VITE_API_URL=$VITE_API_URL \
    VITE_CLOUDINARY_CLOUD_NAME=$VITE_CLOUDINARY_CLOUD_NAME \
    VITE_CLOUDINARY_UPLOAD_PRESET=$VITE_CLOUDINARY_UPLOAD_PRESET

# Cache des dépendances npm
COPY package.json package-lock.json ./
RUN npm ci

# Copie du code source et compilation
COPY . .
RUN npm run build

# Étape 2 : Image d'exécution légère Nginx
FROM nginx:1.27-alpine

# Copie du build compilé
COPY --from=builder /app/dist /usr/share/nginx/html

# Copie de la configuration Nginx (SPA + Reverse Proxy)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
