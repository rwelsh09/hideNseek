// @ts-check
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import AstroPWA from "@vite-pwa/astro";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
    integrations: [
        react(),
        tailwind({
            applyBaseStyles: false,
        }),
        AstroPWA({
            manifest: {
                name: "Hide and Seek Map",
                short_name: "Map Generator",
                description:
                    "Automatically generate maps for Hide and Seek with ease! Simply name the questions and watch the map eliminate hundreds of possibilities in seconds.",
                icons: [
                    {
                        src: "icon.png",
                        sizes: "1080x1080",
                        type: "image/png",
                    },
                    {
                        src: "android-chrome-192x192.png",
                        sizes: "192x192",
                        type: "image/png",
                    },
                    {
                        src: "android-chrome-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                    },
                ],
                theme_color: "#1F2F3F",
            },
        }),
    ],
    devToolbar: {
        enabled: false,
    },
    site: "https://rwelsh09.github.io",
    base:
        process.env.BRANCH_NAME && process.env.BRANCH_NAME !== "master"
            ? `/HideAndSeek/${process.env.BRANCH_NAME}`
            : "/HideAndSeek",
});
