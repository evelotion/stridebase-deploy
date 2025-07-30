import { createClient } from 'redis';

// Buat klien Redis
const redisClient = createClient({
  url: process.env.REDIS_URL // Gunakan variabel lingkungan
});

// Tangani error koneksi
redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

// Hubungkan ke server Redis
const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
};

// Panggil fungsi koneksi saat aplikasi dimulai
connectRedis().then(() => {
    console.log('Berhasil terhubung ke server Redis.');
}).catch(console.error);

// Ekspor klien untuk digunakan di file lain
export default redisClient;