import * as turf from '@turf/turf';
import fs from 'fs/promises';

const OVERPASS_API = "https://overpass-api.de/api/interpreter";
const USER_AGENT = "HideNSeek-OfflineDataFetcher/1.0 (contact: info@example.com)";

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, options, maxRetries = 3) {
    let delayMs = 15000;
    for (let i = 0; i < maxRetries; i++) {
        try {
            console.log(`Fetching from Overpass API (Attempt ${i + 1}/${maxRetries})...`);
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            if (data.remark && data.remark.includes('runtime error')) {
                throw new Error(`Overpass API remark: ${data.remark}`);
            }
            return data;
        } catch (error) {
            console.error(`Attempt ${i + 1} failed: ${error.message}`);
            if (i < maxRetries - 1) {
                console.log(`Waiting ${delayMs / 1000} seconds before retrying...`);
                await sleep(delayMs);
                delayMs *= 2; // exponential backoff
            } else {
                throw error;
            }
        }
    }
}

async function getFilters() {
    const placesContent = await fs.readFile('src/maps/placesConfig.ts', 'utf8');
    const filters = [
        '["leisure"="golf_course"]',
        '["admin_level"="10"]'
    ];

    // Simple parsing using regex to extract id, tag, type, specificLocation
    const regex = /\{([^}]+)\}/g;
    let match;
    while ((match = regex.exec(placesContent)) !== null) {
        const itemStr = match[1];

        const idMatch = itemStr.match(/id:\s*["']([^"']+)["']/);
        const tagMatch = itemStr.match(/tag:\s*["']([^"']+)["']/);
        const typeMatch = itemStr.match(/type:\s*["']([^"']+)["']/);
        const specificMatch = itemStr.match(/specificLocation:\s*['"](.*?)['"](,|\s*$)/);

        if (idMatch && typeMatch) {
            if (typeMatch[1] === 'specific' && specificMatch) {
                filters.push(specificMatch[1]);
            } else if (typeMatch[1] === 'generic' && tagMatch) {
                filters.push(`["${tagMatch[1]}"="${idMatch[1]}"]`);
            }
        }
    }

    // Remove duplicates
    return [...new Set(filters)];
}

async function main() {
    try {
        const filters = await getFilters();
        console.log("Using filters:", filters);

        console.log('Reading boundary data...');
        const boundaryData = JSON.parse(await fs.readFile('src/data/calgary_boundary.json', 'utf8'));
        const featureCollection = turf.featureCollection(boundaryData);
        const bbox = turf.bbox(featureCollection);
        // Overpass bbox format is: south,west,north,east
        const bboxString = `${bbox[1]},${bbox[0]},${bbox[3]},${bbox[2]}`;

        console.log(`Calculated bbox: ${bboxString}`);

        const queryStmts = filters.map(f => `nwr${f}(${bboxString});`).join('\n  ');

        const overpassQuery = `
[out:json][timeout:90];
(
  ${queryStmts}
);
out geom;
`;

        console.log('Executing Overpass Query:');
        console.log(overpassQuery);

        console.log('Applying pre-query delay of 15s...');
        await sleep(15000);

        const data = await fetchWithRetry(OVERPASS_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': USER_AGENT
            },
            body: `data=${encodeURIComponent(overpassQuery)}`
        }, 5);

        if (!data || !data.elements || data.elements.length === 0) {
            throw new Error('No data or empty elements array returned from Overpass API.');
        }

        console.log(`Successfully fetched ${data.elements.length} elements.`);

        await fs.writeFile('src/data/offline_places.json', JSON.stringify(data, null, 2));
        console.log('Saved to src/data/offline_places.json');

        const metadata = {
            lastUpdated: new Date().toISOString()
        };
        await fs.writeFile('src/data/offline_metadata.json', JSON.stringify(metadata, null, 2));
        console.log('Saved to src/data/offline_metadata.json');

    } catch (error) {
        console.error('Script failed:', error);
        process.exit(1);
    }
}

main();
