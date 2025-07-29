# Tahap 1: Membangun (Build) Aplikasi React
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
# Perintah ini akan membuat folder /app/dist yang berisi file statis
RUN npm run build

# Tahap 2: Menjalankan (Serve) Aplikasi dengan Server Nginx
FROM nginx:stable-alpine

# Salin hasil build dari tahap sebelumnya ke direktori Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Ekspos port 80 untuk Nginx
EXPOSE 80

# Jalankan Nginx saat container dimulai
CMD ["nginx", "-g", "daemon off;"]