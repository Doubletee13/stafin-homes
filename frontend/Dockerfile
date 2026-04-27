# Stage 1: Build Tailwind CSS
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build:css

# Stage 2: Serve with Nginx
FROM nginx:alpine
# Copy built CSS
COPY --from=builder /app/dist /usr/share/nginx/html/dist
# Copy JS and components (needed for dynamic loading)
COPY --from=builder /app/src /usr/share/nginx/html/src
# Copy pages to root for easy access
COPY --from=builder /app/src/pages/*.html /usr/share/nginx/html/
# Move index.html to root explicitly if not already there by glob
RUN mv /usr/share/nginx/html/index.html /usr/share/nginx/html/index.html 2>/dev/null || true

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
