

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
   
    const settings = await prisma.globalSetting.findMany({
      where: {
        key: { in: ["themeConfig", "homePageTheme"] },
      },
    });

    const mainThemeSetting = settings.find((s) => s.key === "themeConfig");
    const homePageThemeSetting = settings.find(
      (s) => s.key === "homePageTheme"
    );

   
    const fileConfig = fs.existsSync(themeConfigPath)
      ? JSON.parse(fs.readFileSync(themeConfigPath, "utf8"))
      : {};

    const mainTheme = mainThemeSetting ? mainThemeSetting.value : fileConfig;
    
   
   
    const homePageTheme = homePageThemeSetting
      ? homePageThemeSetting.value
      : "elevate"; 

   
    currentThemeConfig = {
      ...mainTheme,
      homePageTheme: homePageTheme,
    };

    console.log(`🎨 Tema berhasil dimuat: ${currentThemeConfig.homePageTheme}`);
  } catch (error) {
    console.error("❌ Gagal memuat konfigurasi tema:", error);
   
    currentThemeConfig = fs.existsSync(themeConfigPath)
      ? JSON.parse(fs.readFileSync(themeConfigPath, "utf8"))
      : {};
    
   
    currentThemeConfig.homePageTheme = "elevate"; 
  }
}


export const getTheme = () => currentThemeConfig;