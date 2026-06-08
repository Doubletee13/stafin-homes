# Single stage: CSS already built locally, just serve with Nginx
FROM nginx:alpine
# Copy pre-built CSS
COPY dist /usr/share/nginx/html/dist
# Copy js and components
COPY src /usr/share/nginx/html/src
# Copy all pages recursively to Nginx root structure so clean URLs map properly
COPY src/pages/ /usr/share/nginx/html/

# Replace default config with our SPA production nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]
