import { Queue } from 'bullmq';

// Membuat koneksi ke Redis yang sama dengan aplikasi utama
const emailQueue = new Queue('email-queue', {
  connection: {
    host: '127.0.0.1',
    port: 6379,
  },
});

export default emailQueue;