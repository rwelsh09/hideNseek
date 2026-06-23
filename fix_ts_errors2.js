import fs from 'fs';

let content = fs.readFileSync('src/components/ZoneSidebar.tsx', 'utf-8');

// Fix BLANK_GEOJSON import
content = content.replace(
    /import { BLANK_GEOJSON } from "@\/maps\/geo-utils\/blank";\n/g,
    `import { BLANK_GEOJSON } from "@/maps/api";\n`
);

// Fix findTentacleLocations import
content = content.replace(
    /import { findTentacleLocations } from "@\/maps\/questions\/tentacles";\n/g,
    ``
);
if (!content.includes('findTentacleLocations')) {
    // wait, it is used
}

// ensure findTentacleLocations is imported from @/maps/api/overpass
content = content.replace(
    /import {[\s\S]*?findPlacesInZone,[\s\S]*?findPlacesSpecificInZone,[\s\S]*?normalizeToStationFeatures,[\s\S]*?parseCustomStationsFromText,[\s\S]*?QuestionSpecificLocation,[\s\S]*?nearestToQuestion,[\s\S]*?} from "@\/maps\/api\/overpass";/,
    `import {
    findPlacesInZone,
    findPlacesSpecificInZone,
    normalizeToStationFeatures,
    parseCustomStationsFromText,
    QuestionSpecificLocation,
    nearestToQuestion,
    findTentacleLocations,
} from "@/maps/api/overpass";`
);

fs.writeFileSync('src/components/ZoneSidebar.tsx', content);

// measuring.ts - fix `const nearest = await nearestToQuestion(question as HomeGameMeasuringQuestions);` (line 325) or similar.
// Wait, measuring.ts error: Argument of type 'Location' is not assignable to parameter of type '"museum" | "hospital" | "cinema" | "library" | "golf_course"'.
// Ah wait! measuring.ts(90,25)
// Let's check line 90 in measuring.ts
