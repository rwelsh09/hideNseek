import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OVERPASS_API = 'https://overpass-api.de/api/interpreter';
const CALGARY_BBOX = '50.8427,-114.3158,51.2124,-113.8599'; // lat_min,lon_min,lat_max,lon_max

const LOCATION_QUERIES = [
    // Standard Amenities
    `["amenity"="hospital"]`,
    `["tourism"="museum"]`,
    `["amenity"="cinema"]`,
    `["amenity"="library"]`,
    `["leisure"="golf_course"]`,

    // Specific Locations
    `["brand:wikidata"="Q38076"]`, // McDonalds
    `["brand:wikidata"="Q259340"]`, // 7-Eleven
    `["brand:wikidata"="Q175106"]`, // Tim Hortons
    `["amenity"~"^(pub|bar)$"]`, // Pubs/Bars
    `["admin_level"="10"]`, // Neighborhoods
];

async function fetchFromOverpass(query) {
    console.log(`Fetching: ${query}...`);
    const fullQuery = `[out:json][timeout:25];\nnwr${query}(${CALGARY_BBOX});\nout ${query.includes("admin_level") ? "geom" : "center"};\n`;

    let retries = 3;
    while (retries > 0) {
        try {
            const response = await fetch(OVERPASS_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'HideAndSeekBot/1.0'
                },
                body: `data=${encodeURIComponent(fullQuery)}`
            });

            if (!response.ok) {
                throw new Error(`Overpass API error: ${response.statusText}`);
            }

            const data = await response.json();
            return data.elements || [];
        } catch (error) {
            console.error(`Attempt failed: ${error.message}`);
            retries--;
            if (retries === 0) throw error;
            console.log(`Retrying in 20 seconds...`);
            await new Promise(r => setTimeout(r, 20000));
        }
    }
}

async function main() {
    try {
        console.log('Starting offline data fetch...');

        let allElements = [];
        let seenIds = new Set();

        for (const query of LOCATION_QUERIES) {
            const elements = await fetchFromOverpass(query);

            for (const el of elements) {
                if (!seenIds.has(el.id)) {
                    seenIds.add(el.id);
                    allElements.push(el);
                }
            }

            // Wait a bit to avoid rate limiting
            await new Promise(r => setTimeout(r, 15000));
        }

        console.log(`Successfully fetched and merged ${allElements.length} unique elements.`);

        const dataDir = path.join(__dirname, '..', 'src', 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        const placesPath = path.join(dataDir, 'offline_places.json');
        fs.writeFileSync(placesPath, JSON.stringify({ elements: allElements }, null, 2));
        console.log(`Wrote places to ${placesPath}`);

        const metadataPath = path.join(dataDir, 'offline_metadata.json');
        const metadata = { lastUpdated: new Date().toISOString() };
        fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
        console.log(`Wrote metadata to ${metadataPath}`);

        console.log('Done.');
    } catch (error) {
        console.error('Failed to fetch offline data:', error);
        process.exit(1);
    }
}

main();
