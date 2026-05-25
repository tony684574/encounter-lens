import { useState } from "react";
import { getApiErrorMessage } from "../api/apiClient";
import { createAppointment } from "../api/scheduleApi";

function AppointmentForm({ patients, selectedDate, onAppointmentCreated }) {
  const [form, setForm] = useState({
    patientFhirId: "",
    scheduledDate: selectedDate,
    startTime: "09:00",
    endTime: "09:30",
    visitType: "Diabetes Follow-Up"
  });

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!form.patientFhirId) {
      setError("Please choose a patient.");
      return;
    }

    if (!form.scheduledDate || !form.startTime || !form.endTime) {
      setError("Please provide a date, start time, and end time.");
      return;
    }

    if (form.endTime <= form.startTime) {
      setError("End time must be after start time.");
      return;
    }

    setIsSubmitting(true);

    try {
      await createAppointment(form);

      setSuccessMessage("Appointment created successfully.");

      setForm((current) => ({
        ...current,
        patientFhirId: "",
        startTime: "09:00",
        endTime: "09:30",
        visitType: "Diabetes Follow-Up"
      }));

      onAppointmentCreated(form.scheduledDate);
    } catch (error) {
      setError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="appointment-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <label>
          Patient
          <select
            name="patientFhirId"
            value={form.patientFhirId}
            onChange={handleChange}
          >
            <option value="">Select patient</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.fullName} — {patient.birthDate || "No birth date"}
              </option>
            ))}
          </select>
        </label>

        <label>
          Date
          <input
            type="date"
            name="scheduledDate"
            value={form.scheduledDate}
            onChange={handleChange}
          />
        </label>

        <label>
          Start
          <input
            type="time"
            name="startTime"
            value={form.startTime}
            onChange={handleChange}
          />
        </label>

        <label>
          End
          <input
            type="time"
            name="endTime"
            value={form.endTime}
            onChange={handleChange}
          />
        </label>

        <label className="wide-field">
          Visit Type
          <input
            name="visitType"
            value={form.visitType}
            onChange={handleChange}
            placeholder="Diabetes Follow-Up"
          />
        </label>
      </div>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create appointment"}
      </button>
    </form>
  );
}

export default AppointmentForm;