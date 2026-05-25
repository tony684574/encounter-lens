function getVisitTypeCounts(appointments) {
  return appointments.reduce((counts, appointment) => {
    const visitType = appointment.visitType || "General Visit";
    counts[visitType] = (counts[visitType] || 0) + 1;
    return counts;
  }, {});
}

function getNextAppointment(appointments) {
  const scheduledAppointments = appointments
    .filter((appointment) => appointment.status === "scheduled")
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return scheduledAppointments[0] || null;
}

function ScheduleInsights({ appointments, selectedDate }) {
  const totalAppointments = appointments.length;

  const scheduledCount = appointments.filter(
    (appointment) => appointment.status === "scheduled"
  ).length;

  const completedCount = appointments.filter(
    (appointment) => appointment.status === "completed"
  ).length;

  const cancelledCount = appointments.filter(
    (appointment) => appointment.status === "cancelled"
  ).length;

  const nextAppointment = getNextAppointment(appointments);
  const visitTypeCounts = getVisitTypeCounts(appointments);
  const visitTypeEntries = Object.entries(visitTypeCounts);

  return (
    <section className="insights-panel">
      <div className="insights-header">
        <div>
          <p className="eyebrow">Clinic Day Snapshot</p>
          <h2>{selectedDate}</h2>
        </div>

        <p className="subtle">
          A quick operational view of the selected schedule.
        </p>
      </div>

      <div className="insight-card-grid">
        <article className="insight-card">
          <span className="insight-label">Appointments</span>
          <strong>{totalAppointments}</strong>
        </article>

        <article className="insight-card">
          <span className="insight-label">Scheduled</span>
          <strong>{scheduledCount}</strong>
        </article>

        <article className="insight-card">
          <span className="insight-label">Completed</span>
          <strong>{completedCount}</strong>
        </article>

        <article className="insight-card">
          <span className="insight-label">Cancelled</span>
          <strong>{cancelledCount}</strong>
        </article>
      </div>

      <div className="insights-detail-grid">
        <div className="insight-detail-card">
          <h3>Next Appointment</h3>

          {nextAppointment ? (
            <p>
              <strong>{nextAppointment.startTime}</strong>{" "}
              {nextAppointment.patientName || "Unknown Patient"} —{" "}
              {nextAppointment.visitType || "General Visit"}
            </p>
          ) : (
            <p className="subtle">No upcoming scheduled appointments.</p>
          )}
        </div>

        <div className="insight-detail-card">
          <h3>Visit Mix</h3>

          {visitTypeEntries.length ? (
            <div className="visit-type-list">
              {visitTypeEntries.map(([visitType, count]) => (
                <div className="visit-type-row" key={visitType}>
                  <span>{visitType}</span>
                  <strong>{count}</strong>
                </div>
              ))}
            </div>
          ) : (
            <p className="subtle">No visit types to summarize yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}

export default ScheduleInsights;