// File: client/src/apiConfig.ts

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

console.log("🔗 API Base URL:", API_BASE_URL); // Debugging: Cek ini muncul apa di Console Browser

export default API_BASE_URL;