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
FROM nginx:1.25.5 as webserver

# Ajoute les fichiers de configurations NGINX
COPY build/local/default.conf.template /etc/nginx/templates/default.conf.template

# Copie le code du site dans NGINX
COPY --from=build /app/_site/ /usr/share/nginx/html

# Expose les ports 80 et 443
EXPOSE 80
EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]