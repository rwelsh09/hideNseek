const fs = require('fs');
let code = fs.readFileSync('src/maps/questions/measuring.ts', 'utf8');

// Remove highSpeedBase
code = code.replace(/const highSpeedBase = _\.memoize\(\s*\(\s*features: Feature\[\]\s*\) => \{[\s\S]*?\}\s*\);\s*/, '');

// Remove bboxExtension
code = code.replace(/const bboxExtension = \([\s\S]*?\}\s*;\s*/, '');

// Remove bBox
code = code.replace(/    const bBox = turf\.bbox\(mapGeoJSON\.get\(\)!\);\s*/, '');

// Remove osmtogeojson import
code = code.replace(/import osmtogeojson from "osmtogeojson";\s*/, '');

// Remove MultiPolygon import
code = code.replace(/, MultiPolygon/, '');

fs.writeFileSync('src/maps/questions/measuring.ts', code);
