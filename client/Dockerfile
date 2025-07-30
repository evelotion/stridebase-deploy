<<<<<<< HEAD
# File: client/Dockerfile

# Menggunakan image Node.js versi 18 yang ringan sebagai dasar
FROM node:18-alpine
=======
# Tahap 1: Membangun (Build) Aplikasi React
FROM node:18-alpine AS build
>>>>>>> 405187dd8cd3db9bd57ddb0aeaf8c32d9ee8bdc3

WORKDIR /app
COPY package*.json ./
<<<<<<< HEAD

# Instal semua dependensi
RUN npm install --legacy-peer-deps

# Salin sisa kode aplikasi
=======
RUN npm install --legacy-peer-deps
>>>>>>> 405187dd8cd3db9bd57ddb0aeaf8c32d9ee8bdc3
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