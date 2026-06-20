const fs = require('fs');
let code = fs.readFileSync('src/maps/questions/measuring.ts', 'utf8');

code = code.replace(/    fetchCoastline,\n/, '');
code = code.replace(/        case "highspeed-measure-shinkansen": \{[\s\S]*?            return \[highSpeedBase\(features\)\];\n        \}\n/, '');

const coastlineStart = '        case "coastline": {';
const cityStart = '        case "city":';
const coastlineEndIdx = code.indexOf(cityStart);
const coastlineStartIdx = code.indexOf(coastlineStart);
if (coastlineStartIdx !== -1 && coastlineEndIdx !== -1) {
    code = code.slice(0, coastlineStartIdx) + code.slice(coastlineEndIdx);
}

code = code.replace(/        case "city":\n            return \[\n                pointBase\(\n                    osmtogeojson\(\n                        await findPlacesInZone\(\n                            '\[place=city\]\["population"~"\^\[1-9\]\+\[0-9\]\{6\}\$"\]',\n                            "Finding cities\.\.\.",\n                        \),\n                    \)\.features,\n                \),\n            \];\n/, '');

code = code.replace(/        case "peak-full":\n/, '');
code = code.replace(/        case "consulate-full":\n/, '');
code = code.replace(/        case "peak":\n/, '');
code = code.replace(/        case "consulate":\n/, '');

// Also need to remove the references to these in the type checks if there are any array includes.
// Let's check `if (["peak", ...].includes(question.type))`
code = code.replace(/"peak",\n/g, '');
code = code.replace(/"consulate",\n/g, '');

fs.writeFileSync('src/maps/questions/measuring.ts', code);
