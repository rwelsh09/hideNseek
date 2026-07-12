import { z } from "zod";

const ordinaryBaseQuestionSchema = z.object({
    lat: z.number(),
    lng: z.number(),
    drag: z.boolean().default(true),
    collapsed: z.boolean().default(false),
    doubledPenalty: z.boolean().default(false),
});

const radiusQuestionSchema = ordinaryBaseQuestionSchema.extend({
    radius: z.number().default(50),
});

const parsed = radiusQuestionSchema.parse({
    lat: 10,
    lng: 10,
    radius: 1,
    doubledPenalty: true
});
console.log(parsed);
