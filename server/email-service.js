// File: stridebase-app-render/server/email-service.js (Versi Final dengan Link Dinamis)

import Brevo from '@getbrevo/brevo';

// Konfigurasi API Brevo
const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.authentications['apiKey'].apiKey = process.env.BREVO_API_KEY;

export const sendVerificationEmail = async (userEmail, token) => {
  // --- PERUBAHAN DI SINI: Membuat link dinamis berdasarkan environment ---
  const frontendUrl = process.env.NODE_ENV === 'production'
    ? 'https://stridebase-client-ctct.onrender.com' // URL Frontend Anda di Render
    : 'http://localhost:5173';                     // URL untuk development lokal

  const verificationLink = `${frontendUrl}/verify-email?token=${token}`;
  // --- AKHIR PERUBAHAN ---

  const msg = {
    to: userEmail,
    from: process.env.EMAIL_FROM,
    subject: "Verifikasi Akun StrideBase Anda",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #1c40d4;">Selamat Datang di StrideBase!</h2>
          <p>Terima kasih telah mendaftar. Hanya satu langkah lagi untuk mengaktifkan akun Anda. Silakan klik tombol di bawah ini untuk memverifikasi alamat email Anda:</p>
          <a href="${verificationLink}" style="background-color: #1c40d4; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Verifikasi Email Saya</a>
          <p style="margin-top: 20px;">Jika tombol di atas tidak berfungsi, Anda bisa menyalin dan menempelkan link berikut di browser Anda:</p>
          <p><a href="${verificationLink}" style="color: #1c40d4;">${verificationLink}</a></p>
          <p>Jika Anda tidak merasa mendaftar di StrideBase, mohon abaikan email ini.</p>
          <br>
          <p>Terima kasih,<br>Tim StrideBase</p>
        </div>
      </div>
    `,
  };

  try {
    await apiInstance.sendTransacEmail(msg);
    console.log(`✅ Email verifikasi via Brevo berhasil dikirim ke: ${userEmail}`);
  } catch (error) {
    console.error("❌ Gagal mengirim email verifikasi via Brevo:", error);
    if (error.response) {
      console.error(JSON.stringify(error.response.body, null, 2));
    }
  }
};