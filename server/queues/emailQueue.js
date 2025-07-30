import { Queue } from 'bullmq';
import { createClient } from 'redis';

const connection = createClient({
    url: process.env.REDIS_URL, // Gunakan variabel lingkungan
    maxRetriesPerRequest: null
}).duplicate();

const emailQueue = new Queue('email-queue', { connection });

export default emailQueue;