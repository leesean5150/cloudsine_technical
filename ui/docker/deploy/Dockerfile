FROM node:18-alpine AS builder

WORKDIR /ui

COPY ../../package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /ui/build /usr/share/nginx/html

COPY ./docker/deploy/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
