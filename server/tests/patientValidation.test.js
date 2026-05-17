const { patientBodySchema } = require("../src/validators/patientSchemas");

describe("patient validation", () => {
  test("accepts a valid patient", () => {
    const result = patientBodySchema.safeParse({
      firstName: "Jane",
      lastName: "Smith",
      birthDate: "1972-04-14",
      gender: "female",
      phone: "8085551234",
      email: "jane@example.com"
    });

    expect(result.success).toBe(true);
  });

  test("rejects future birth date", () => {
    const result = patientBodySchema.safeParse({
      firstName: "Future",
      lastName: "Person",
      birthDate: "2999-01-01",
      gender: "female"
    });

    expect(result.success).toBe(false);
  });

  test("rejects invalid gender", () => {
    const result = patientBodySchema.safeParse({
      firstName: "Jane",
      lastName: "Smith",
      birthDate: "1972-04-14",
      gender: "two-genders"
    });

    expect(result.success).toBe(false);
  });

  test("rejects empty first name", () => {
    const result = patientBodySchema.safeParse({
      firstName: "",
      lastName: "Smith",
      birthDate: "1972-04-14",
      gender: "female"
    });

    expect(result.success).toBe(false);
  });
});
