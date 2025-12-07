// File: server/config/theme.js

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import prisma from "./prisma.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const themeConfigPath = path.join(__dirname, "theme.json");

let currentThemeConfig = {};

export async function loadThemeConfig() {
  try {
    // Ambil semua setting yang relevan dalam satu panggilan
    const settings = await prisma.globalSetting.findMany({
      where: {
        key: { in: ["themeConfig", "homePageTheme"] },
      },
    });

    const mainThemeSetting = settings.find((s) => s.key === "themeConfig");
    const homePageThemeSetting = settings.find(
      (s) => s.key === "homePageTheme"
    );

    // Ambil data dari theme.json sebagai fallback jika 'themeConfig' belum ada di DB
    const fileConfig = fs.existsSync(themeConfigPath)
      ? JSON.parse(fs.readFileSync(themeConfigPath, "utf8"))
      : {};

    const mainTheme = mainThemeSetting ? mainThemeSetting.value : fileConfig;
    
    // [PERUBAHAN PENTING] Ubah default fallback menjadi 'elevate'
    // Artinya: Jika tidak ada setting di DB, otomatis pakai tema Elevate
    const homePageTheme = homePageThemeSetting
      ? homePageThemeSetting.value
      : "elevate"; 

    // Gabungkan keduanya menjadi satu objek konfigurasi
    currentThemeConfig = {
      ...mainTheme,
      homePageTheme: homePageTheme,
    };

    console.log(`🎨 Tema berhasil dimuat: ${currentThemeConfig.homePageTheme}`);
  } catch (error) {
    console.error("❌ Gagal memuat konfigurasi tema:", error);
    // Fallback jika database error, gunakan file lokal
    currentThemeConfig = fs.existsSync(themeConfigPath)
      ? JSON.parse(fs.readFileSync(themeConfigPath, "utf8"))
      : {};
    
    // [PERUBAHAN PENTING] Pastikan nilai default tetap 'elevate' saat error
    currentThemeConfig.homePageTheme = "elevate"; 
  }
}

// Fungsi baru untuk mendapatkan tema yang sudah dimuat
export const getTheme = () => currentThemeConfig;