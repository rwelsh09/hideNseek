// @ts-check
import { execSync } from "node:child_process";

import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
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
            workbox: {
                navigateFallbackDenylist: [
                    /branches\.html$/,
                    /\/feat\//,
                    /\/fix\//,
                    /\/chore\//,
                    /\/bug\//,
                ],
                maximumFileSizeToCacheInBytes: 5000000,
                globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest,json}'],
            },
            manifest: {
                name: "Hide and Seek Map",
                short_name: "Hide and Seek - Calgary",
                description:
                    "The map automatically eliminates possible hiding areas based on your questions!",
                icons: [
                    {
                        src: "icon.svg",
                        sizes: "any",
                        type: "image/svg+xml",
                    },
                    {
                        src: "icon.svg",
                        sizes: "any",
                        type: "image/svg+xml",
                        purpose: "any maskable",
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
    trailingSlash: "always",
    build: {
        format: "directory",
    },
});
