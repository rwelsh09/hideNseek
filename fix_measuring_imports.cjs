const fs = require('fs');
let code = fs.readFileSync('src/maps/questions/measuring.ts', 'utf8');

// Remove MultiPolygon (only if no longer used)
code = code.replace(/, MultiPolygon/, '');

fs.writeFileSync('src/maps/questions/measuring.ts', code);
