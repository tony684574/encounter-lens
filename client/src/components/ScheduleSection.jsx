import { useState } from "react";
import AppointmentForm from "./AppointmentForm";
import ScheduleTable from "./ScheduleTable";

function ScheduleSection({
  patients,
  appointments,
  selectedDate,
  isScheduleLoading,
  scheduleError,
  editingAppointment,
  setEditingAppointment,
  onAppointmentSaved,
  onCancelAppointment
}) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const shouldShowForm = isFormOpen || Boolean(editingAppointment);

  function handleCreateClick() {
    setEditingAppointment(null);
    setIsFormOpen((current) => !current);
  }

  function handleCloseForm() {
    setEditingAppointment(null);
    setIsFormOpen(false);
  }

  return (
    <section className="panel workspace-card" id="schedule">
      <div className="panel-header">
        <div>
          <h2>Schedule</h2>
          <p className="subtle">Create, update, and cancel appointments.</p>
        </div>

        <button type="button" onClick={handleCreateClick}>
          {shouldShowForm && !editingAppointment ? "Hide form" : "New Appointment"}
        </button>
      </div>

      {shouldShowForm && (
        <AppointmentForm
          patients={patients}
          selectedDate={selectedDate}
          editingAppointment={editingAppointment}
          onAppointmentSaved={(date) => {
            setIsFormOpen(false);
            onAppointmentSaved(date);
          }}
          onCancelEdit={handleCloseForm}
        />
      )}

      <ScheduleTable
        appointments={appointments}
        isLoading={isScheduleLoading}
        error={scheduleError}
        onEditAppointment={(appointment) => {
          setIsFormOpen(true);
          setEditingAppointment(appointment);
        }}
        onCancelAppointment={onCancelAppointment}
      />
    </section>
  );
}

export default ScheduleSection;
