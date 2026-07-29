const fs = require('fs');

const data = JSON.parse(fs.readFileSync('src/data/calgary_rapid_transit_network.json', 'utf8'));

const lines = new Set();
data.features.forEach(f => {
  if (f.properties.lines) {
    f.properties.lines.forEach(l => lines.add(l));
  }
});

lines.forEach(line => {
  const exclusive = data.features.filter(f => f.properties.lines && f.properties.lines.length === 1 && f.properties.lines[0] === line);
  console.log(`${line}: ${exclusive.length} exclusive stations`);
});
