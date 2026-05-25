function PatientTable({
  patients,
  isLoading,
  error,
  onEditPatient,
  onDeactivatePatient
}) {
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
                  <button
                    type="button"
                    className="danger-button"
                    onClick={() => onDeactivatePatient(patient)}
                  >
                    Deactivate
                  </button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default PatientTable;