import re

with open('src/components/Map.tsx', 'r') as f:
    content = f.read()

# Remove the Fullscreen button import and component usage
content = re.sub(r'import\s+\{\s*LeafletFullScreenButton\s*\}\s+from\s+"./LeafletFullScreenButton";\n', '', content)
content = content.replace('<LeafletFullScreenButton />', '')

# Remove MapPrint import and component usage
content = re.sub(r'import\s+\{\s*MapPrint\s*\}\s+from\s+"./MapPrint";\n', '', content)
# It looks like:
#                <MapPrint
#                    position="topright"
#                    sizeModes={["Current", "A4Portrait", "A4Landscape"]}
#                    hideControlContainer={false}
#                    hideClasses={[
#                        "leaflet-full-screen-specific-name",
#                        "leaflet-top",
#                        "leaflet-control-easyPrint",
#                        "leaflet-draw",
#                    ]}
#                    title="Print"
#                />
content = re.sub(r'<MapPrint[\s\S]*?/>', '', content)

with open('src/components/Map.tsx', 'w') as f:
    f.write(content)
