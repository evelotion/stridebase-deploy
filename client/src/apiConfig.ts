// File: client/src/apiConfig.ts

const API_BASE_URL: string = import.meta.env.PROD
  ? import.meta.env.VITE_API_PRODUCTION_URL
  : ''; // Kosong saat development agar Vite Proxy bekerja

export default API_BASE_URL;