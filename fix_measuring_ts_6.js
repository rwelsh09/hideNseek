import fs from 'fs';

let content = fs.readFileSync('src/maps/questions/measuring.ts', 'utf-8');

const search = `                toast.error(
                    \`Too many \${prettifyLocation(
                        location as APILocations,
                        true,
                    ).toLowerCase()} found (\${data.elements.length}).\`,
                );`;

const replace = `                toast.error(
                    \`Too many \${prettifyLocation(
                        location as unknown as APILocations,
                        true,
                    ).toLowerCase()} found (\${data.elements.length}).\`,
                );`;

content = content.replace(search, replace);

const search2 = `            const data = await findPlacesInZone(
                \`[\${LOCATION_FIRST_TAG[location as APILocations]}=\${location}]\`,
                \`Finding \${prettifyLocation(location as APILocations, true).toLowerCase()}...\`,`;

const replace2 = `            const data = await findPlacesInZone(
                \`[\${LOCATION_FIRST_TAG[location as unknown as APILocations]}=\${location}]\`,
                \`Finding \${prettifyLocation(location as unknown as APILocations, true).toLowerCase()}...\`,`;

content = content.replace(search2, replace2);

fs.writeFileSync('src/maps/questions/measuring.ts', content);
