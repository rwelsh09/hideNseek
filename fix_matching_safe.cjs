const fs = require('fs');
let code = fs.readFileSync('src/maps/questions/matching.ts', 'utf8');

// 1. major-city in findMatchingPlaces
const idx1 = code.indexOf('        case "major-city": {');
const idx2 = code.indexOf('        case "peak-full":');
if (idx1 !== -1 && idx2 !== -1) {
    code = code.slice(0, idx1) + code.slice(idx2);
}

// 2. peak-full and consulate-full in findMatchingPlaces
code = code.replace(/        case "peak-full":\n/, '');
code = code.replace(/        case "consulate-full":\n/, '');

// 3. peak and consulate in generateMatchDescription
code = code.replace(/            case "peak":\n/, '');
code = code.replace(/            case "consulate":\n/, '');

// 4. major-city, peak-full, consulate-full in checkMatchingBoundary
code = code.replace(/            case "major-city":\n/, '');
code = code.replace(/            case "peak-full":\n/, '');
code = code.replace(/            case "consulate-full":\n/, '');

fs.writeFileSync('src/maps/questions/matching.ts', code);
