FROM node:20-alpine AS builder

WORKDIR /app

# Dependency installation
COPY package-lock.json ./
COPY package.json ./
RUN npm install

# Building the app
COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]