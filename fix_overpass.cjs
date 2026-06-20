const fs = require('fs');
let code = fs.readFileSync('src/maps/api/overpass.ts', 'utf8');

const regex = /export const fetchCoastline = async \(\) => \{[\s\S]*?\};\n\n/;
code = code.replace(regex, '');

fs.writeFileSync('src/maps/api/overpass.ts', code);
