# File: client/Dockerfile

# Menggunakan image Node.js versi 18 yang ringan sebagai dasar
FROM node:18-alpine

# Menetapkan direktori kerja di dalam container
WORKDIR /app

# Salin file package.json dan package-lock.json terlebih dahulu
COPY package*.json ./

# Instal semua dependensi
RUN npm install --legacy-peer-deps

# Salin sisa kode aplikasi
COPY . .

# Perintah untuk menjalankan server pengembangan Vite
# Opsi --host diperlukan agar bisa diakses dari luar container
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]