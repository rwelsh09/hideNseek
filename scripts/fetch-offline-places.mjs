import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BBOX = "50.8427,-114.3158,51.2124,-113.8599";
const USER_AGENT = "HideAndSeekApp/1.0 (DataFetcher)";
const DELAY_MS = 15000;

const QuestionSpecificLocation = {
    McDonalds: '["brand:wikidata"="Q38076"]',
    Seven11: '["brand:wikidata"="Q259340"]',
    TimHortons: '["brand:wikidata"="Q175106"]',
    Pub: '["amenity"~"^(pub|bar)$"]',
};

const STANDARD_TAGS = [
    '["amenity"="hospital"]',
    '["tourism"="museum"]',
    '["amenity"="cinema"]',
    '["amenity"="library"]',
    '["leisure"="golf_course"]'
];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function fetchQuery(queryStr) {
    const url = "https://overpass-api.de/api/interpreter";
    console.log(`Fetching: ${queryStr.replace(/\n/g, ' ')}`);
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": USER_AGENT
        },
        body: `data=${encodeURIComponent(queryStr)}`
    });

    if (!response.ok) {
        throw new Error(`Overpass API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
}

async function main() {
    const allElements = new Map();

    const addElements = (elements) => {
        for (const el of elements) {
            allElements.set(el.type + el.id, el);
        }
    };

    const centerQueries = [
        ...STANDARD_TAGS,
        ...Object.values(QuestionSpecificLocation)
    ];

    for (const tagQuery of centerQueries) {
        const query = `[out:json][timeout:25];\n(\n  nwr${tagQuery}(${BBOX});\n);\nout center;`;
        const data = await fetchQuery(query);
        addElements(data.elements || []);
        console.log(`Waiting ${DELAY_MS}ms...`);
        await sleep(DELAY_MS);
    }

    const geomQuery = `[out:json][timeout:25];\n(\n  nwr["admin_level"="10"](${BBOX});\n);\nout geom;`;
    const geomData = await fetchQuery(geomQuery);
    addElements(geomData.elements || []);

    const outData = {
        version: 0.6,
        generator: "Overpass API",
        elements: Array.from(allElements.values())
    };

    const outPath = path.join(__dirname, "../src/data/offline_places.json");
    fs.writeFileSync(outPath, JSON.stringify(outData, null, 2));
    console.log(`Saved ${allElements.size} elements to offline_places.json`);

    const metaPath = path.join(__dirname, "../src/data/offline_metadata.json");
    fs.writeFileSync(metaPath, JSON.stringify({ lastUpdated: new Date().toISOString() }, null, 2));
    console.log("Saved offline_metadata.json");
}

main().catch(console.error);
