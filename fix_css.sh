#!/bin/bash

# Remove the last two overly broad rules and add a precise one for sheet/dialog close buttons
sed -i '/\.driver-active \[data-state="open"\] button\[aria-label="Close sidebar"\],/d' src/styles/globals.css
sed -i '/\.driver-active \[data-state="open"\] button {/d' src/styles/globals.css

# Make sure we add back the closing brace and the correct rules
# Wait, let's just do a clean replace using git checkout and then a precise append.
git checkout src/styles/globals.css
sed -i '/.driver-active \[data-state="open"\] button\[aria-label="Close sidebar"\],/d' src/styles/globals.css
sed -i 's/\.driver-active \[data-state="open"\] button {/\.driver-active [data-state="open"] > button:has(span.sr-only) {\n/' src/styles/globals.css
