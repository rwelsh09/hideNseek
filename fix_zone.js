import fs from 'fs';

let content = fs.readFileSync('src/components/ZoneSidebar.tsx', 'utf-8');

if (!content.includes('import { nearestToQuestion }')) {
     content = `import { nearestToQuestion } from "@/maps/api/overpass";\n` + content;
}
if (!content.includes('import { findTentacleLocations }')) {
     content = `import { findTentacleLocations } from "@/maps/api/overpass";\n` + content;
}

fs.writeFileSync('src/components/ZoneSidebar.tsx', content);
