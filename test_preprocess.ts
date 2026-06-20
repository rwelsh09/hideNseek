import { z } from "zod";

const mySchema = z.object({
  type: z.preprocess(
    (val) => ["major-city"].includes(val as string) ? "museum-full" : val,
    z.union([
      z.literal("museum-full"),
      z.literal("park-full")
    ])
  ).default("museum-full")
});

console.log(mySchema.parse({ type: "major-city" }));
