# File: server/Dockerfile

# Menggunakan image Node.js versi 18 yang ringan sebagai dasar
FROM node:18-alpine

# Menetapkan direktori kerja di dalam container
WORKDIR /app

# Salin file package.json dan package-lock.json terlebih dahulu
COPY package*.json ./

# Salin skema prisma agar generate bisa berjalan
COPY prisma ./prisma/

# Instal SEMUA dependensi (termasuk devDependencies seperti prisma)
RUN npm install --legacy-peer-deps

# PERBAIKAN 1: Jalankan prisma generate setelah instalasi
# Ini akan membuat Prisma Client yang kompatibel dengan environment Alpine Linux di dalam container
RUN npx prisma generate

# Salin sisa kode aplikasi
COPY . .

# Beri tahu Docker bahwa container akan berjalan di port 5000
EXPOSE 5000

# PERINTAH YANG DIPERBAIKI:
# Gunakan shell form untuk menjalankan dua perintah secara berurutan.
# Ini memastikan migrasi database (migrate deploy) dijalankan setiap kali container dimulai,
# sebelum server aplikasi (npm start) dijalankan.
CMD ["sh", "-c", "sleep 5 && npx prisma migrate deploy && npx prisma db seed && npm start"]