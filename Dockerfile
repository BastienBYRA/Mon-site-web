###
### STAGE 1: Build
###
FROM node:20.12.2 AS build

WORKDIR /app

# Copie les fichiers package.json et package-lock.json
COPY frontend/package*.json ./

# Installe les dépendances
RUN npm install

# Copie le reste des fichiers de l'application
COPY frontend .

# Construit l'application
RUN npm run build

# Converti les fichiers scss en css
RUN npm run sass

###
### STAGE 2: Insert the build into the webserver
###
FROM nginx:1.27.3 as webserver

# Ajoute les fichiers de configurations NGINX
COPY frontend/docker/default.conf.template /etc/nginx/templates/default.conf.template
COPY frontend/docker/nginx-headers.module /etc/nginx/nginx-headers.module

# Copie le code du site dans NGINX
COPY --from=build /app/_site/ /usr/share/nginx/html

# Expose le port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]