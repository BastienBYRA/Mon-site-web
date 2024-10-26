ARG CADDY_IMG_NAME="caddy:2.8.4"

###
### STAGE 1: Build
###
FROM node:20.12.2 AS build

WORKDIR /app
COPY website/package*.json ./
RUN npm install
COPY website .

RUN npm run build
RUN npm run sass

###
### STAGE 2: Insert the build into the webserver
###
FROM ${CADDY_IMG_NAME} as webserver

COPY --from=build /app/_site/ /usr/share/caddy
COPY build/caddy/Caddyfile /etc/caddy/Caddyfile

EXPOSE 80
EXPOSE 443

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
