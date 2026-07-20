import { z } from "zod";

import { PLACES } from "./placesConfig";

const determineUnionizedStrings = (
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

export const getSchemaOptions = (
    obj:
        | z.ZodUnion<any>
        | z.ZodLiteral<any>
        | z.ZodDefault<any>
        | z.ZodEffects<any>,
): Record<string, string> => {
    const options: Record<string, string> = {};
    const literals = determineUnionizedStrings(obj);
    for (const lit of literals) {
        options[lit.value] = lit.description || lit.value;
    }
    return options;
};

const unitsSchema = z.preprocess(
    (val) => (val === "miles" ? "kilometers" : val),
    z.union([z.literal("kilometers"), z.literal("meters")]),
);

const iconColourSchema = z.union([
    z.literal("green"),
    z.literal("black"),
    z.literal("blue"),
    z.literal("gold"),
    z.literal("grey"),
    z.literal("orange"),
    z.literal("red"),
    z.literal("violet"),
]);

const hotColdQuestionSchema = z.object({
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
    colourA: iconColourSchema.default("blue"),
    colourB: iconColourSchema.default("red"),
    locked: z.boolean().default(false),
    doubledPenalty: z.boolean().default(false),
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
    locked: z.boolean().default(false),
    colour: iconColourSchema.optional(),
    doubledPenalty: z.boolean().default(false),
});

const getDefaultUnit = () => {
    return "kilometers";
};

const photoQuestionSchema = ordinaryBaseQuestionSchema.extend({
    notes: z.string().default(""),
    type: z.string().default("camera"),
    colour: iconColourSchema.default("blue"),
});

const radarQuestionSchema = ordinaryBaseQuestionSchema.extend({
    radius: z.number().min(0, "You cannot have a negative radius").default(50),
    isCustom: z.boolean().default(false),
    unit: unitsSchema.default(getDefaultUnit),
    within: z.boolean().default(true),
    colour: iconColourSchema.default("orange"),
});

const closestLocationsOne = z.union(
    PLACES.filter((p) => p.type === "specific").map((p) =>
        z.literal(p.id).describe(p.labelPlural),
    ) as any,
);

const baseClosestQuestionSchema = ordinaryBaseQuestionSchema.extend({
    radius: z.number().min(0, "You cannot have a negative radius").default(2),
    unit: unitsSchema.default(getDefaultUnit),
    colour: iconColourSchema.default("violet"),
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
const closestQuestionSpecificSchemaOne = baseClosestQuestionSchema.extend({
    locationType: closestLocationsOne,
    places: z.array(z.any()).optional(),
});

export const closestQuestionSchema = closestQuestionSpecificSchemaOne;

const baseMatchQuestionSchema = ordinaryBaseQuestionSchema.extend({
    same: z.boolean().default(true),
    lengthComparison: z.enum(["shorter", "longer", "same"]).optional(),
    colour: iconColourSchema.default("red"),
});

const ordinaryMatchQuestionSchema = baseMatchQuestionSchema.extend({
    type: z
        .union([
            ...PLACES.filter((p) => p.type === "generic").map((p) =>
                z.literal(p.id).describe(p.label),
            ),
            z
                .literal("same-neighbourhood")
                .describe("Neighbourhood (Same As Me)"),
            z
                .literal("same-first-letter-neighbourhood")
                .describe("Neighbourhood (Same First Letter)"),
            z
                .literal("same-first-letter-station")
                .describe("Station/Stop Starts With Same Letter"),
            z.literal("same-train-line").describe("Station/Stop - Same Line"),
        ] as any)
        .default("museum"),
});

export const matchQuestionSchema = ordinaryMatchQuestionSchema;

const baseMeasureQuestionSchema = ordinaryBaseQuestionSchema.extend({
    hiderCloser: z.boolean().default(true),
    colour: iconColourSchema.default("green"),
});

const ordinaryMeasureQuestionSchema = baseMeasureQuestionSchema.extend({
    type: z
        .union([
            ...PLACES.filter((p) => p.type === "generic").map((p) =>
                z.literal(p.id).describe(p.label),
            ),
            z.literal("rail-measure").describe("Train Station"),
        ] as any)
        .default("museum"),
});

export const measureQuestionSchema = ordinaryMeasureQuestionSchema;

export const questionSchema = z.union([
    z.object({
        id: z.literal("photo"),
        key: z.number().default(Math.random),
        data: photoQuestionSchema,
    }),

    z.object({
        id: z.literal("radar"),
        key: z.number().default(Math.random),
        data: radarQuestionSchema,
    }),
    z.object({
        id: z.literal("hot/cold"),
        key: z.number().default(Math.random),
        data: hotColdQuestionSchema,
    }),
    z.object({
        id: z.literal("closest"),
        key: z.number().default(Math.random),
        data: closestQuestionSchema,
    }),
    z.object({
        id: z.literal("measure"),
        key: z.number().default(Math.random),
        data: measureQuestionSchema,
    }),
    z.object({
        id: z.literal("match"),
        key: z.number().default(Math.random),
        data: matchQuestionSchema,
    }),
]);

export const questionsSchema = z.array(questionSchema);

export type Units = z.infer<typeof unitsSchema>;
export type RadarQuestion = z.infer<typeof radarQuestionSchema>;
export type HotColdQuestion = z.infer<typeof hotColdQuestionSchema>;
export type ClosestQuestion = z.infer<typeof closestQuestionSchema>;
export type MatchQuestion = z.infer<typeof matchQuestionSchema>;
export type MeasureQuestion = z.infer<typeof measureQuestionSchema>;
export type PhotoQuestion = z.infer<typeof photoQuestionSchema>;
export type Question = z.infer<typeof questionSchema>;
export type Questions = z.infer<typeof questionsSchema>;
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
