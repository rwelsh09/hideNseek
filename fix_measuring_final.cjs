const fs = require('fs');
let code = fs.readFileSync('src/maps/questions/measuring.ts', 'utf8');

// Remove fetchCoastline
code = code.replace(/    fetchCoastline,\n/, '');

// Remove coastline case entirely
code = code.replace(/        case "coastline": \{[\s\S]*?            \];\n        \}\n/, '');

// Remove highspeed-measure-shinkansen case entirely
code = code.replace(/        case "highspeed-measure-shinkansen": \{[\s\S]*?        \}\n/, '');

// Remove city case entirely
code = code.replace(/        case "city":\n            return \[\n                turf\.combine\([\s\S]*?                \)\.features\[0\],\n            \];\n/, '');

// Remove simple cases
code = code.replace(/        case "peak-full":\n/, '');
code = code.replace(/        case "consulate-full":\n/, '');
code = code.replace(/        case "peak":\n/, '');
code = code.replace(/        case "consulate":\n/, '');

fs.writeFileSync('src/maps/questions/measuring.ts', code);
