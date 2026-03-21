import { z } from "zod";

export const favouritePropertyParamSchema = z.object({
  propertyId: z.coerce.number().int().positive("propertyId must be a positive integer"),
});
