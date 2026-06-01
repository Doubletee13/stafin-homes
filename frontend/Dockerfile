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
# Copy js and components
COPY --from=builder /app/src /usr/share/nginx/html/src
# Copy all pages recursively to Nginx root structure so clean URLs map properly
COPY --from=builder /app/src/pages/ /usr/share/nginx/html/

# Replace default config with our SPA production nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
