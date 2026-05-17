const { z } = require("zod");

const fhirGenderSchema = z.enum(["male", "female", "other", "unknown"], {
  errorMap: () => ({
    message: "Gender must be male, female, other, or unknown."
  })
});

const birthDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Birth date must use YYYY-MM-DD format.")
  .refine((value) => {
    const inputDate = new Date(`${value}T00:00:00Z`);
    const today = new Date();
    return inputDate <= today;
  }, "Birth date cannot be in the future.");

const patientBodySchema = z.object({
  firstName: z.string().trim().min(1, "First name is required.").max(100),
  lastName: z.string().trim().min(1, "Last name is required.").max(100),
  birthDate: birthDateSchema,
  gender: fhirGenderSchema,
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  email: z.string().trim().email("Email must be valid.").optional().or(z.literal(""))
});

const createPatientSchema = z.object({
  body: patientBodySchema,
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const updatePatientSchema = z.object({
  body: patientBodySchema,
  params: z.object({
    patientId: z.string().trim().min(1, "Patient ID is required.")
  }),
  query: z.object({}).optional()
});

const patientIdParamSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    patientId: z.string().trim().min(1, "Patient ID is required.")
  }),
  query: z.object({}).optional()
});

const listPatientsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    name: z.string().trim().max(100).optional(),
    includeInactive: z.enum(["true", "false"]).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional()
  }).optional()
});

module.exports = {
  createPatientSchema,
  updatePatientSchema,
  patientIdParamSchema,
  listPatientsSchema,
  patientBodySchema
};
