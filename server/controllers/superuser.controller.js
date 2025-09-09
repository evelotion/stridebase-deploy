// File: server/controllers/superuser.controller.js

import prisma from "../config/prisma.js";
import { exec } from "child_process";
import { loadThemeConfig, currentThemeConfig } from "../config/theme.js";
import { broadcastThemeUpdate } from '../socket.js';

// @desc    Get all global configurations
// @route   GET /api/superuser/config
export const getGlobalConfig = async (req, res, next) => {
    try {
        const settings = await prisma.globalSetting.findMany();
        const configObject = settings.reduce((acc, setting) => {
            acc[setting.key] = setting.value;
            return acc;
        }, {});
        // Fallback to theme.json if not in DB
        res.json(configObject.themeConfig || currentThemeConfig);
    } catch (error) {
        next(error);
    }
};

// @desc    Update global configurations
// @route   POST /api/superuser/config
export const updateGlobalConfig = async (req, res, next) => {
    const newConfig = req.body;
    try {
        const updatedSetting = await prisma.globalSetting.upsert({
            where: { key: "themeConfig" },
            update: { value: newConfig },
            create: { key: "themeConfig", value: newConfig },
        });

        // Reload config in memory and broadcast
        await loadThemeConfig();
        broadcastThemeUpdate(currentThemeConfig);

        res.json(updatedSetting.value);
    } catch (error) {
        next(error);
    }
};

// @desc    Reseed the database
// @route   POST /api/superuser/maintenance/reseed-database
export const reseedDatabase = (req, res, next) => {
    exec("npx prisma db seed", (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).json({ message: "Gagal menjalankan seeder.", error: stderr });
        }
        res.json({ message: "Database berhasil di-reset dan di-seed ulang.", output: stdout });
    });
};