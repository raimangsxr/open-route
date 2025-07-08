# Multi-stage build for Angular app
FROM node:20-alpine as build
WORKDIR /app
COPY .. .
RUN npm ci && npm run build -- --configuration production

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY deploy/nginx.conf /etc/nginx/nginx.conf
RUN chown -R nginx:nginx /usr/share/nginx/html \
    && chown -R nginx:nginx /var/cache/nginx \
    && chown -R nginx:nginx /var/run \
    && chown -R nginx:nginx /var/log/nginx
USER root
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]