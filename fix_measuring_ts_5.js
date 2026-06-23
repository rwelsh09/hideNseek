import fs from 'fs';

let content = fs.readFileSync('src/maps/questions/measuring.ts', 'utf-8');

const search = `                toast.error(
                    \`Too many \${prettifyLocation(
                        location,
                        true,
                    ).toLowerCase()} found (\${data.elements.length}).\`,
                );`;

const replace = `                toast.error(
                    \`Too many \${prettifyLocation(
                        location as APILocations,
                        true,
                    ).toLowerCase()} found (\${data.elements.length}).\`,
                );`;

content = content.replace(search, replace);
fs.writeFileSync('src/maps/questions/measuring.ts', content);
