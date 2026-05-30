const { z } = require("zod");

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must use YYYY-MM-DD format.");

const timeSchema = z
  .string()
  .regex(/^\d{2}:\d{2}$/, "Time must use HH:mm format.");

const appointmentStatusSchema = z.enum([
  "scheduled",
  "checked-in",
  "completed",
  "cancelled",
  "no-show"
]);

const appointmentBodySchema = z
  .object({
    patientFhirId: z.string().trim().min(1, "Patient is required."),
    scheduledDate: dateSchema,
    startTime: timeSchema,
    endTime: timeSchema,
    visitType: z.string().trim().max(100).optional().or(z.literal(""))
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time.",
    path: ["endTime"]
  });

const getScheduleSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    date: dateSchema
  })
});

const getScheduleRangeSchema = z
  .object({
    body: z.object({}).optional(),
    params: z.object({}).optional(),
    query: z.object({
      startDate: dateSchema,
      endDate: dateSchema
    })
  })
  .refine((data) => data.query.endDate >= data.query.startDate, {
    message: "End date must be on or after start date.",
    path: ["query", "endDate"]
  })
  .refine(
    (data) => {
      const start = new Date(`${data.query.startDate}T00:00:00Z`);
      const end = new Date(`${data.query.endDate}T00:00:00Z`);
      const diffDays = (end - start) / (1000 * 60 * 60 * 24);

      return diffDays <= 45;
    },
    {
      message: "Schedule range cannot be greater than 45 days.",
      path: ["query", "endDate"]
    }
  );

const createAppointmentSchema = z.object({
  body: appointmentBodySchema,
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const updateAppointmentSchema = z.object({
  body: z
    .object({
      scheduledDate: dateSchema,
      startTime: timeSchema,
      endTime: timeSchema,
      visitType: z.string().trim().max(100).optional().or(z.literal("")),
      status: appointmentStatusSchema
    })
    .refine((data) => data.endTime > data.startTime, {
      message: "End time must be after start time.",
      path: ["endTime"]
    }),
  params: z.object({
    appointmentId: z.coerce.number().int().positive()
  }),
  query: z.object({}).optional()
});

const cancelAppointmentSchema = z.object({
  body: z.object({
    reason: z.string().trim().max(255).optional()
  }),
  params: z.object({
    appointmentId: z.coerce.number().int().positive()
  }),
  query: z.object({}).optional()
});

module.exports = {
  getScheduleSchema,
  getScheduleRangeSchema,
  createAppointmentSchema,
  updateAppointmentSchema,
  cancelAppointmentSchema
};
