#!/bin/sh
# Inject API_BASE_URL into a config JS file at container startup
cat > /usr/share/nginx/html/src/js/config.js << JSEOF
window.API_BASE_URL = '${FRONTEND_API_BASE_URL:-/api}';
JSEOF
# Start nginx
exec nginx -g 'daemon off;'
