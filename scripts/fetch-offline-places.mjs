import * as turf from "@turf/turf";
import fs from "fs/promises";
import { readFileSync } from "fs";

const OVERPASS_ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];

const USER_AGENT =
    "HideNSeek-OfflineDataFetcher/1.0 (contact: hidenseekappdonation@gmail.com)";

function getFilters() {
    const content = readFileSync("src/maps/placesConfig.ts", "utf8");
    const match = content.match(
        /export const PLACES = (\[[\s\S]*?\]) as const;/,
    );
    if (!match) return [];

    const placesText = match[1];
    const places = [];

    const placeMatches = placesText.matchAll(/\{([^{}]+)\}/g);
    for (const m of placeMatches) {
        const itemText = m[1];
        const item = {};
        itemText.split(",").forEach((part) => {
            const [key, ...rest] = part.split(":").map((s) => s.trim());
            if (key && rest.length) {
                const valStr = rest.join(":").trim();
                item[key] = valStr.replace(/^["']|["']$/g, "");
            }
        });
        places.push(item);
    }

    return places.map((p) => {
        if (p.specificLocation) {
            return p.specificLocation.replace(/^'|'$/g, "");
        }
        return `["${p.tag}"="${p.id}"]`;
    });
}

function chunkArray(arr, size) {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }
    return chunks;
}

async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(query, maxRetries = 6, timeoutMs = 65000) {
    let delayMs = 4000;

    for (let i = 0; i < maxRetries; i++) {
        const url = OVERPASS_ENDPOINTS[i % OVERPASS_ENDPOINTS.length];
        const host = new URL(url).hostname;
        try {
            console.log(
                `Fetching from ${host} (Attempt ${i + 1}/${maxRetries})...`,
            );

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "User-Agent": USER_AGENT,
                    Accept: "*/*",
                },
                body: `data=${encodeURIComponent(query)}`,
                // Hard client-side timeout so dead mirrors cannot hang Node forever
                signal: AbortSignal.timeout(timeoutMs),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.remark && data.remark.includes("runtime error")) {
                throw new Error(`Overpass API remark: ${data.remark}`);
            }
            return data;
        } catch (error) {
            const msg =
                error.name === "TimeoutError"
                    ? `Request timed out after ${timeoutMs / 1000}s`
                    : error.message;
            console.error(`Attempt ${i + 1} (${host}) failed: ${msg}`);

            if (i < maxRetries - 1) {
                console.log(
                    `Waiting ${delayMs / 1000}s before trying next mirror...`,
                );
                await sleep(delayMs);
                delayMs = Math.min(delayMs * 1.5, 20000);
            } else {
                throw error;
            }
        }
    }
}

async function main() {
    try {
        console.log("Reading boundary data...");
        const boundaryData = JSON.parse(
            await fs.readFile("src/data/calgary_boundary.json", "utf8"),
        );
        const featureCollection = turf.featureCollection(boundaryData);
        const bbox = turf.bbox(featureCollection);
        const bboxString = `${bbox[1]},${bbox[0]},${bbox[3]},${bbox[2]}`;

        console.log(`Calculated bbox: ${bboxString}`);

        const placeFilters = getFilters();
        const batches = chunkArray(placeFilters, 3);
        const elementMap = new Map();
        let baseResponseMeta = null;

        // 1. Fetch place filters in small batches
        for (let b = 0; b < batches.length; b++) {
            console.log(`\n--- Processing places batch ${b + 1}/${batches.length} ---`);
            const queryStmts = batches[b]
                .map((f) => `nwr${f}(${bboxString});`)
                .join("\n  ");

            // Change `out center;` back to `out geom;` ONLY if your app draws polygons for places
            const overpassQuery = `
[out:json][timeout:55];
(
  ${queryStmts}
);
out center;
`;

            const data = await fetchWithRetry(overpassQuery);

            if (!baseResponseMeta) {
                const { elements, ...meta } = data;
                baseResponseMeta = meta;
            }

            if (data?.elements) {
                for (const el of data.elements) {
                    elementMap.set(`${el.type}/${el.id}`, el);
                }
                console.log(
                    `Batch ${b + 1} returned ${data.elements.length} elements (Total unique: ${elementMap.size})`,
                );
            }

            await sleep(3000);
        }

        // 2. Fetch admin_level=10 boundaries separately with full geometry
        console.log(`\n--- Fetching admin_level=10 boundaries ---`);
        const adminQuery = `
[out:json][timeout:55];
(
  relation["admin_level"="10"](${bboxString});
);
out geom;
`;
        const adminData = await fetchWithRetry(adminQuery);
        if (adminData?.elements) {
            for (const el of adminData.elements) {
                elementMap.set(`${el.type}/${el.id}`, el);
            }
            console.log(
                `Admin boundaries returned ${adminData.elements.length} elements (Total unique: ${elementMap.size})`,
            );
        }

        const mergedElements = Array.from(elementMap.values());

        if (mergedElements.length === 0) {
            throw new Error(
                "No data or empty elements array returned from Overpass API.",
            );
        }

        const finalOutput = {
            ...baseResponseMeta,
            elements: mergedElements,
        };

        console.log(
            `\nSuccessfully fetched ${mergedElements.length} unique elements.`,
        );

        await fs.writeFile(
            "src/data/offline_places.json",
            JSON.stringify(finalOutput, null, 2),
        );
        console.log("Saved to src/data/offline_places.json");

        const metadata = {
            lastUpdated: new Date().toISOString(),
        };
        await fs.writeFile(
            "src/data/offline_metadata.json",
            JSON.stringify(metadata, null, 2),
        );
        console.log("Saved to src/data/offline_metadata.json");
    } catch (error) {
        console.error("Script failed:", error);
        process.exit(1);
    }
}

main();
