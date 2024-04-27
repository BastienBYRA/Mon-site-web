# Récupère le dossier du script
dir="$(dirname "$0")"

source "$dir/../.env"

# Build l'image de l'application avec NGINX
docker run -d \
    -p 80:80 \
    -p 443:443 \
    -v certs/:/etc/nginx/ssl \
    --name $DOCKER_NAME_DEPLOY \
    $DOCKER_USERNAME/$DOCKER_IMAGE_NAME:$DOCKER_TAG