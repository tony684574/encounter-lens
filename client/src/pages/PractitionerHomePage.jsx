import { useEffect, useState } from "react";
import { getApiErrorMessage } from "../api/apiClient";
import { deactivatePatient, getPatients } from "../api/patientApi";
import { cancelAppointment, getScheduleByDate } from "../api/scheduleApi";
import PageHeader from "../components/PageHeader";
import PatientSection from "../components/PatientSection";
import ScheduleInsights from "../components/ScheduleInsights";
import ScheduleSection from "../components/ScheduleSection";
import PractitionerLayout from "../layouts/PractitionerLayout";
import { DEFAULT_TIME_ZONE, getTodayDateString } from "../utils/dateUtils";

function PractitionerHomePage() {
  const storedUser = localStorage.getItem("encounterLensUser");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const [selectedTimeZone, setSelectedTimeZone] = useState(DEFAULT_TIME_ZONE);
  const [selectedDate, setSelectedDate] = useState(
    getTodayDateString(DEFAULT_TIME_ZONE)
  );

  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [scheduleError, setScheduleError] = useState("");
  const [patientsError, setPatientsError] = useState("");
  const [isScheduleLoading, setIsScheduleLoading] = useState(false);
  const [isPatientsLoading, setIsPatientsLoading] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [editingPatient, setEditingPatient] = useState(null);

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

  async function handleCancelAppointment(appointment) {
    const confirmed = window.confirm(
      `Cancel appointment for ${appointment.patientName || "this patient"} at ${appointment.startTime}?`
    );

    if (!confirmed) return;

    setScheduleError("");

    try {
      await cancelAppointment(
        appointment.id,
        "Cancelled from practitioner workspace"
      );
      await loadSchedule(selectedDate);
    } catch (error) {
      setScheduleError(getApiErrorMessage(error));
    }
  }

  async function handleDeactivatePatient(patient) {
    const confirmed = window.confirm(
      `Deactivate ${patient.fullName || "this patient"}? They will be hidden from default patient searches.`
    );

    if (!confirmed) return;

    setPatientsError("");

    try {
      await deactivatePatient(patient.id);
      setEditingPatient(null);
      await loadPatients();
    } catch (error) {
      setPatientsError(getApiErrorMessage(error));
    }
  }

  useEffect(() => {
    loadSchedule(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    loadPatients();
  }, []);

  return (
    <PractitionerLayout user={user} onLogout={handleLogout}>
      <PageHeader
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedTimeZone={selectedTimeZone}
        setSelectedTimeZone={setSelectedTimeZone}
      />

      <ScheduleInsights appointments={appointments} selectedDate={selectedDate} />

      <div className="workspace-stack">
        <ScheduleSection
          patients={patients}
          appointments={appointments}
          selectedDate={selectedDate}
          isScheduleLoading={isScheduleLoading}
          scheduleError={scheduleError}
          editingAppointment={editingAppointment}
          setEditingAppointment={setEditingAppointment}
          onAppointmentSaved={(date) => {
            setEditingAppointment(null);
            setSelectedDate(date);
            loadSchedule(date);
          }}
          onCancelAppointment={handleCancelAppointment}
        />

        <PatientSection
          patients={patients}
          isPatientsLoading={isPatientsLoading}
          patientsError={patientsError}
          editingPatient={editingPatient}
          setEditingPatient={setEditingPatient}
          onPatientSaved={async () => {
            setEditingPatient(null);
            await loadPatients();
          }}
          onDeactivatePatient={handleDeactivatePatient}
          onRefreshPatients={loadPatients}
        />
      </div>
    </PractitionerLayout>
  );
}

export default PractitionerHomePage;
