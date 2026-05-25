import { useState } from "react";
import PatientForm from "./PatientForm";
import PatientTable from "./PatientTable";

function PatientSection({
  patients,
  isPatientsLoading,
  patientsError,
  editingPatient,
  setEditingPatient,
  onPatientSaved,
  onDeactivatePatient,
  onRefreshPatients
}) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const shouldShowForm = isFormOpen || Boolean(editingPatient);

  function handleCreateClick() {
    setEditingPatient(null);
    setIsFormOpen((current) => !current);
  }

  function handleCloseForm() {
    setEditingPatient(null);
    setIsFormOpen(false);
  }

  return (
    <section className="panel workspace-card" id="patients">
      <div className="panel-header">
        <div>
          <h2>Patients</h2>
          <p className="subtle">FHIR Patient records available to the practitioner.</p>
        </div>

        <div className="table-actions">
          <button type="button" className="secondary-button" onClick={onRefreshPatients}>
            Refresh
          </button>
          <button type="button" onClick={handleCreateClick}>
            {shouldShowForm && !editingPatient ? "Hide form" : "New Patient"}
          </button>
        </div>
      </div>

      {shouldShowForm && (
        <PatientForm
          editingPatient={editingPatient}
          onPatientSaved={async () => {
            setIsFormOpen(false);
            await onPatientSaved();
          }}
          onCancelEdit={handleCloseForm}
        />
      )}

      <PatientTable
        patients={patients}
        isLoading={isPatientsLoading}
        error={patientsError}
        onEditPatient={(patient) => {
          setIsFormOpen(true);
          setEditingPatient(patient);
        }}
        onDeactivatePatient={onDeactivatePatient}
      />
    </section>
  );
}

export default PatientSection;
