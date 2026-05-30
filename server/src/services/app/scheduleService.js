const pool = require("../../db/pool");
const ApiError = require("../../utils/ApiError");
const patientFhirService = require("../fhir/patientFhirService");

async function getScheduleByDate(date) {
  const query = `
    SELECT
      id,
      patient_fhir_id AS "patientFhirId",
      scheduled_date AS "scheduledDate",
      to_char(start_time, 'HH24:MI') AS "startTime",
      to_char(end_time, 'HH24:MI') AS "endTime",
      visit_type AS "visitType",
      status
    FROM provider_schedule
    WHERE scheduled_date = $1
    ORDER BY start_time ASC
  `;

  const result = await pool.query(query, [date]);

  const appointments = await Promise.all(
    result.rows.map(async (row) => {
      try {
        const patient = await patientFhirService.getPatientById(row.patientFhirId);

        return {
          ...row,
          patientName: patient.fullName,
          birthDate: patient.birthDate,
          gender: patient.gender
        };
      } catch {
        return {
          ...row,
          patientName: "Unknown Patient",
          birthDate: null,
          gender: "unknown"
        };
      }
    })
  );

  return appointments;
}

async function getScheduleByDateRange(startDate, endDate) {
  const query = `
    SELECT
      id,
      patient_fhir_id AS "patientFhirId",
      scheduled_date AS "scheduledDate",
      to_char(start_time, 'HH24:MI') AS "startTime",
      to_char(end_time, 'HH24:MI') AS "endTime",
      visit_type AS "visitType",
      status
    FROM provider_schedule
    WHERE scheduled_date BETWEEN $1 AND $2
    ORDER BY scheduled_date ASC, start_time ASC
  `;

  const result = await pool.query(query, [startDate, endDate]);

  const appointments = await Promise.all(
    result.rows.map(async (row) => {
      try {
        const patient = await patientFhirService.getPatientById(row.patientFhirId);

        return {
          ...row,
          patientName: patient.fullName,
          birthDate: patient.birthDate,
          gender: patient.gender
        };
      } catch {
        return {
          ...row,
          patientName: "Unknown Patient",
          birthDate: null,
          gender: "unknown"
        };
      }
    })
  );

  return appointments;
}

async function assertNoOverlap({ scheduledDate, startTime, endTime, excludeAppointmentId = null }) {
  const values = [scheduledDate, startTime, endTime];
  let excludeClause = "";

  if (excludeAppointmentId) {
    values.push(excludeAppointmentId);
    excludeClause = `AND id != $${values.length}`;
  }

  const query = `
    SELECT id
    FROM provider_schedule
    WHERE scheduled_date = $1
      AND status != 'cancelled'
      AND start_time < $3
      AND end_time > $2
      ${excludeClause}
    LIMIT 1
  `;

  const result = await pool.query(query, values);

  if (result.rows.length > 0) {
    throw new ApiError(
      409,
      "CONFLICT",
      "This appointment overlaps with an existing appointment."
    );
  }
}

async function createAppointment(payload) {
  await patientFhirService.getPatientById(payload.patientFhirId);

  await assertNoOverlap({
    scheduledDate: payload.scheduledDate,
    startTime: payload.startTime,
    endTime: payload.endTime
  });

  const query = `
    INSERT INTO provider_schedule (
      patient_fhir_id,
      scheduled_date,
      start_time,
      end_time,
      visit_type,
      status
    )
    VALUES ($1, $2, $3, $4, $5, 'scheduled')
    RETURNING
      id,
      patient_fhir_id AS "patientFhirId",
      scheduled_date AS "scheduledDate",
      to_char(start_time, 'HH24:MI') AS "startTime",
      to_char(end_time, 'HH24:MI') AS "endTime",
      visit_type AS "visitType",
      status
  `;

  const values = [
    payload.patientFhirId,
    payload.scheduledDate,
    payload.startTime,
    payload.endTime,
    payload.visitType || null
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
}

async function updateAppointment(appointmentId, payload) {
  await assertNoOverlap({
    scheduledDate: payload.scheduledDate,
    startTime: payload.startTime,
    endTime: payload.endTime,
    excludeAppointmentId: appointmentId
  });

  const query = `
    UPDATE provider_schedule
    SET
      scheduled_date = $1,
      start_time = $2,
      end_time = $3,
      visit_type = $4,
      status = $5,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $6
    RETURNING
      id,
      patient_fhir_id AS "patientFhirId",
      scheduled_date AS "scheduledDate",
      to_char(start_time, 'HH24:MI') AS "startTime",
      to_char(end_time, 'HH24:MI') AS "endTime",
      visit_type AS "visitType",
      status
  `;

  const values = [
    payload.scheduledDate,
    payload.startTime,
    payload.endTime,
    payload.visitType || null,
    payload.status,
    appointmentId
  ];

  const result = await pool.query(query, values);

  if (result.rows.length === 0) {
    throw new ApiError(404, "NOT_FOUND", "Appointment was not found.");
  }

  return result.rows[0];
}

async function cancelAppointment(appointmentId) {
  const query = `
    UPDATE provider_schedule
    SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING id, status
  `;

  const result = await pool.query(query, [appointmentId]);

  if (result.rows.length === 0) {
    throw new ApiError(404, "NOT_FOUND", "Appointment was not found.");
  }

  return result.rows[0];
}

module.exports = {
  getScheduleByDate,
  getScheduleByDateRange,
  createAppointment,
  updateAppointment,
  cancelAppointment
};
