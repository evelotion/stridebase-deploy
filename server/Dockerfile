# File: server/Dockerfile

# Menggunakan image Node.js versi 18 yang ringan sebagai dasar
FROM node:18-alpine

# Menetapkan direktori kerja di dalam container
WORKDIR /app

# Salin file package.json dan package-lock.json terlebih dahulu
COPY package*.json ./
# Juga salin skema prisma agar generate bisa berjalan
COPY prisma ./prisma/

# Instal SEMUA dependensi
RUN npm install

# Hasilkan Prisma Client yang sesuai untuk lingkungan Alpine Linux
# (Langkah ini tetap baik untuk caching saat build)
RUN npx prisma generate

# Salin sisa kode aplikasi
COPY . .

# Beri tahu Docker bahwa container akan berjalan di port 5000
EXPOSE 5000

# PERINTAH YANG DIPERBAIKI:
# Gunakan shell form untuk menjalankan dua perintah secara berurutan.
# Ini memastikan Prisma Client selalu di-generate ulang sesuai lingkungan container
# setiap kali container dimulai, sebelum server dijalankan.
<<<<<<< HEAD
CMD ["sh", "-c", "npx prisma generate && npm start"]
=======
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
>>>>>>> 405187dd8cd3db9bd57ddb0aeaf8c32d9ee8bdc3
