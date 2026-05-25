import { useEffect, useState } from "react";
import { getApiErrorMessage } from "../api/apiClient";
import { getPatients } from "../api/patientApi";
import { getScheduleByDate } from "../api/scheduleApi";
import { cancelAppointment } from "../api/scheduleApi";
import PatientTable from "../components/PatientTable";
import ScheduleTable from "../components/ScheduleTable";
import AppointmentForm from "../components/AppointmentForm";
import ScheduleInsights from "../components/ScheduleInsights";
import {
  DEFAULT_TIME_ZONE,
  getSupportedTimeZones,
  getTodayDateString
} from "../utils/dateUtils";

function PractitionerHomePage() {
  const storedUser = localStorage.getItem("encounterLensUser");
  const user = storedUser ? JSON.parse(storedUser) : null;

const [selectedTimeZone, setSelectedTimeZone] = useState(DEFAULT_TIME_ZONE);
const [selectedDate, setSelectedDate] = useState(
  getTodayDateString(DEFAULT_TIME_ZONE)
);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);

  const [editingAppointment, setEditingAppointment] = useState(null);

  const [scheduleError, setScheduleError] = useState("");
  const [patientsError, setPatientsError] = useState("");

  const [isScheduleLoading, setIsScheduleLoading] = useState(false);
  const [isPatientsLoading, setIsPatientsLoading] = useState(false);

  function handleLogout() {
    localStorage.removeItem("encounterLensToken");
    localStorage.removeItem("encounterLensUser");
    window.location.href = "/login";
  }

  async function handleCancelAppointment(appointment) {
    const confirmed = window.confirm(
      `Cancel appointment for ${appointment.patientName || "this patient"} at ${appointment.startTime}?`
    );

    if (!confirmed) {
      return;
    }

    setScheduleError("");

    try {
      await cancelAppointment(appointment.id, "Cancelled from practitioner workspace");
      await loadSchedule(selectedDate);
    } catch (error) {
      setScheduleError(getApiErrorMessage(error));
    }
  }

  async function loadSchedule(date) {
    setIsScheduleLoading(true);
    setScheduleError("");

    try {
      const scheduleData = await getScheduleByDate(date);
      setAppointments(scheduleData.appointments);
    } catch (error) {
      setScheduleError(getApiErrorMessage(error));
    } finally {
      setIsScheduleLoading(false);
    }
  }

  async function loadPatients() {
    setIsPatientsLoading(true);
    setPatientsError("");

    try {
      const patientData = await getPatients({ limit: 20 });
      setPatients(patientData);
    } catch (error) {
      setPatientsError(getApiErrorMessage(error));
    } finally {
      setIsPatientsLoading(false);
    }
  }

  useEffect(() => {
    loadSchedule(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    loadPatients();
  }, []);

  return (
    <main className="app-shell">
      <header className="top-bar">
        <div>
          <p className="eyebrow">Encounter Lens</p>
          <h1>Practitioner Workspace</h1>
          <p className="subtle">
            Manage the day’s encounters from one calm clinical desk.
          </p>
        </div>

        <div className="top-bar-actions">
          <span>{user?.username || "Practitioner"}</span>
          
          <label className="compact-label">
            Time Zone
            <select
              value={selectedTimeZone}
              onChange={(event) => {
                const nextTimeZone = event.target.value;
                setSelectedTimeZone(nextTimeZone);
                setSelectedDate(getTodayDateString(nextTimeZone));
              }}
            >
              {getSupportedTimeZones().map((timeZone) => (
                <option key={timeZone.value} value={timeZone.value}>
                  {timeZone.label}
                </option>
              ))}
            </select>
          </label>
          
          <button type="button" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>
      <ScheduleInsights
        appointments={appointments}
        selectedDate={selectedDate}
      />
      <section className="dashboard-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Daily Schedule</h2>
              <p className="subtle">Appointments for the selected date.</p>
            </div>

            <label className="date-picker-label">
              Date
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
              />
            </label>
          </div>

          <AppointmentForm
            patients={patients}
            selectedDate={selectedDate}
            editingAppointment={editingAppointment}
            onAppointmentSaved={(date) => {
              setEditingAppointment(null);
              setSelectedDate(date);
              loadSchedule(date);
            }}
            onCancelEdit={() => setEditingAppointment(null)}
          />

          <ScheduleTable
            appointments={appointments}
            isLoading={isScheduleLoading}
            error={scheduleError}
            onEditAppointment={setEditingAppointment}
            onCancelAppointment={handleCancelAppointment}
          />
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Patients</h2>
              <p className="subtle">FHIR patients available to this app.</p>
            </div>

            <button type="button" onClick={loadPatients}>
              Refresh
            </button>
          </div>

          <PatientTable
            patients={patients}
            isLoading={isPatientsLoading}
            error={patientsError}
          />
        </section>
      </section>
    </main>
  );
}

export default PractitionerHomePage;