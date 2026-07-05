// @ts-check
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import { execSync } from "node:child_process";

import AstroPWA from "@vite-pwa/astro";
import { defineConfig } from "astro/config";

let repoName = "HideAndSeek";
if (process.env.GITHUB_REPOSITORY) {
    repoName = process.env.GITHUB_REPOSITORY.split("/")[1];
} else {
    try {
        const repoUrl = execSync("git config --get remote.origin.url")
            .toString()
            .trim();
        repoName = repoUrl
            .split("/")
            .pop()
            .replace(/\.git$/, "");
    } catch (e) {
        // Fallback to default
    }
}

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
                short_name: "Hide and Seek - Calgary",
                description:
                    "The map automatically eliminates possible hiding areas based on your questions!",
                icons: [
                    {
                        src: "pwa-192x192.png",
                        sizes: "192x192",
                        type: "image/png",
                    },
                    {
                        src: "pwa-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                    },
                    {
                        src: "pwa-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "any maskable"
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
            ? `/${repoName}/${process.env.BRANCH_NAME}`
            : `/${repoName}`,
});
