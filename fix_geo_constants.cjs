const fs = require('fs');

// geo.ts
let codeGeo = fs.readFileSync('src/maps/api/geo.ts', 'utf8');
codeGeo = codeGeo.replace(/        case "peak":\n            return "Mountain";\n/, '');
codeGeo = codeGeo.replace(/        case "consulate":\n            return "Foreign Consulate";\n/, '');
fs.writeFileSync('src/maps/api/geo.ts', codeGeo);

// constants.ts
let codeConst = fs.readFileSync('src/maps/api/constants.ts', 'utf8');
codeConst = codeConst.replace(/    peak: "natural",\n/, '');
codeConst = codeConst.replace(/    consulate: "diplomatic",\n/, '');
fs.writeFileSync('src/maps/api/constants.ts', codeConst);
