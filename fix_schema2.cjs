const fs = require('fs');
let code = fs.readFileSync('src/maps/schema.ts', 'utf8');

const r1 = `const apiLocationSchema = z.union([
    z.literal("golf_course"),
    z.literal("consulate"),
    z.literal("park"),
    z.literal("peak"),
    tentacleLocationsOne,
]);`;
const r1_new = `const apiLocationSchema = z.union([
    z.literal("golf_course"),
    z.literal("park"),
    tentacleLocationsOne,
]);`;
code = code.replace(r1, r1_new);

const r2 = `const ordinaryMatchingQuestionSchema = baseMatchingQuestionSchema.extend({
    type: z
        .union([
            z
                .literal("major-city")
                .describe("Major City (1,000,000+ people) In Zone Question"),
            z
                .literal("peak-full")
                .describe("Mountain Question"),
            z
                .literal("museum-full")
                .describe("Museum Question"),
            z
                .literal("hospital-full")
                .describe("Hospital Question"),
            z
                .literal("cinema-full")
                .describe("Cinema Question"),
            z
                .literal("library-full")
                .describe("Library Question"),
            z
                .literal("golf_course-full")
                .describe("Golf Course Question"),
            z
                .literal("consulate-full")
                .describe("Foreign Consulate Question"),
            z
                .literal("park-full")
                .describe("Park Question"),
            z
                .literal("same-neighbourhood")
                .describe("Neighbourhood (Same As Me) Question"),
            z
                .literal("same-first-letter-neighbourhood")
                .describe("Neighbourhood (Same First Letter) Question"),
        ])
        .default("major-city"),
});`;
const r2_new = `const ordinaryMatchingQuestionSchema = baseMatchingQuestionSchema.extend({
    type: z.preprocess(
        (val) => ["major-city", "peak-full", "consulate-full"].includes(val as string) ? "museum-full" : val,
        z.union([
            z.literal("museum-full").describe("Museum Question"),
            z.literal("hospital-full").describe("Hospital Question"),
            z.literal("cinema-full").describe("Cinema Question"),
            z.literal("library-full").describe("Library Question"),
            z.literal("golf_course-full").describe("Golf Course Question"),
            z.literal("park-full").describe("Park Question"),
            z.literal("same-neighbourhood").describe("Neighbourhood (Same As Me) Question"),
            z.literal("same-first-letter-neighbourhood").describe("Neighbourhood (Same First Letter) Question"),
        ])
    ).default("museum-full"),
});`;
code = code.replace(r2, r2_new);

const r3 = `const homeGameMatchingQuestionsSchema = baseMatchingQuestionSchema.extend({
    type: z.union([
        z.literal("peak").describe("Mountain Question"),
        z.literal("museum").describe("Museum Question"),
        z.literal("hospital").describe("Hospital Question"),
        z.literal("cinema").describe("Cinema Question"),
        z.literal("library").describe("Library Question"),
        z.literal("golf_course").describe("Golf Course Question"),
        z.literal("consulate").describe("Foreign Consulate Question"),
        z.literal("park").describe("Park Question"),
    ]),
});`;
const r3_new = `const homeGameMatchingQuestionsSchema = baseMatchingQuestionSchema.extend({
    type: z.preprocess(
        (val) => ["peak", "consulate"].includes(val as string) ? "museum" : val,
        z.union([
            z.literal("museum").describe("Museum Question"),
            z.literal("hospital").describe("Hospital Question"),
            z.literal("cinema").describe("Cinema Question"),
            z.literal("library").describe("Library Question"),
            z.literal("golf_course").describe("Golf Course Question"),
            z.literal("park").describe("Park Question"),
        ])
    ),
});`;
code = code.replace(r3, r3_new);

const r4 = `const ordinaryMeasuringQuestionSchema = baseMeasuringQuestionSchema.extend({
    type: z
        .union([
            z.literal("coastline").describe("Coastline Question"),
            z
                .literal("city")
                .describe("Major City (1,000,000+ people) Question"),
            z
                .literal("highspeed-measure-shinkansen")
                .describe("High-Speed Rail Question"),
            z
                .literal("peak-full")
                .describe("Mountain Question"),
            z
                .literal("museum-full")
                .describe("Museum Question"),
            z
                .literal("hospital-full")
                .describe("Hospital Question"),
            z
                .literal("cinema-full")
                .describe("Cinema Question"),
            z
                .literal("library-full")
                .describe("Library Question"),
            z
                .literal("golf_course-full")
                .describe("Golf Course Question"),
            z
                .literal("consulate-full")
                .describe("Foreign Consulate Question"),
            z
                .literal("park-full")
                .describe("Park Question"),
        ])
        .default("coastline"),
});`;
const r4_new = `const ordinaryMeasuringQuestionSchema = baseMeasuringQuestionSchema.extend({
    type: z.preprocess(
        (val) => ["coastline", "city", "highspeed-measure-shinkansen", "peak-full", "consulate-full"].includes(val as string) ? "museum-full" : val,
        z.union([
            z.literal("museum-full").describe("Museum Question"),
            z.literal("hospital-full").describe("Hospital Question"),
            z.literal("cinema-full").describe("Cinema Question"),
            z.literal("library-full").describe("Library Question"),
            z.literal("golf_course-full").describe("Golf Course Question"),
            z.literal("park-full").describe("Park Question"),
        ])
    ).default("museum-full"),
});`;
code = code.replace(r4, r4_new);

const r5 = `const homeGameMeasuringQuestionsSchema = baseMeasuringQuestionSchema.extend({
    type: z.union([
        z.literal("peak").describe("Mountain Question"),
        z.literal("museum").describe("Museum Question"),
        z.literal("hospital").describe("Hospital Question"),
        z.literal("cinema").describe("Cinema Question"),
        z.literal("library").describe("Library Question"),
        z.literal("golf_course").describe("Golf Course Question"),
        z.literal("consulate").describe("Foreign Consulate Question"),
        z.literal("park").describe("Park Question"),
    ]),
});`;
const r5_new = `const homeGameMeasuringQuestionsSchema = baseMeasuringQuestionSchema.extend({
    type: z.preprocess(
        (val) => ["peak", "consulate"].includes(val as string) ? "museum" : val,
        z.union([
            z.literal("museum").describe("Museum Question"),
            z.literal("hospital").describe("Hospital Question"),
            z.literal("cinema").describe("Cinema Question"),
            z.literal("library").describe("Library Question"),
            z.literal("golf_course").describe("Golf Course Question"),
            z.literal("park").describe("Park Question"),
        ])
    ),
});`;
code = code.replace(r5, r5_new);

fs.writeFileSync('src/maps/schema.ts', code);
