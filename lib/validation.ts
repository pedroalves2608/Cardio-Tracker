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

// --- Treino de força ---
const strengthSetSchema = z.object({
  exerciseName: z.string().min(1, "Nome do exercício é obrigatório"),
  setNumber: z.coerce.number().int().min(1),
  reps: z.coerce.number().int().min(0),
  weightKg: z.coerce.number().min(0),
});

export const createStrengthSessionSchema = z.object({
  date: z.string().refine((s) => !isNaN(new Date(s).getTime()), { message: "Data inválida" }),
  notes: z.string().optional().nullable(),
  sets: z.array(strengthSetSchema).min(1, "Adicione pelo menos uma série"),
});

export const updateStrengthSessionSchema = z.object({
  date: z.string().refine((s) => !isNaN(new Date(s).getTime())).optional(),
  notes: z.string().optional().nullable(),
  sets: z.array(strengthSetSchema).min(1).optional(),
});

export type CreateStrengthSessionInput = z.infer<typeof createStrengthSessionSchema>;
export type UpdateStrengthSessionInput = z.infer<typeof updateStrengthSessionSchema>;

// --- Templates de treino ---
const templateExerciseSchema = z.object({
  exerciseName: z.string().min(1, "Nome do exercício é obrigatório"),
  order: z.coerce.number().int().min(0),
  setsCount: z.coerce.number().int().min(1),
  defaultReps: z.coerce.number().int().min(0).optional().nullable(),
  defaultWeightKg: z.coerce.number().min(0).optional().nullable(),
});

export const createStrengthTemplateSchema = z.object({
  name: z.string().min(1, "Nome do template é obrigatório"),
  exercises: z.array(templateExerciseSchema).min(1, "Adicione pelo menos um exercício"),
});

export const updateStrengthTemplateSchema = z.object({
  name: z.string().min(1).optional(),
  exercises: z.array(templateExerciseSchema).min(1).optional(),
});

export type CreateStrengthTemplateInput = z.infer<typeof createStrengthTemplateSchema>;
export type UpdateStrengthTemplateInput = z.infer<typeof updateStrengthTemplateSchema>;

export const fromTemplateSchema = z.object({
  templateId: z.string().uuid(),
  date: z.string().refine((s) => !isNaN(new Date(s).getTime())).optional(),
});
