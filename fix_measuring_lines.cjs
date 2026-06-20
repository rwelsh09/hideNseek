const fs = require('fs');
let lines = fs.readFileSync('src/maps/questions/measuring.ts', 'utf8').split('\n');

// Drop 91 to 158
lines.splice(90, 68);

fs.writeFileSync('src/maps/questions/measuring.ts', lines.join('\n'));
