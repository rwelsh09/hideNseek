const fs = require('fs');

const data = JSON.parse(fs.readFileSync('src/data/calgary_rapid_transit_network.json', 'utf8'));

// MOCK: No exclusive stations for Red Line
// data.features.forEach(f => {
//   if (f.properties.lines && f.properties.lines.length === 1 && f.properties.lines[0] === 'Red Line') {
//     f.properties.lines.push('Fake Line');
//   }
// });

const ALL_LINES = Array.from(new Set(data.features.flatMap(f => f.properties.lines || []))).sort();

function extractStationLines(s) {
  return s.properties.lines || [];
}

function extractStationId(s) {
  return s.properties.name; // mock
}

const stations = data.features;
let disabledStationsSet = new Set();

function getDisabledLines() {
  return ALL_LINES.filter(line => {
    const exclusiveStations = stations.filter(s => {
        const lines = extractStationLines(s);
        return lines.length === 1 && lines[0] === line;
    });
    if (exclusiveStations.length === 0) {
         const stationsOnLine = stations.filter(s => extractStationLines(s).includes(line));
         return stationsOnLine.every(s => disabledStationsSet.has(extractStationId(s)));
    }
    return exclusiveStations.every(s => disabledStationsSet.has(extractStationId(s)));
  });
}

function toggleLine(line) {
    const disabledLines = getDisabledLines();
    const isCurrentlyDisabled = disabledLines.includes(line);
    const newDisabledLines = isCurrentlyDisabled
        ? disabledLines.filter(l => l !== line)
        : [...disabledLines, line];

    stations.forEach(station => {
        const stationLines = extractStationLines(station);
        if (stationLines.length === 0) return;

        if (stationLines.includes(line)) {
            const shouldBeDisabled = stationLines.every(l => newDisabledLines.includes(l));
            const stationId = extractStationId(station);
            if (shouldBeDisabled) {
                disabledStationsSet.add(stationId);
            } else {
                disabledStationsSet.delete(stationId);
            }
        }
    });
}

console.log("Initial disabled lines:", getDisabledLines());
toggleLine("Red Line");
console.log("After toggling Red Line:", getDisabledLines());
toggleLine("Blue Line");
console.log("After toggling Blue Line:", getDisabledLines());
console.log("Is City Hall disabled?", disabledStationsSet.has("City Hall"));
toggleLine("MAX Purple");
console.log("After toggling MAX Purple:", getDisabledLines());
console.log("Is City Hall disabled?", disabledStationsSet.has("City Hall"));
