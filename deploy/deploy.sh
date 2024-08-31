# Récupère le dossier du script
dir="$(dirname "$0")"

#source "$dir/../.env"
. "$dir/../.env"

# Build l'image de l'application avec NGINX
docker run -d \
    -p 80:80 \
    -p 443:443 \
    -e DNS_NAME=$DNS_NAME \
    -e WWW_DNS_NAME=$WWW_DNS_NAME \
    -v ./certbot/conf/:/etc/nginx/ssl/:ro \
    -v ./certbot/www:/var/www/certbot/:ro \
    --name $DOCKER_NAME_DEPLOY \
    $DOCKER_USERNAME/$DOCKER_IMAGE_NAME:$DOCKER_TAG