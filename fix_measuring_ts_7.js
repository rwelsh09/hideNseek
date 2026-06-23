import fs from 'fs';

let content = fs.readFileSync('src/maps/questions/measuring.ts', 'utf-8');

const search = `        case "mcdonalds":
        case "seven11":
        case "rail-measure":
        case "museum-full":
        case "hospital-full":
        case "cinema-full":
        case "library-full":
        case "golf_course-full":
        case "custom-measure": {
            const boundaryData = await determineMeasuringBoundary(question);`;

const replace = `        case "museum-full":
        case "hospital-full":
        case "cinema-full":
        case "library-full":
        case "golf_course-full":
        case "custom-measure": {
            const boundaryData = await determineMeasuringBoundary(question);`;

content = content.replace(search, replace);
fs.writeFileSync('src/maps/questions/measuring.ts', content);
