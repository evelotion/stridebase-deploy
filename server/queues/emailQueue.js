

import { Worker } from 'bullmq';


const sendEmail = async (data) => {
  console.log(`\n--- MEMPROSES TUGAS EMAIL ---`);
  console.log(`Mengirim email ke: ${data.to}`);
  console.log(`Subjek: ${data.subject}`);
  console.log(`Isi: ${data.body}`);
 
  await new Promise(resolve => setTimeout(resolve, 5000));
  console.log(`--- TUGAS EMAIL SELESAI ---\n`);
};


const worker = new Worker('email-queue', async job => {
  await sendEmail(job.data);
}, {
 
  connection: {
    host: process.env.REDIS_HOST || 'redis',
    port: 6379,
  },
});

console.log("Email worker sedang berjalan dan siap menerima tugas...");