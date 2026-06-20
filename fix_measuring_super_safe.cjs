const fs = require('fs');
let code = fs.readFileSync('src/maps/questions/measuring.ts', 'utf8');

// 1. Remove fetchCoastline import
code = code.replace(/    fetchCoastline,\n/, '');

// 2. Remove highspeed case
const idx1 = code.indexOf('        case "highspeed-measure-shinkansen": {');
const idx2 = code.indexOf('        case "coastline": {');
if (idx1 !== -1 && idx2 !== -1) {
    code = code.slice(0, idx1) + code.slice(idx2);
}

// 3. Remove coastline case
const idx3 = code.indexOf('        case "coastline": {');
const idx4 = code.indexOf('        case "city":');
if (idx3 !== -1 && idx4 !== -1) {
    code = code.slice(0, idx3) + code.slice(idx4);
}

// 4. Remove city case
const idx5 = code.indexOf('        case "city":');
const idx6 = code.indexOf('        case "peak-full":');
if (idx5 !== -1 && idx6 !== -1) {
    code = code.slice(0, idx5) + code.slice(idx6);
}

// 5. Remove simple cases
code = code.replace(/        case "peak-full":\n/, '');
code = code.replace(/        case "consulate-full":\n/, '');
code = code.replace(/        case "peak":\n/, '');
code = code.replace(/        case "consulate":\n/, '');

// 6. Remove imports only if unused now
code = code.replace(/ MultiPolygon, /g, ' ');
code = code.replace(/import osmtogeojson from "osmtogeojson";\n/, '');

// 7. Remove highSpeedBase
const idx7 = code.indexOf('const highSpeedBase = _.memoize(');
const idx8 = code.indexOf('const bboxExtension = (');
if (idx7 !== -1 && idx8 !== -1) {
    code = code.slice(0, idx7) + code.slice(idx8);
}

// 8. Remove bboxExtension
const idx9 = code.indexOf('const bboxExtension = (');
const idx10 = code.indexOf('export const determineMeasuringBoundary = async (');
if (idx9 !== -1 && idx10 !== -1) {
    code = code.slice(0, idx9) + code.slice(idx10);
}

// 9. Remove unused bBox inside determineMeasuringBoundary
// Wait, is bBox still used? The only uses of bBox were inside the `coastline` case logic!
// Let's check if bBox is still used.
if (code.indexOf('bBox') === code.lastIndexOf('bBox')) {
    code = code.replace(/    const bBox = turf\.bbox\(mapGeoJSON\.get\(\)!\);\n\n/, '');
}

fs.writeFileSync('src/maps/questions/measuring.ts', code);
