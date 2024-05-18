# Récupère le dossier du script
dir="$(dirname "$0")"

source "$dir/../.env"
source "$dir/nginx/.env"

NGX_IMG_NAME=$DOCKER_USERNAME/$DOCKER_NGINX_IMAGE_NAME:$DOCKER_NGINX_TAG

# Build l'image de l'application avec NGINX
docker build \
    -f ../Dockerfile \
    -t $DOCKER_USERNAME/$DOCKER_IMAGE_NAME:$DOCKER_TAG \
    --build-arg NGX_IMG_NAME=$NGX_IMG_NAME \
    --no-cache \
    ../

# Push l'image (docker hub)
# docker push $DOCKER_USERNAME/$DOCKER_IMAGE_NAME:$DOCKER_TAG