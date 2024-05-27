#!/bin/bash

# Créer le volume pour la registry
docker volume create registry_data

# Run la registry
docker run -d \
    -p 5000:5000 \
    --restart=always \
    --name registry \
    -v "$(pwd)"/auth:/auth \
    -e "REGISTRY_AUTH=htpasswd" \
    -e "REGISTRY_AUTH_HTPASSWD_REALM=Registry Realm" \
    -e REGISTRY_AUTH_HTPASSWD_PATH=/apps/registry/htpasswd \
    -v ../deploy/certbot/conf/:/certs \
    -e REGISTRY_HTTP_TLS_CERTIFICATE=/certs/live/bastienbyra.fr/fullchain.pem \
    -e REGISTRY_HTTP_TLS_KEY=/certs/live/bastienbyra.fr/privkey.pem \
    registry:2