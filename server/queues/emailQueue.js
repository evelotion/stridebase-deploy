// File: server/queues/emailWorker.js

import { Worker } from 'bullmq';

// Fungsi simulasi pengiriman email (dalam aplikasi nyata, ini akan menggunakan Nodemailer, dll.)
const sendEmail = async (data) => {
  console.log(`\n--- MEMPROSES TUGAS EMAIL ---`);
  console.log(`Mengirim email ke: ${data.to}`);
  console.log(`Subjek: ${data.subject}`);
  console.log(`Isi: ${data.body}`);
  // Simulasi proses pengiriman yang memakan waktu
  await new Promise(resolve => setTimeout(resolve, 5000)); // Tunggu 5 detik
  console.log(`--- TUGAS EMAIL SELESAI ---\n`);
};

// Membuat worker untuk memproses tugas dari 'email-queue'
const worker = new Worker('email-queue', async job => {
  await sendEmail(job.data);
}, {
  // PERUBAHAN PADA BAGIAN KONEKSI
  connection: {
    host: process.env.REDIS_HOST || 'redis', // Menggunakan nama service 'redis' dari docker-compose
    port: 6379,
  },
});

console.log("Email worker sedang berjalan dan siap menerima tugas...");