const fs = require('fs');

const data = JSON.parse(fs.readFileSync('src/data/calgary_rapid_transit_network.json', 'utf8'));

// We actually want a "line toggle" to toggle all stations that are EXCLUSIVELY on disabled lines
// So if Red Line and Blue line are disabled, City Hall (Red, Blue, Purple) is STILL ENABLED
// because it's on Purple line, which is NOT disabled.

// The requirement is:
// "We would need to make sure that we remove zones that are only in that line, not ones that I have multiple zones. For example, if I choose to disable the red line, if there's a zone that is in the red and the blue then that zone should remain but if I was to choose to disable the red line and the blue line well then that zone that is in the red line and the blue line will then be disabled."
