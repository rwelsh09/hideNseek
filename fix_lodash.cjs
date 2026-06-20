const fs = require('fs');
let code = fs.readFileSync('src/maps/questions/measuring.ts', 'utf8');

code = `import _ from "lodash";\n` + code;

fs.writeFileSync('src/maps/questions/measuring.ts', code);
