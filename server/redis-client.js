// File: server/redis-client.js (Versi Diaktifkan)
import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = createClient({
  url: redisUrl,
});

redisClient.on('error', (err) => console.error('❌ Redis Client Error', err));

(async () => {
  try {
    await redisClient.connect();
    console.log('✅ Berhasil terhubung ke Redis.');
  } catch (err) {
    console.error('❌ Gagal terhubung ke Redis:', err);
  }
})();

export default redisClient;