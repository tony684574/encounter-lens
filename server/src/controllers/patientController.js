const patientFhirService = require("../services/fhir/patientFhirService");
const auditService = require("../services/app/auditService");

async function listPatients(req, res) {
  const query = req.validated.query || {};

  const patients = await patientFhirService.listPatients({
    name: query.name,
    includeInactive: query.includeInactive === "true",
    limit: query.limit || 20
  });

  res.json({
    success: true,
    data: { patients }
  });
}

async function getPatient(req, res) {
  const { patientId } = req.validated.params;

  const patient = await patientFhirService.getPatientById(patientId);

  res.json({
    success: true,
    data: { patient }
  });
}

async function createPatient(req, res) {
  const payload = req.validated.body;

  try {
    const patient = await patientFhirService.createPatient(payload);

    await auditService.logAudit({
      userId: req.user?.id,
      action: "CREATE_PATIENT",
      resourceType: "Patient",
      resourceId: patient.id,
      status: "success",
      message: "Patient created successfully.",
      requestPayload: payload,
      responsePayload: { id: patient.id }
    });

    res.status(201).json({
      success: true,
      data: { patient },
      message: "Patient created successfully."
    });
  } catch (error) {
    await auditService.logAudit({
      userId: req.user?.id,
      action: "CREATE_PATIENT",
      resourceType: "Patient",
      status: "failure",
      message: error.message,
      requestPayload: payload
    });

    throw error;
  }
}

async function updatePatient(req, res) {
  const { patientId } = req.validated.params;
  const payload = req.validated.body;

  try {
    const patient = await patientFhirService.updatePatient(patientId, payload);

    await auditService.logAudit({
      userId: req.user?.id,
      action: "UPDATE_PATIENT",
      resourceType: "Patient",
      resourceId: patientId,
      status: "success",
      message: "Patient updated successfully.",
      requestPayload: payload
    });

    res.json({
      success: true,
      data: { patient },
      message: "Patient updated successfully."
    });
  } catch (error) {
    await auditService.logAudit({
      userId: req.user?.id,
      action: "UPDATE_PATIENT",
      resourceType: "Patient",
      resourceId: patientId,
      status: "failure",
      message: error.message,
      requestPayload: payload
    });

    throw error;
  }
}

async function softDeletePatient(req, res) {
  const { patientId } = req.validated.params;

  try {
    const patient = await patientFhirService.softDeletePatient(patientId);

    await auditService.logAudit({
      userId: req.user?.id,
      action: "SOFT_DELETE_PATIENT",
      resourceType: "Patient",
      resourceId: patientId,
      status: "success",
      message: "Patient deactivated successfully."
    });

    res.json({
      success: true,
      data: {
        patientId: patient.id,
        active: patient.active
      },
      message: "Patient deactivated successfully."
    });
  } catch (error) {
    await auditService.logAudit({
      userId: req.user?.id,
      action: "SOFT_DELETE_PATIENT",
      resourceType: "Patient",
      resourceId: patientId,
      status: "failure",
      message: error.message
    });

    throw error;
  }
}

module.exports = {
  listPatients,
  getPatient,
  createPatient,
  updatePatient,
  softDeletePatient
};
