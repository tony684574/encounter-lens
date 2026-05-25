import { useEffect, useState } from "react";
import { getApiErrorMessage } from "../api/apiClient";
import { getPatients } from "../api/patientApi";
import { getScheduleByDate } from "../api/scheduleApi";
import PatientTable from "../components/PatientTable";
import ScheduleTable from "../components/ScheduleTable";

function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function PractitionerHomePage() {
  const storedUser = localStorage.getItem("encounterLensUser");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const [selectedDate, setSelectedDate] = useState(getTodayDateString());

  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);

  const [scheduleError, setScheduleError] = useState("");
  const [patientsError, setPatientsError] = useState("");

  const [isScheduleLoading, setIsScheduleLoading] = useState(false);
  const [isPatientsLoading, setIsPatientsLoading] = useState(false);

  function handleLogout() {
    localStorage.removeItem("encounterLensToken");
    localStorage.removeItem("encounterLensUser");
    window.location.href = "/login";
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
          <button type="button" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>

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

          <ScheduleTable
            appointments={appointments}
            isLoading={isScheduleLoading}
            error={scheduleError}
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