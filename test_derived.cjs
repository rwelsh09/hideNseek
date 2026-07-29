const fs = require('fs');

const data = JSON.parse(fs.readFileSync('src/data/calgary_rapid_transit_network.json', 'utf8'));

const ALL_LINES = [
    "Blue Line",
    "MAX Green",
    "MAX Orange",
    "MAX Purple",
    "MAX Teal",
    "MAX Yellow",
    "Red Line"
];

// Helper to get lines for a station
function getLines(f) {
  return f.properties.lines || [];
}

let disabledStations = new Set();

function getDisabledLines() {
  return ALL_LINES.filter(line => {
    const exclusiveStations = data.features.filter(f => {
      const lines = getLines(f);
      return lines.length === 1 && lines[0] === line;
    });
    return exclusiveStations.every(f => disabledStations.has(f.properties.name));
  });
}

function toggleLine(line) {
  const disabled = getDisabledLines();
  const isCurrentlyDisabled = disabled.includes(line);

  if (isCurrentlyDisabled) {
    // Enable the line
    const newDisabledLines = disabled.filter(l => l !== line);
    // Enable all stations that have this line
    data.features.forEach(f => {
      if (getLines(f).includes(line)) {
        disabledStations.delete(f.properties.name);
      }
    });
  } else {
    // Disable the line
    const newDisabledLines = [...disabled, line];
    // Disable all stations whose lines are a subset of newDisabledLines
    data.features.forEach(f => {
      const lines = getLines(f);
      if (lines.length > 0 && lines.every(l => newDisabledLines.includes(l))) {
        disabledStations.add(f.properties.name);
      }
    });
  }
}

console.log("Initial disabled lines:", getDisabledLines());
toggleLine("Red Line");
console.log("After toggling Red Line:", getDisabledLines());
console.log("Disabled stations:", Array.from(disabledStations));

toggleLine("Blue Line");
console.log("After toggling Blue Line:", getDisabledLines());
const disabledAfterBoth = Array.from(disabledStations);
console.log("Shared stations disabled?", disabledAfterBoth.includes("City Hall")); // City hall has Red and Blue

toggleLine("Red Line");
console.log("After toggling Red Line back ON:", getDisabledLines());
console.log("Shared station disabled?", disabledStations.has("City Hall"));
