# Étape de construction
FROM jekyll/builder AS builder

# Copie du contenu du projet dans le conteneur
COPY . /srv/jekyll

# Définition du répertoire de travail
WORKDIR /srv/jekyll

# Installation des dépendances
RUN bundle install

# Génération du site Jekyll
RUN bundle exec jekyll build

# Étape de déploiement
FROM nginx:v1.25-alpine

# Copie du site généré dans le conteneur NGINX
COPY --from=builder /srv/jekyll/_site /usr/share/nginx/html

# Exposition du port 80 pour le serveur NGINX
EXPOSE 80

# Commande par défaut pour démarrer NGINX
CMD ["nginx", "-g", "daemon off;"]