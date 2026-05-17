const express = require("express");
const patientController = require("../controllers/patientController");
const validateRequest = require("../middleware/validateRequest");
const wrapAsync = require("../utils/wrapAsync");
const {
  createPatientSchema,
  updatePatientSchema,
  patientIdParamSchema,
  listPatientsSchema
} = require("../validators/patientSchemas");

const router = express.Router();

router.get(
  "/",
  validateRequest(listPatientsSchema),
  wrapAsync(patientController.listPatients)
);

router.get(
  "/:patientId",
  validateRequest(patientIdParamSchema),
  wrapAsync(patientController.getPatient)
);

router.post(
  "/",
  validateRequest(createPatientSchema),
  wrapAsync(patientController.createPatient)
);

router.put(
  "/:patientId",
  validateRequest(updatePatientSchema),
  wrapAsync(patientController.updatePatient)
);

router.patch(
  "/:patientId/soft-delete",
  validateRequest(patientIdParamSchema),
  wrapAsync(patientController.softDeletePatient)
);

module.exports = router;
