import fs from 'fs';

let content = fs.readFileSync('src/components/ZoneSidebar.tsx', 'utf-8');

const search = `                        locationType: question.data.type as any,
                        drag: false,
                        color: "black",
                        collapsed: false,
                    },`;

const replace = `                        locationType: question.data.type as any,
                        drag: false,
                        color: "black",
                        collapsed: false,
                        showLabels: false,
                    },`;

content = content.replace(search, replace);
fs.writeFileSync('src/components/ZoneSidebar.tsx', content);
