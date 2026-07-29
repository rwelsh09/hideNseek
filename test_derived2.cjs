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
    return exclusiveStations.length > 0 && exclusiveStations.every(f => disabledStations.has(f.properties.name));
  });
}

function toggleLine(line) {
  const disabledLines = getDisabledLines();
  const isCurrentlyDisabled = disabledLines.includes(line);

  if (isCurrentlyDisabled) {
    // Enable the line
    const newDisabledLines = disabledLines.filter(l => l !== line);

    // Evaluate every station
    data.features.forEach(f => {
      const lines = getLines(f);
      if (lines.length > 0) {
        // A station is disabled if ALL of its lines are in newDisabledLines
        const shouldBeDisabled = lines.every(l => newDisabledLines.includes(l));
        if (shouldBeDisabled) {
          disabledStations.add(f.properties.name);
        } else {
          disabledStations.delete(f.properties.name);
        }
      }
    });
  } else {
    // Disable the line
    const newDisabledLines = [...disabledLines, line];

    // Evaluate every station
    data.features.forEach(f => {
      const lines = getLines(f);
      if (lines.length > 0) {
        // A station is disabled if ALL of its lines are in newDisabledLines
        const shouldBeDisabled = lines.every(l => newDisabledLines.includes(l));
        if (shouldBeDisabled) {
          disabledStations.add(f.properties.name);
        } else {
          disabledStations.delete(f.properties.name);
        }
      }
    });
  }
}

console.log("Initial disabled lines:", getDisabledLines());
toggleLine("Red Line");
console.log("After toggling Red Line:", getDisabledLines());
console.log("Disabled stations (subset):", Array.from(disabledStations).slice(0, 5));

toggleLine("Blue Line");
console.log("After toggling Blue Line:", getDisabledLines());
const disabledAfterBoth = Array.from(disabledStations);
console.log("Shared stations disabled?", disabledAfterBoth.includes("City Hall")); // City hall has Red and Blue
console.log("City Hall lines:", getLines(data.features.find(f => f.properties.name === "City Hall")));

toggleLine("Red Line");
console.log("After toggling Red Line back ON:", getDisabledLines());
console.log("Shared station disabled?", disabledStations.has("City Hall"));
