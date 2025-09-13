# File: server/Dockerfile (Versi Perbaikan Final)

# Menggunakan image Node.js versi 18 yang ringan sebagai dasar
FROM node:18-alpine

# Menetapkan direktori kerja di dalam container
WORKDIR /app

# Salin file package.json dan package-lock.json terlebih dahulu
# Ini memanfaatkan caching Docker, build akan lebih cepat jika dependensi tidak berubah
COPY package*.json ./

# Salin skema prisma agar generate bisa berjalan
COPY prisma ./prisma/

# Install SEMUA dependensi (termasuk devDependencies seperti prisma)
# Ini penting agar `npx prisma generate` bisa berjalan
RUN npm install --legacy-peer-deps

# Jalankan prisma generate untuk membuat Prisma Client di dalam container
# Ini akan membuat direktori './generated'
RUN npx prisma generate

# Salin sisa kode aplikasi
COPY . .

# Beri tahu Docker bahwa container akan berjalan di port 5000
EXPOSE 5000

# Perintah untuk menjalankan migrasi dan memulai server aplikasi
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]