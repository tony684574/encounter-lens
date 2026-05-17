const {
  mapFhirPatientToDto,
  mapDtoToFhirPatient
} = require("../src/utils/fhirPatientMapper");

describe("FHIR patient mapper", () => {
  test("maps FHIR Patient to DTO", () => {
    const patient = {
      resourceType: "Patient",
      id: "abc123",
      active: true,
      name: [
        {
          use: "official",
          family: "Smith",
          given: ["Jane"]
        }
      ],
      birthDate: "1972-04-14",
      gender: "female"
    };

    const dto = mapFhirPatientToDto(patient);

    expect(dto).toEqual({
      id: "abc123",
      firstName: "Jane",
      lastName: "Smith",
      fullName: "Jane Smith",
      birthDate: "1972-04-14",
      gender: "female",
      active: true,
      phone: "",
      email: ""
    });
  });

  test("handles missing name gracefully", () => {
    const dto = mapFhirPatientToDto({
      resourceType: "Patient",
      id: "abc123"
    });

    expect(dto.fullName).toBe("Unknown Patient");
    expect(dto.gender).toBe("unknown");
    expect(dto.active).toBe(true);
  });

  test("maps DTO to FHIR Patient", () => {
    const fhirPatient = mapDtoToFhirPatient({
      firstName: "Jane",
      lastName: "Smith",
      birthDate: "1972-04-14",
      gender: "female",
      phone: "8085551234",
      email: "jane@example.com"
    });

    expect(fhirPatient.resourceType).toBe("Patient");
    expect(fhirPatient.name[0].family).toBe("Smith");
    expect(fhirPatient.gender).toBe("female");
    expect(fhirPatient.telecom).toHaveLength(2);
  });
});
