function getOfficialName(patient) {
  const names = patient.name || [];
  return names.find((name) => name.use === "official") || names[0] || {};
}

function mapFhirPatientToDto(patient) {
  const name = getOfficialName(patient);

  const given = Array.isArray(name.given) ? name.given : [];
  const firstName = given[0] || "";
  const lastName = name.family || "";

  return {
    id: patient.id,
    firstName,
    lastName,
    fullName: [firstName, lastName].filter(Boolean).join(" ") || "Unknown Patient",
    birthDate: patient.birthDate || null,
    gender: patient.gender || "unknown",
    active: patient.active !== false,
    phone:
      patient.telecom?.find((item) => item.system === "phone")?.value || "",
    email:
      patient.telecom?.find((item) => item.system === "email")?.value || ""
  };
}

function mapDtoToFhirPatient(payload, existingPatient = {}) {
  const telecom = [];

  if (payload.phone) {
    telecom.push({
      system: "phone",
      value: payload.phone
    });
  }

  if (payload.email) {
    telecom.push({
      system: "email",
      value: payload.email
    });
  }

  return {
    ...existingPatient,
    resourceType: "Patient",
    active: existingPatient.active ?? true,
    name: [
      {
        use: "official",
        family: payload.lastName,
        given: [payload.firstName]
      }
    ],
    birthDate: payload.birthDate,
    gender: payload.gender,
    telecom
  };
}

module.exports = {
  mapFhirPatientToDto,
  mapDtoToFhirPatient
};
