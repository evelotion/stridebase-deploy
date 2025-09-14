# File: client/Dockerfile (Versi Optimal dengan Multi-Stage Build)

# --- TAHAP 1: BUILD ---
# Gunakan image Node.js yang lengkap untuk membangun aplikasi
FROM node:18-alpine AS build

WORKDIR /app

# Salin file package untuk caching dependensi
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Salin sisa kode aplikasi
COPY . .

# Jalankan perintah build untuk menghasilkan file statis di folder /app/dist
RUN npm run build

# --- TAHAP 2: SERVE ---
# Gunakan image yang lebih ringan untuk production
FROM node:18-alpine

WORKDIR /app

# Salin HANYA folder hasil build dari tahap sebelumnya
COPY --from=build /app/dist .

# Install 'serve', sebuah server statis yang efisien untuk production
RUN npm install -g serve

# Expose port yang digunakan oleh client (Vite default)
EXPOSE 5173

# Perintah untuk menjalankan server dan menyajikan aplikasi React Anda
CMD ["serve", "-s", ".", "-l", "5173"]