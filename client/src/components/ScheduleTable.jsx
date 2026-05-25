function ScheduleTable({ appointments, isLoading, error }) {
  if (isLoading) {
    return <p className="subtle">Loading schedule...</p>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!appointments.length) {
    return (
      <div className="empty-state">
        <p>No appointments scheduled for this date.</p>
      </div>
    );
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Time</th>
          <th>Patient</th>
          <th>Birth Date</th>
          <th>Gender</th>
          <th>Visit Type</th>
          <th>Status</th>
        </tr>
      </thead>

      <tbody>
        {appointments.map((appointment) => (
          <tr key={appointment.id}>
            <td>
              {appointment.startTime}–{appointment.endTime}
            </td>
            <td>{appointment.patientName}</td>
            <td>{appointment.birthDate || "—"}</td>
            <td>{appointment.gender || "unknown"}</td>
            <td>{appointment.visitType || "General Visit"}</td>
            <td>{appointment.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ScheduleTable;