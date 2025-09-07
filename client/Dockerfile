# File: client/Dockerfile (Ganti dengan kode ini)

# Tahap 1: Build aplikasi React
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
# Perintah penting untuk membuat folder build produksi
RUN npm run build

# Tahap 2: Siapkan server produksi yang ringan
FROM node:18-alpine
WORKDIR /app
# Salin file hasil build dari tahap sebelumnya
COPY --from=build /app/dist .
# Install 'serve', sebuah server statis yang tangguh
RUN npm install -g serve
EXPOSE 5173
# Jalankan server untuk menyajikan konten dari folder build
CMD ["serve", "-s", ".", "-l", "5173"]