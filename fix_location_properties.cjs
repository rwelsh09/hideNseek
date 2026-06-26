const fs = require('fs');

let tentacles = fs.readFileSync('src/components/cards/tentacles.tsx', 'utf8');

// I will add defensive checks for data.location.properties?.name instead of data.location.properties.name
tentacles = tentacles.replace(/data\.location \? data\.location\.properties\.name : "false"/, "data.location ? data.location.properties?.name : 'false'");
tentacles = tentacles.replace(/value=\{data\.location \? data\.location\.properties\.name : "false"\}/, "value={data.location ? data.location.properties?.name : 'false'}");

fs.writeFileSync('src/components/cards/tentacles.tsx', tentacles);
