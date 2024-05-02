#!/bin/bash

# Supprime le Dockerfile.clean s'il existe
rm Dockerfile.clean

# Récupère le dossier du script
dir="$(dirname "$0")"

# Copie le Docker.alpine sur la machine hote
curl -o Dockerfile.clean https://raw.githubusercontent.com/nginxinc/docker-nginx/master/modules/Dockerfile.alpine


# Importe nos variables d'environnement
source "$dir/.env"
source "$dir/../../.env"

# (NECESSAIRE POUR LES IMAGES NGINX UNPRIVILIGED)
# On à besoin d'etre root temporairement pour installer des modules (apt ou apk) donc on passe temporairement en root le temps d'installer nos modules
# if [[ $NGINX_FROM_IMAGE == *"unprivileged"* ]]; then
#     sed -i '14iUSER root' Dockerfile.clean
#     sed -i '64iUSER nginx' Dockerfile.clean
#     sed -i '67iUSER root' Dockerfile.clean
#     echo "USER nginx" >> Dockerfile.clean
# fi

# Run le dockerfile pour générer l'image clean avec modules
docker build -f Dockerfile.clean \
    --build-arg ENABLED_MODULES=$ENABLED_MODULES \
    --build-arg NGINX_FROM_IMAGE=$NGINX_FROM_IMAGE \
    -t $DOCKER_USERNAME/$DOCKER_NGINX_IMAGE_NAME:$DOCKER_NGINX_TAG \
    .

# Supprime le Dockerfile
rm Dockerfile.clean

# Push l'image (docker hub)
docker push $DOCKER_USERNAME/$DOCKER_NGINX_IMAGE_NAME:$DOCKER_NGINX_TAG