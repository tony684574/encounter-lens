const {
  createAppointmentSchema
} = require("../src/validators/scheduleSchemas");

describe("schedule validation", () => {
  test("accepts a valid appointment", () => {
    const result = createAppointmentSchema.safeParse({
      body: {
        patientFhirId: "patient-123",
        scheduledDate: "2026-05-16",
        startTime: "09:00",
        endTime: "09:30",
        visitType: "Diabetes Follow-Up"
      },
      params: {},
      query: {}
    });

    expect(result.success).toBe(true);
  });

  test("rejects appointment when end time is before start time", () => {
    const result = createAppointmentSchema.safeParse({
      body: {
        patientFhirId: "patient-123",
        scheduledDate: "2026-05-16",
        startTime: "10:00",
        endTime: "09:30",
        visitType: "Diabetes Follow-Up"
      },
      params: {},
      query: {}
    });

    expect(result.success).toBe(false);
  });

  test("rejects invalid date format", () => {
    const result = createAppointmentSchema.safeParse({
      body: {
        patientFhirId: "patient-123",
        scheduledDate: "05/16/2026",
        startTime: "09:00",
        endTime: "09:30"
      },
      params: {},
      query: {}
    });

    expect(result.success).toBe(false);
  });
});
