import { z } from "zod";

import { ICON_COLORS } from "./api/constants";

export const NO_GROUP = "NO_GROUP";

export const determineUnionizedStrings = (
    obj:
        | z.ZodUnion<any>
        | z.ZodLiteral<any>
        | z.ZodDefault<any>
        | z.ZodEffects<any>,
): z.ZodLiteral<any>[] => {
    if (obj instanceof z.ZodUnion) {
        return obj.options.flatMap((option: any) =>
            determineUnionizedStrings(option),
        );
    } else if (obj instanceof z.ZodLiteral) {
        return [obj];
    } else if (obj instanceof z.ZodDefault) {
        return determineUnionizedStrings(obj._def.innerType);
    } else if (obj instanceof z.ZodEffects) {
        return determineUnionizedStrings(obj.innerType());
    }
    return [];
};

const unitsSchema = z.preprocess(
    (val) => (val === "miles" ? "kilometers" : val),
    z.union([z.literal("kilometers"), z.literal("meters")]),
);

const iconColorSchema = z.union([
    z.literal("green"),
    z.literal("black"),
    z.literal("blue"),
    z.literal("gold"),
    z.literal("grey"),
    z.literal("orange"),
    z.literal("red"),
    z.literal("violet"),
]);

type IconColor = z.infer<typeof iconColorSchema>;

const randomColor = () =>
    (Object.keys(ICON_COLORS) as IconColor[])[
        Math.floor(Math.random() * Object.keys(ICON_COLORS).length)
    ];

const randomColorExcluding = (excluded: IconColor[] = []) => {
    const options = (Object.keys(ICON_COLORS) as IconColor[]).filter(
        (color) => !excluded.includes(color),
    );

    return options[Math.floor(Math.random() * options.length)];
};

const thermometerQuestionSchema = z
    .object({
        latA: z
            .number()
            .min(-90, "Latitude must not overlap with the poles")
            .max(90, "Latitude must not overlap with the poles"),
        lngA: z
            .number()
            .min(-180, "Longitude must not overlap with the antemeridian")
            .max(180, "Longitude must not overlap with the antemeridian"),
        latB: z
            .number()
            .min(-90, "Latitude must not overlap with the poles")
            .max(90, "Latitude must not overlap with the poles"),
        lngB: z
            .number()
            .min(-180, "Longitude must not overlap with the antemeridian")
            .max(180, "Longitude must not overlap with the antemeridian"),
        warmer: z.boolean().default(true),
        colorA: iconColorSchema.default(() => randomColorExcluding(["green"])),
        colorB: iconColorSchema.default(() => randomColorExcluding(["green"])),
        /** Note that drag is now synonymous with unlocked */
        drag: z.boolean().default(true),
        collapsed: z.boolean().default(false),
    })
    .transform((question) => {
        if (question.colorA === question.colorB) {
            question.colorB = "green";
        }

        return question;
    });

const ordinaryBaseQuestionSchema = z.object({
    lat: z
        .number()
        .min(-90, "Latitude must not overlap with the poles")
        .max(90, "Latitude must not overlap with the poles"),
    lng: z
        .number()
        .min(-180, "Longitude must not overlap with the antemeridian")
        .max(180, "Longitude must not overlap with the antemeridian"),
    /** Note that drag is now synonymous with unlocked */
    drag: z.boolean().default(true),
    color: iconColorSchema.default(randomColor),
    collapsed: z.boolean().default(false),
});

const getDefaultUnit = () => {
    return "kilometers";
};

const photoQuestionSchema = ordinaryBaseQuestionSchema.extend({
    notes: z.string().default(""),
    type: z.string().default("camera"),
});

const radiusQuestionSchema = ordinaryBaseQuestionSchema.extend({
    radius: z.number().min(0, "You cannot have a negative radius").default(50),
    unit: unitsSchema.default(getDefaultUnit),
    within: z.boolean().default(true),
});

const tentacleLocationsOne = z.union([
    z.literal("museum").describe("Museums"),
    z.literal("hospital").describe("Hospitals"),
    z.literal("cinema").describe("Movie Theaters"),
    z.literal("library").describe("Libraries"),
    z.literal("mcdonalds").describe("McDonald's"),
    z.literal("seven11").describe("7-Eleven"),
    z.literal("timhortons").describe("Tim Hortons"),
    z.literal("pub").describe("Pubs / Bars"),
]);

const apiLocationSchema = z.union([
    z.literal("golf_course"),
    tentacleLocationsOne,
]);

