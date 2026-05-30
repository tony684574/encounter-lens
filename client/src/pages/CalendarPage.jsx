import { useEffect, useState } from "react";
import { getApiErrorMessage } from "../api/apiClient";
import { getPatients } from "../api/patientApi";
import {
  cancelAppointment,
  getScheduleByRange
} from "../api/scheduleApi";
import AppointmentForm from "../components/AppointmentForm";
import AppointmentModal from "../components/AppointmentModal";
import PageHeader from "../components/PageHeader";
import PractitionerLayout from "../layouts/PractitionerLayout";
import {
  DEFAULT_TIME_ZONE,
  getTodayDateString
} from "../utils/dateUtils";
import {
  addDays,
  getNextAvailableSlot,
  getStartOfWeek,
  getWeekDays
} from "../utils/calendarUtils";
import WeeklyCalendarGrid from "../components/WeeklyCalendarGrid";

function CalendarPage() {
  const storedUser = localStorage.getItem("encounterLensUser");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const [selectedTimeZone, setSelectedTimeZone] = useState(DEFAULT_TIME_ZONE);
  const [selectedDate, setSelectedDate] = useState(
    getTodayDateString(DEFAULT_TIME_ZONE)
  );

  const [weekStartDate, setWeekStartDate] = useState(
    getStartOfWeek(getTodayDateString(DEFAULT_TIME_ZONE))
  );

  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [appointmentDefaults, setAppointmentDefaults] = useState(null);

  const weekDays = getWeekDays(weekStartDate);
  const weekEndDate = weekDays[6].date;

  function handleLogout() {
    localStorage.removeItem("encounterLensToken");
    localStorage.removeItem("encounterLensUser");
    window.location.href = "/login";
  }

  async function loadCalendarData(startDate = weekStartDate) {
    setIsLoading(true);
    setError("");

    try {
      const days = getWeekDays(startDate);
      const endDate = days[6].date;

      const [scheduleData, patientData] = await Promise.all([
        getScheduleByRange(startDate, endDate),
        getPatients({ limit: 50 })
      ]);

      setAppointments(scheduleData.appointments);
      setPatients(patientData);
    } catch (error) {
      setError(getApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingAppointment(null);
    setAppointmentDefaults(null);
  }

  function openCreateAppointmentModal({
    date,
    startTime = "09:00",
    endTime = getDefaultEndTime(startTime)
  }) {
    setSelectedDate(date);
    setEditingAppointment(null);
    setAppointmentDefaults({
      scheduledDate: date,
      startTime,
      endTime,
      visitType: "General Visit"
    });
    setIsModalOpen(true);
  }

  function openSmartCreateAppointmentModal() {
    const nextSlot = getNextAvailableSlot({
      date: selectedDate,
      timeZone: selectedTimeZone,
      appointments
    });

    openCreateAppointmentModal(
      nextSlot || {
        date: selectedDate,
        startTime: "08:00",
        endTime: "08:30"
      }
    );
  }

  function openEditAppointmentModal(appointment) {
    setSelectedDate(appointment.scheduledDate?.slice(0, 10) || selectedDate);
    setAppointmentDefaults(null);
    setEditingAppointment(appointment);
    setIsModalOpen(true);
  }

  function getDefaultEndTime(startTime) {
    const [hour, minute] = startTime.split(":").map(Number);
    const date = new Date();
    date.setHours(hour, minute + 30, 0, 0);

    return date.toTimeString().slice(0, 5);
  }

  function handlePreviousWeek() {
    const previousWeekStart = addDays(weekStartDate, -7);
    setWeekStartDate(previousWeekStart);
  }

  function handleNextWeek() {
    const nextWeekStart = addDays(weekStartDate, 7);
    setWeekStartDate(nextWeekStart);
  }

  function handleToday() {
    const today = getTodayDateString(selectedTimeZone);
    setSelectedDate(today);
    setWeekStartDate(getStartOfWeek(today));
  }

  async function handleCancelAppointment(appointment) {
    const confirmed = window.confirm(
      `Cancel appointment for ${appointment.patientName || "this patient"} at ${appointment.startTime}?`
    );

    if (!confirmed) {
      return;
    }

    setError("");

    try {
      await cancelAppointment(
        appointment.id,
        "Cancelled from calendar view"
      );
      await loadCalendarData(weekStartDate);
    } catch (error) {
      setError(getApiErrorMessage(error));
    }
  }

  useEffect(() => {
    loadCalendarData(weekStartDate);
  }, [weekStartDate]);

  return (
    <PractitionerLayout user={user} onLogout={handleLogout}>
      <PageHeader
        selectedDate={selectedDate}
        setSelectedDate={(date) => {
          setSelectedDate(date);
          setWeekStartDate(getStartOfWeek(date));
        }}
        selectedTimeZone={selectedTimeZone}
        setSelectedTimeZone={setSelectedTimeZone}
      />

      <section className="panel calendar-panel">
        <div className="panel-header">
          <div>
            <h2>Weekly Calendar</h2>
            <p className="subtle">
              Viewing {weekStartDate} through {weekEndDate}
            </p>
          </div>

          <div className="table-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={handlePreviousWeek}
            >
              Previous Week
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={handleToday}
            >
              Today
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={handleNextWeek}
            >
              Next Week
            </button>

            <button
              type="button"
              onClick={openSmartCreateAppointmentModal}
            >
              New Appointment
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {isLoading ? (
          <p className="subtle">Loading calendar...</p>
        ) : (
          <WeeklyCalendarGrid
            weekDays={weekDays}
            appointments={appointments}
            selectedTimeZone={selectedTimeZone}
            onCreateAppointment={openCreateAppointmentModal}
            onEditAppointment={openEditAppointmentModal}
            onCancelAppointment={handleCancelAppointment}
          />
        )}
      </section>

      {isModalOpen && (
        <AppointmentModal
          title={editingAppointment ? "Edit Appointment" : "New Appointment"}
          onClose={closeModal}
        >
          <AppointmentForm
            key={
              editingAppointment
                ? `edit-${editingAppointment.id}`
                : `create-${appointmentDefaults?.scheduledDate}-${appointmentDefaults?.startTime}`
            }
            patients={patients}
            selectedDate={appointmentDefaults?.scheduledDate || selectedDate}
            appointmentDefaults={appointmentDefaults}
            editingAppointment={editingAppointment}
            onAppointmentSaved={async () => {
              closeModal();
              await loadCalendarData(weekStartDate);
            }}
            onCancelEdit={closeModal}
          />
        </AppointmentModal>
      )}
    </PractitionerLayout>
  );
}

export default CalendarPage;