FROM node:20-alpine AS builder

WORKDIR /app

# Dependency installation
COPY package-lock.json ./
COPY package.json ./
RUN npm install

# Building the app
COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

FROM nginx:alpine

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder 

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]