const baseClosestQuestionSchema = ordinaryBaseQuestionSchema.extend({
    showLabels: z.boolean().default(false),
    radius: z.number().min(0, "You cannot have a negative radius").default(2),
    unit: unitsSchema.default(getDefaultUnit),
    location: z
        .union([
            z.object({
                type: z.literal("Feature"),
                geometry: z.object({
                    type: z.literal("Point"),
                    coordinates: z.array(z.number()),
                }),
                id: z.union([z.string(), z.number(), z.undefined()]).optional(),
                properties: z
                    .object({
                        name: z.any(),
                        osm_id: z.any().optional(),
                    })
                    .catchall(z.any()),
            }),
            z.literal(false),
        ])
        .default(false),
});
const tentacleQuestionSpecificSchemaOne = baseClosestQuestionSchema.extend({
    locationType: tentacleLocationsOne,
    places: z.array(z.any()).optional(),
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const encompassingClosestQuestionSchema = baseClosestQuestionSchema.extend({
    locationType: apiLocationSchema,
    places: z.array(z.any()).optional(),
});

export const tentacleQuestionSchema = tentacleQuestionSpecificSchemaOne;

const baseMatchQuestionSchema = ordinaryBaseQuestionSchema.extend({
    same: z.boolean().default(true),
    lengthComparison: z.enum(["shorter", "longer", "same"]).optional(),
});

const ordinaryMatchQuestionSchema = baseMatchQuestionSchema.extend({
    type: z
        .union([
            z.literal("museum-full").describe("Museum Question"),
            z.literal("hospital-full").describe("Hospital Question"),
            z.literal("cinema-full").describe("Cinema Question"),
            z.literal("library-full").describe("Library Question"),
            z.literal("golf_course-full").describe("Golf Course Question"),
            z
                .literal("same-neighbourhood")
                .describe("Neighbourhood (Same As Me) Question"),
            z
                .literal("same-first-letter-neighbourhood")
                .describe("Neighbourhood (Same First Letter) Question"),
            z
                .literal("same-first-letter-station")
                .describe("Station Starts With Same Letter Question"),
            z
                .literal("same-length-station")
                .describe("Station Has Same Length Question"),
            z
                .literal("same-train-line")
                .describe("Station On Same Train Line Question"),
        ])
        .default("museum-full"),
});

export const matchingQuestionSchema = ordinaryMatchQuestionSchema;

const baseMeasureQuestionSchema = ordinaryBaseQuestionSchema.extend({
    hiderCloser: z.boolean().default(true),
});

const ordinaryMeasureQuestionSchema = baseMeasureQuestionSchema.extend({
    type: z
        .union([
            z.literal("museum-full").describe("Museum Question"),
            z.literal("hospital-full").describe("Hospital Question"),
            z.literal("cinema-full").describe("Cinema Question"),
            z.literal("library-full").describe("Library Question"),
            z.literal("golf_course-full").describe("Golf Course Question"),
            z.literal("mcdonalds").describe("McDonald's Question"),
            z.literal("seven11").describe("7-Eleven Question"),
            z.literal("rail-measure").describe("Train Station Question"),
        ])
        .default("museum-full"),
});

export const measuringQuestionSchema = ordinaryMeasureQuestionSchema;

export const questionSchema = z.union([
    z.object({
        id: z.literal("photos"),
        key: z.number().default(Math.random),
        data: photoQuestionSchema,
    }),

    z.object({
        id: z.literal("radius"),
        key: z.number().default(Math.random),
        data: radiusQuestionSchema,
    }),
    z.object({
        id: z.literal("hot-cold"),
        key: z.number().default(Math.random),
        data: thermometerQuestionSchema,
    }),
    z.object({
        id: z.literal("closest"),
        key: z.number().default(Math.random),
        data: tentacleQuestionSchema,
    }),
    z.object({
        id: z.literal("measure"),
        key: z.number().default(Math.random),
        data: measuringQuestionSchema,
    }),
    z.object({
        id: z.literal("match"),
        key: z.number().default(Math.random),
        data: matchingQuestionSchema,
    }),
]);

export const questionsSchema = z.array(questionSchema);

export type Units = z.infer<typeof unitsSchema>;
export type RadiusQuestion = z.infer<typeof radiusQuestionSchema>;
export type HotColdQuestion = z.infer<typeof thermometerQuestionSchema>;
export type ClosestQuestion = z.infer<typeof tentacleQuestionSchema>;
export type APILocations = z.infer<typeof apiLocationSchema>;
export type MatchQuestion = z.infer<typeof matchingQuestionSchema>;
export type MeasureQuestion = z.infer<typeof measuringQuestionSchema>;
export type PhotosQuestion = z.infer<typeof photoQuestionSchema>;
export type Question = z.infer<typeof questionSchema>;
export type Questions = z.infer<typeof questionsSchema>;
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export type TraditionalClosestQuestion = z.infer<
    typeof tentacleQuestionSpecificSchemaOne
>;
export type EncompassingClosestQuestionSchema = z.infer<
    typeof encompassingClosestQuestionSchema
>;
