const express = require("express");
const scheduleController = require("../controllers/scheduleController");
const validateRequest = require("../middleware/validateRequest");
const wrapAsync = require("../utils/wrapAsync");
const {
  getScheduleSchema,
  createAppointmentSchema,
  updateAppointmentSchema,
  cancelAppointmentSchema
} = require("../validators/scheduleSchemas");

const router = express.Router();

router.get(
  "/",
  validateRequest(getScheduleSchema),
  wrapAsync(scheduleController.getSchedule)
);

router.post(
  "/appointments",
  validateRequest(createAppointmentSchema),
  wrapAsync(scheduleController.createAppointment)
);

router.put(
  "/appointments/:appointmentId",
  validateRequest(updateAppointmentSchema),
  wrapAsync(scheduleController.updateAppointment)
);

router.patch(
  "/appointments/:appointmentId/cancel",
  validateRequest(cancelAppointmentSchema),
  wrapAsync(scheduleController.cancelAppointment)
);

module.exports = router;
