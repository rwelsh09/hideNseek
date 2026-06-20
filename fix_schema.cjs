const fs = require('fs');
let code = fs.readFileSync('src/maps/schema.ts', 'utf8');

// 1. apiLocationSchema
code = code.replace(/    z\.literal\("consulate"\),\n/g, '');
code = code.replace(/    z\.literal\("peak"\),\n/g, '');

// 2. ordinaryMatchingQuestionSchema
code = code.replace(/            z\n                \.literal\("major-city"\)\n                \.describe\("Major City \(1,000,000\+ people\) In Zone Question"\),\n/g, '');
code = code.replace(/            z\n                \.literal\("peak-full"\)\n                \.describe\("Mountain Question"\),\n/g, '');
code = code.replace(/            z\n                \.literal\("consulate-full"\)\n                \.describe\("Foreign Consulate Question"\),\n/g, '');

code = code.replace(
    /type: z\n        \.union\(\[/,
    `type: z.preprocess((val) => ["major-city", "peak-full", "consulate-full"].includes(val as string) ? "museum-full" : val, z.union([`
);
code = code.replace(/        \]\)\n        \.default\("major-city"\),/g, '        ])).default("museum-full"),');


// 3. homeGameMatchingQuestionsSchema
code = code.replace(/        z\.literal\("peak"\)\.describe\("Mountain Question"\),\n/g, '');
code = code.replace(/        z\.literal\("consulate"\)\.describe\("Foreign Consulate Question"\),\n/g, '');
code = code.replace(
    /type: z\.union\(\[/,
    `type: z.preprocess((val) => ["peak", "consulate"].includes(val as string) ? "museum" : val, z.union([`
);
code = code.replace(/        \]\),/g, '        ])),');


// 4. ordinaryMeasuringQuestionSchema
code = code.replace(/            z\.literal\("coastline"\)\.describe\("Coastline Question"\),\n/g, '');
code = code.replace(/            z\n                \.literal\("city"\)\n                \.describe\("Major City \(1,000,000\+ people\) Question"\),\n/g, '');
code = code.replace(/            z\n                \.literal\("highspeed-measure-shinkansen"\)\n                \.describe\("High-Speed Rail Question"\),\n/g, '');
code = code.replace(/            z\n                \.literal\("peak-full"\)\n                \.describe\("Mountain Question"\),\n/g, '');
code = code.replace(/            z\n                \.literal\("consulate-full"\)\n                \.describe\("Foreign Consulate Question"\),\n/g, '');

code = code.replace(
    /type: z\n        \.union\(\[/,
    `type: z.preprocess((val) => ["coastline", "city", "highspeed-measure-shinkansen", "peak-full", "consulate-full"].includes(val as string) ? "museum-full" : val, z.union([`
);
code = code.replace(/        \]\)\n        \.default\("coastline"\),/g, '        ])).default("museum-full"),');


// 5. homeGameMeasuringQuestionsSchema
code = code.replace(/        z\.literal\("peak"\)\.describe\("Mountain Question"\),\n/g, '');
code = code.replace(/        z\.literal\("consulate"\)\.describe\("Foreign Consulate Question"\),\n/g, '');

code = code.replace(
    /type: z\.union\(\[/,
    `type: z.preprocess((val) => ["peak", "consulate"].includes(val as string) ? "museum" : val, z.union([`
);
code = code.replace(/        \]\),/g, '        ])),');


fs.writeFileSync('src/maps/schema.ts', code);
