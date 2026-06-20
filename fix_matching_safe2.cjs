const fs = require('fs');
let code = fs.readFileSync('src/maps/questions/matching.ts', 'utf8');

code = code.replace(/            "peak",\n/, '');
code = code.replace(/            "consulate",\n/, '');

fs.writeFileSync('src/maps/questions/matching.ts', code);
