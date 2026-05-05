# ── Etapa 1: Build de la aplicación Vue ──────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

# VITE_API_BASE_URL se puede pasar como build-arg; por defecto usa /api
# para que Nginx haga el proxy interno
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# ── Etapa 2: Servir con Nginx ─────────────────────────────────────────────────
FROM nginx:1.27-alpine

# Copiar el dist generado
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración de Nginx personalizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
