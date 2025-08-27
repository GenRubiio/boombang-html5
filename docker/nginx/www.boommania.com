# CORS Headers
add_header Access-Control-Allow-Origin "https://play.boommania.com" always;
add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control" always;
add_header Access-Control-Allow-Credentials "true" always;

# Handle preflight requests
if ($request_method = 'OPTIONS') {
    add_header Access-Control-Allow-Origin "https://play.boommania.com" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control" always;
    add_header Access-Control-Allow-Credentials "true" always;
    add_header Access-Control-Max-Age 86400;
    add_header Content-Length 0;
    add_header Content-Type text/plain;
    return 204;
}

add_header Permissions-Policy "identity-credentials-get=(self \"https://play.boommania.com\")" always;