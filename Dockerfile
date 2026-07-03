FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/nginx.conf

RUN mkdir -p /tmp /var/cache/nginx /var/run /var/log/nginx /etc/nginx/conf.d /run/nginx \
    && chown -R nginx:nginx /tmp /usr/share/nginx/html /var/cache/nginx /var/run /var/log/nginx /etc/nginx/conf.d /run/nginx

EXPOSE 8080
USER nginx
CMD ["nginx", "-g", "daemon off;"]
