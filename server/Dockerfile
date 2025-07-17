# Menggunakan image Node.js versi 18 yang ringan sebagai dasar
FROM node:18-alpine

# Menetapkan direktori kerja di dalam container
WORKDIR /app

# Salin file package.json dan package-lock.json terlebih dahulu
COPY package*.json ./

# Instal hanya dependensi produksi untuk menjaga ukuran image tetap kecil
RUN npm install --only=production

# Salin sisa kode aplikasi
COPY . .

# Beri tahu Docker bahwa container akan berjalan di port 5000
EXPOSE 5000

# Perintah untuk menjalankan aplikasi saat container dimulai
CMD ["npm", "start"]