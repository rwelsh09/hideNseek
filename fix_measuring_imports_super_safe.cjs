const fs = require('fs');
let code = fs.readFileSync('src/maps/questions/measuring.ts', 'utf8');

code = code.replace(/import type \{ Feature, MultiPolygon \} from "geojson";\n/, '');
code = code.replace(/    connectToSeparateLines,\n    groupObjects,\n/, '');
code = code.replace(/import _ from "lodash";\n/, '');

fs.writeFileSync('src/maps/questions/measuring.ts', code);
