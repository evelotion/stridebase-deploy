# File: server/Dockerfile (Versi Optimal)

# Tahap 1: Build Dependencies
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
# Hanya instal dependensi produksi untuk mengurangi ukuran
RUN npm install --only=production --legacy-peer-deps

# Tahap 2: Build Prisma Client
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY prisma ./prisma/
# Generate Prisma Client yang kompatibel dengan Alpine Linux
RUN npx prisma generate

# Tahap 3: Final Image
FROM node:18-alpine
WORKDIR /app
# Salin semua yang kita butuhkan dari tahap sebelumnya
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/generated ./generated
COPY . .

EXPOSE 5000

# Perintah CMD tetap sama untuk menjalankan migrasi dan memulai server
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]