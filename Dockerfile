ARG NGX_IMG_NAME="PASS THIS VALUE THROUGH --build-arg IN THE build.sh SCRIPT"

###
### STAGE 1: Build
###
FROM node:20.12.2 AS build

WORKDIR /app

# Copie les fichiers package.json et package-lock.json
COPY website/package*.json ./

# Installe les dépendances
RUN npm install

# Copie le reste des fichiers de l'application
COPY website .

# Construit l'application
RUN npm run build

# Converti les fichiers scss en css
RUN npm run sass

###
### STAGE 2: Insert the build into the webserver
###
FROM ${NGX_IMG_NAME} as webserver

# Ajoute les certificats SSL
# COPY certs/ /etc/ssl/certs/

# Ajoute les fichiers de configurations NGINX
COPY build/nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY build/nginx/registry.conf.template /etc/nginx/templates/registry.conf.template
COPY build/nginx/nginx.conf /etc/nginx/nginx.conf
COPY build/nginx/nginx-headers.module /etc/nginx/nginx-headers.module

# Copie le code du site dans NGINX
COPY --from=build /app/_site/ /usr/share/nginx/html

# Expose les ports 80 et 443
EXPOSE 80
EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]