import { z } from "zod";

export const createWorkoutSchema = z.object({
  date: z.string().refine((s) => !isNaN(new Date(s).getTime()), { message: "Data inválida" }),
  durationSeconds: z.coerce.number().int().min(1, "Tempo deve ser pelo menos 1 segundo"),
  distanceKm: z.coerce.number().positive("Distância deve ser maior que zero"),
  ankleWeight: z.boolean(),
  ankleWeightKg: z.coerce.number().min(0).max(50).optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const updateWorkoutSchema = createWorkoutSchema.partial().extend({
  date: createWorkoutSchema.shape.date.optional(),
  durationSeconds: createWorkoutSchema.shape.durationSeconds.optional(),
  distanceKm: createWorkoutSchema.shape.distanceKm.optional(),
  ankleWeight: createWorkoutSchema.shape.ankleWeight.optional(),
  ankleWeightKg: createWorkoutSchema.shape.ankleWeightKg.optional(),
  notes: createWorkoutSchema.shape.notes.optional(),
});

export type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;
export type UpdateWorkoutInput = z.infer<typeof updateWorkoutSchema>;
