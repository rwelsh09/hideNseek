const fs = require('fs');
let code = fs.readFileSync('src/maps/questions/measuring.ts', 'utf8');

code = code.replace(/        case "peak-full":\n/, '');
code = code.replace(/        case "consulate-full":\n/, '');
code = code.replace(/        case "peak":\n/, '');
code = code.replace(/        case "consulate":\n/, '');

// Find array includes for peak
code = code.replace(/"peak",\n/g, '');
code = code.replace(/"consulate",\n/g, '');

// Clean imports
code = code.replace(/    fetchCoastline,\n/, '');
code = code.replace(/import osmtogeojson from "osmtogeojson";\n/, '');
code = code.replace(/ MultiPolygon, /g, ' ');

// Remove highSpeedBase
code = code.replace(/const highSpeedBase = _\.memoize\([\s\S]*?\};\n\}\);\n\n/, '');

// Remove bboxExtension
code = code.replace(/const bboxExtension = \([\s\S]*?\}\);\n/, '');

fs.writeFileSync('src/maps/questions/measuring.ts', code);
