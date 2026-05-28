FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN PRODUCTION=true node build.js

FROM nginx:alpine AS final
COPY --from=builder /app/build /usr/share/nginx/html
COPY --from=builder /app/src/assets /usr/share/nginx/html/assets
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
