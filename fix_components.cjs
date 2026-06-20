const fs = require('fs');

function processFile(path) {
    let code = fs.readFileSync(path, 'utf8');
    code = code.replace(/        case "peak":\n/, '');
    code = code.replace(/        case "consulate":\n/, '');
    fs.writeFileSync(path, code);
}

processFile('src/components/cards/measuring.tsx');
processFile('src/components/cards/matching.tsx');

let code = fs.readFileSync('src/components/ZoneSidebar.tsx', 'utf8');
code = code.replace(/            \(question\.data\.type === "peak" \|\|\n/, '            (');
code = code.replace(/                question\.data\.type === "consulate" \|\|\n/, '');
fs.writeFileSync('src/components/ZoneSidebar.tsx', code);
