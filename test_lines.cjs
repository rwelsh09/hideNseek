const fs = require('fs');

const data = JSON.parse(fs.readFileSync('src/data/calgary_rapid_transit_network.json', 'utf8'));

const allLines = new Set();
data.features.forEach(f => {
  if (f.properties.lines) {
    f.properties.lines.forEach(l => allLines.add(l));
  }
});
console.log(Array.from(allLines).sort());
