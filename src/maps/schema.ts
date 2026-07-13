import { z } from "zod";

import { ICON_COLORS } from "./api/constants";
import { PLACES } from "./placesConfig";

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
    colorA: iconColorSchema.default("gold"),
    colorB: iconColorSchema.default("blue"),
    /** Note that drag is now synonymous with unlocked */
    drag: z.boolean().default(true),
    collapsed: z.boolean().default(false),
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
    /** Note that drag is now synonymous with unlocked */
    drag: z.boolean().default(true),
    color: iconColorSchema.default(randomColor),
    collapsed: z.boolean().default(false),
    doubledPenalty: z.boolean().default(false),
});

const getDefaultUnit = () => {
    return "kilometers";
};

const photoQuestionSchema = ordinaryBaseQuestionSchema.extend({
    notes: z.string().default(""),
    type: z.string().default("camera"),
    color: iconColorSchema.default("blue"),
});

const radiusQuestionSchema = ordinaryBaseQuestionSchema.extend({
    radius: z.number().min(0, "You cannot have a negative radius").default(50),
    isCustom: z.boolean().default(false),
    unit: unitsSchema.default(getDefaultUnit),
    within: z.boolean().default(true),
    color: iconColorSchema.default("orange"),
});

const closestLocationsOne = z.union(
    PLACES.filter(p => p.type === "specific").map(p => z.literal(p.id).describe(p.labelPlural)) as any
);

const apiLocationSchema = closestLocationsOne;

const baseClosestQuestionSchema = ordinaryBaseQuestionSchema.extend({
    showLabels: z.boolean().default(false),
    radius: z.number().min(0, "You cannot have a negative radius").default(2),
    unit: unitsSchema.default(getDefaultUnit),
    color: iconColorSchema.default("violet"),
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

export const encompassingClosestQuestionSchema =
    baseClosestQuestionSchema.extend({
        locationType: apiLocationSchema,
        places: z.array(z.any()).optional(),
    });

export const closestQuestionSchema = closestQuestionSpecificSchemaOne;

const baseMatchQuestionSchema = ordinaryBaseQuestionSchema.extend({
    same: z.boolean().default(true),
    lengthComparison: z.enum(["shorter", "longer", "same"]).optional(),
    color: iconColorSchema.default("red"),
});

const ordinaryMatchQuestionSchema = baseMatchQuestionSchema.extend({
    type: z
        .union([
            ...PLACES.filter(p => p.type === "generic").map(p => z.literal(p.id).describe(p.label)),
            z
                .literal("same-neighbourhood")
                .describe("Neighbourhood (Same As Me)"),
            z
                .literal("same-first-letter-neighbourhood")
                .describe("Neighbourhood (Same First Letter)"),
            z
                .literal("same-first-letter-station")
                .describe("Station - Same First Letter"),
            z.literal("same-train-line").describe("Station - Same Line"),
        ] as any)
        .default("museum"),
});

export const matchQuestionSchema = ordinaryMatchQuestionSchema;

const baseMeasureQuestionSchema = ordinaryBaseQuestionSchema.extend({
    hiderCloser: z.boolean().default(true),
    color: iconColorSchema.default("green"),
});

const ordinaryMeasureQuestionSchema = baseMeasureQuestionSchema.extend({
    type: z
        .union([
            ...PLACES.filter(p => p.type === "generic").map(p => z.literal(p.id).describe(p.label)),
            z.literal("rail-measure").describe("Station"),
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
        id: z.literal("radius"),
        key: z.number().default(Math.random),
        data: radiusQuestionSchema,
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
export type RadiusQuestion = z.infer<typeof radiusQuestionSchema>;
export type HotColdQuestion = z.infer<typeof hotColdQuestionSchema>;
export type ClosestQuestion = z.infer<typeof closestQuestionSchema>;
export type APILocations = z.infer<typeof apiLocationSchema>;
export type MatchQuestion = z.infer<typeof matchQuestionSchema>;
export type MeasureQuestion = z.infer<typeof measureQuestionSchema>;
export type PhotoQuestion = z.infer<typeof photoQuestionSchema>;
export type Question = z.infer<typeof questionSchema>;
export type Questions = z.infer<typeof questionsSchema>;
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export type EncompassingClosestQuestionSchema = z.infer<
    typeof encompassingClosestQuestionSchema
>;
