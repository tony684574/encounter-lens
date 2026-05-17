const scheduleService = require("../services/app/scheduleService");
const auditService = require("../services/app/auditService");

async function getSchedule(req, res) {
  const { date } = req.validated.query;

  const appointments = await scheduleService.getScheduleByDate(date);

  res.json({
    success: true,
    data: {
      date,
      appointments
    }
  });
}

async function createAppointment(req, res) {
  const payload = req.validated.body;

  try {
    const appointment = await scheduleService.createAppointment(payload);

    await auditService.logAudit({
      userId: req.user?.id,
      action: "CREATE_APPOINTMENT",
      resourceType: "Appointment",
      resourceId: String(appointment.id),
      status: "success",
      message: "Appointment created successfully.",
      requestPayload: payload
    });

    res.status(201).json({
      success: true,
      data: { appointment },
      message: "Appointment created successfully."
    });
  } catch (error) {
    await auditService.logAudit({
      userId: req.user?.id,
      action: "CREATE_APPOINTMENT",
      resourceType: "Appointment",
      status: "failure",
      message: error.message,
      requestPayload: payload
    });

    throw error;
  }
}

async function updateAppointment(req, res) {
  const { appointmentId } = req.validated.params;
  const payload = req.validated.body;

  const appointment = await scheduleService.updateAppointment(appointmentId, payload);

  res.json({
    success: true,
    data: { appointment },
    message: "Appointment updated successfully."
  });
}

async function cancelAppointment(req, res) {
  const { appointmentId } = req.validated.params;
  const appointment = await scheduleService.cancelAppointment(appointmentId);

  res.json({
    success: true,
    data: {
      appointmentId: appointment.id,
      status: appointment.status
    },
    message: "Appointment cancelled successfully."
  });
}

module.exports = {
  getSchedule,
  createAppointment,
  updateAppointment,
  cancelAppointment
};
