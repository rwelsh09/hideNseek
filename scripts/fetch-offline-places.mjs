import * as turf from "@turf/turf";
import fs from "fs/promises";
import { readFileSync } from "fs";

const OVERPASS_ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
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

    const parsedFilters = places.map((p) => {
        if (p.specificLocation) {
            return p.specificLocation.replace(/^'|'$/g, "");
        }
        return `["${p.tag}"="${p.id}"]`;
    });

    parsedFilters.push('["admin_level"="10"]');
    return parsedFilters;
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

async function fetchWithRetry(query, maxRetries = 6) {
    let delayMs = 5000;

    for (let i = 0; i < maxRetries; i++) {
        // Rotate through mirrors on each attempt
        const url = OVERPASS_ENDPOINTS[i % OVERPASS_ENDPOINTS.length];
        try {
            console.log(
                `Fetching from ${new URL(url).hostname} (Attempt ${i + 1}/${maxRetries})...`,
            );

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "User-Agent": USER_AGENT,
                    Accept: "*/*",
                },
                body: `data=${encodeURIComponent(query)}`,
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
            console.error(`Attempt ${i + 1} failed: ${error.message}`);
            if (i < maxRetries - 1) {
                console.log(
                    `Waiting ${delayMs / 1000} seconds before retrying next mirror...`,
                );
                await sleep(delayMs);
                delayMs = Math.min(delayMs * 1.5, 30000);
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

        const filters = getFilters();
        // Split into batches of 4 filters to avoid 502 memory/gateway timeouts
        const batches = chunkArray(filters, 4);
        const elementMap = new Map();
        let baseResponseMeta = null;

        for (let b = 0; b < batches.length; b++) {
            console.log(`\n--- Processing batch ${b + 1}/${batches.length} ---`);
            const queryStmts = batches[b]
                .map((f) => `nwr${f}(${bboxString});`)
                .join("\n  ");

            // Note: Swap `out geom;` to `out center;` below if full polygons aren't needed
            const overpassQuery = `
[out:json][timeout:180][maxsize:536870912];
(
  ${queryStmts}
);
out geom;
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

            // Polite pause between batches to avoid rate-limiting (429)
            if (b < batches.length - 1) {
                await sleep(5000);
            }
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
