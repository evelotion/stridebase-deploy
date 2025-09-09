// File: server/config/theme.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import prisma from "./prisma.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const themeConfigPath = path.join(__dirname, "theme.json");

export let currentThemeConfig = {};

export async function loadThemeConfig() {
  try {
    const themeSetting = await prisma.globalSetting.findUnique({
      where: { key: "themeConfig" },
    });

    if (themeSetting) {
      console.log("🎨 Tema berhasil dimuat dari DATABASE.");
      currentThemeConfig = themeSetting.value;
    } else {
      console.log("⚠️ Konfigurasi tema tidak ditemukan di database, kembali ke theme.json...");
      if (fs.existsSync(themeConfigPath)) {
        const fileConfig = JSON.parse(fs.readFileSync(themeConfigPath, "utf8"));
        currentThemeConfig = fileConfig;
        await prisma.globalSetting.create({
          data: { key: "themeConfig", value: fileConfig },
        });
        console.log("🎨 Tema dari file telah disimpan ke database.");
      } else {
        console.error("❌ KRITIS: file theme.json tidak ditemukan.");
        currentThemeConfig = {};
      }
    }
  } catch (error) {
    console.error("❌ Gagal memuat konfigurasi tema:", error);
    currentThemeConfig = fs.existsSync(themeConfigPath)
      ? JSON.parse(fs.readFileSync(themeConfigPath, "utf8"))
      : {};
  }
}