import { useEffect, useState } from "react";
import { getApiErrorMessage } from "../api/apiClient";
import { createPatient, updatePatient } from "../api/patientApi";

function getInitialForm() {
  return {
    firstName: "",
    lastName: "",
    birthDate: "",
    gender: "unknown",
    phone: "",
    email: ""
  };
}

function PatientForm({ editingPatient, onPatientSaved, onCancelEdit }) {
  const [form, setForm] = useState(getInitialForm());
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = Boolean(editingPatient);

  useEffect(() => {
    if (editingPatient) {
      setForm({
        firstName: editingPatient.firstName || "",
        lastName: editingPatient.lastName || "",
        birthDate: editingPatient.birthDate || "",
        gender: editingPatient.gender || "unknown",
        phone: editingPatient.phone || "",
        email: editingPatient.email || ""
      });
    } else {
      setForm(getInitialForm());
    }

    setError("");
    setSuccessMessage("");
  }, [editingPatient]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value
    }));
  }

  function validateForm() {
    if (!form.firstName.trim()) {
      return "First name is required.";
    }

    if (!form.lastName.trim()) {
      return "Last name is required.";
    }

    if (!form.birthDate) {
      return "Birth date is required.";
    }

    const today = new Date().toISOString().slice(0, 10);

    if (form.birthDate > today) {
      return "Birth date cannot be in the future.";
    }

    if (!["male", "female", "other", "unknown"].includes(form.gender)) {
      return "Gender must be male, female, other, or unknown.";
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
        await updatePatient(editingPatient.id, form);
        setSuccessMessage("Patient updated successfully.");
      } else {
        await createPatient(form);
        setSuccessMessage("Patient created successfully.");
        setForm(getInitialForm());
      }

      onPatientSaved();
    } catch (error) {
      setError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="patient-form" onSubmit={handleSubmit}>
      <div className="form-title-row">
        <div>
          <h3>{isEditMode ? "Edit Patient" : "Create Patient"}</h3>
          <p className="subtle">
            {isEditMode
              ? "Update demographic details on the FHIR Patient resource."
              : "Create a new FHIR Patient resource for this challenge app."}
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

      <div className="patient-form-grid">
        <label>
          First Name
          <input
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            placeholder="Jane"
          />
        </label>

        <label>
          Last Name
          <input
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            placeholder="Smith"
          />
        </label>

        <label>
          Birth Date
          <input
            type="date"
            name="birthDate"
            value={form.birthDate}
            onChange={handleChange}
          />
        </label>

        <label>
          Gender
          <select name="gender" value={form.gender} onChange={handleChange}>
            <option value="unknown">Unknown</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>
        </label>

        <label>
          Phone
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="8085551234"
          />
        </label>

        <label>
          Email
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="patient@example.com"
          />
        </label>
      </div>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? isEditMode
            ? "Updating..."
            : "Creating..."
          : isEditMode
            ? "Update patient"
            : "Create patient"}
      </button>
    </form>
  );
}

export default PatientForm;