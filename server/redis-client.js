import { createClient } from 'redis';

// Buat klien Redis
const redisClient = createClient({
  // URL default Redis adalah redis://localhost:6379,
  // jadi kita tidak perlu menentukannya secara eksplisit jika menggunakan Docker di lokal.
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