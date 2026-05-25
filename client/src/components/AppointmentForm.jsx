import { useEffect, useState } from "react";
import { getApiErrorMessage } from "../api/apiClient";
import {
  createAppointment,
  updateAppointment
} from "../api/scheduleApi";

function getInitialForm(selectedDate) {
  return {
    patientFhirId: "",
    scheduledDate: selectedDate,
    startTime: "09:00",
    endTime: "09:30",
    visitType: "Diabetes Follow-Up",
    status: "scheduled"
  };
}

function AppointmentForm({
  patients,
  selectedDate,
  editingAppointment,
  onAppointmentSaved,
  onCancelEdit
}) {
  const [form, setForm] = useState(getInitialForm(selectedDate));
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = Boolean(editingAppointment);

  useEffect(() => {
    if (editingAppointment) {
      setForm({
        patientFhirId: editingAppointment.patientFhirId,
        scheduledDate: editingAppointment.scheduledDate?.slice(0, 10) || selectedDate,
        startTime: editingAppointment.startTime,
        endTime: editingAppointment.endTime,
        visitType: editingAppointment.visitType || "",
        status: editingAppointment.status || "scheduled"
      });
    } else {
      setForm(getInitialForm(selectedDate));
    }

    setError("");
    setSuccessMessage("");
  }, [editingAppointment, selectedDate]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value
    }));
  }

  function validateForm() {
    if (!form.patientFhirId) {
      return "Please choose a patient.";
    }

    if (!form.scheduledDate || !form.startTime || !form.endTime) {
      return "Please provide a date, start time, and end time.";
    }

    if (form.endTime <= form.startTime) {
      return "End time must be after start time.";
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode) {
        await updateAppointment(editingAppointment.id, {
          scheduledDate: form.scheduledDate,
          startTime: form.startTime,
          endTime: form.endTime,
          visitType: form.visitType,
          status: form.status
        });

        setSuccessMessage("Appointment updated successfully.");
      } else {
        await createAppointment({
          patientFhirId: form.patientFhirId,
          scheduledDate: form.scheduledDate,
          startTime: form.startTime,
          endTime: form.endTime,
          visitType: form.visitType
        });

        setSuccessMessage("Appointment created successfully.");
      }

      onAppointmentSaved(form.scheduledDate);

      if (!isEditMode) {
        setForm(getInitialForm(form.scheduledDate));
      }
    } catch (error) {
      setError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="appointment-form" onSubmit={handleSubmit}>
      <div className="form-title-row">
        <div>
          <h3>{isEditMode ? "Edit Appointment" : "Create Appointment"}</h3>
          <p className="subtle">
            {isEditMode
              ? "Update the selected appointment."
              : "Schedule a patient for the selected clinic day."}
          </p>
        </div>

        {isEditMode && (
          <button
            type="button"
            className="secondary-button"
            onClick={onCancelEdit}
          >
            Stop editing
          </button>
        )}
      </div>

      <div className="form-grid">
        <label>
          Patient
          <select
            name="patientFhirId"
            value={form.patientFhirId}
            onChange={handleChange}
            disabled={isEditMode}
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

        {isEditMode && (
          <label className="wide-field">
            Status
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="scheduled">Scheduled</option>
              <option value="checked-in">Checked In</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no-show">No Show</option>
            </select>
          </label>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? isEditMode
            ? "Updating..."
            : "Creating..."
          : isEditMode
            ? "Update appointment"
            : "Create appointment"}
      </button>
    </form>
  );
}

export default AppointmentForm;