import { useState } from "react";

function PatientTable({
  patients,
  isLoading,
  error,
  onEditPatient,
  onDeactivatePatient
}) {
  const [openMenuPatientId, setOpenMenuPatientId] = useState(null);

  function toggleMenu(patientId) {
    setOpenMenuPatientId((currentId) =>
      currentId === patientId ? null : patientId
    );
  }

  if (isLoading) {
    return <p className="subtle">Loading patients...</p>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!patients.length) {
    return (
      <div className="empty-state">
        <p>No patients found.</p>
      </div>
    );
  }

  return (
    <div className="table-scroll">
        <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Birth Date</th>
            <th>Gender</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {patients.map((patient) => (
            <tr key={patient.id}>
              <td>{patient.fullName}</td>
              <td>{patient.birthDate || "—"}</td>
              <td>{patient.gender || "unknown"}</td>
              <td>{patient.active ? "Active" : "Inactive"}</td>
              <td>
                <div className="table-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => onEditPatient(patient)}
                  >
                    Edit
                  </button>

                  {patient.active && (
                    <div 
                      className="row-menu"
                      onMouseLeave={() => setOpenMenuPatientId(null)}
                    >
                      <button
                        type="button"
                        className="danger-menu-button"
                        onClick={() => toggleMenu(patient.id)}
                        aria-label={`Open actions for ${patient.fullName}`}
                        aria-expanded={openMenuPatientId === patient.id}
                      >
                        ▾
                      </button>

                      {openMenuPatientId === patient.id && (
                        <div className="row-menu-popover">
                          <button
                            type="button"
                            className="row-menu-danger-item"
                            onClick={() => {
                              setOpenMenuPatientId(null);
                              onDeactivatePatient(patient);
                            }}
                          >
                            Deactivate
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PatientTable;