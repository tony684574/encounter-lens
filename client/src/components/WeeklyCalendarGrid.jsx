import {
  addMinutesToTime,
  generateTimeSlots,
  getAppointmentsForSlot
} from "../utils/calendarUtils";
import { getTodayDateString } from "../utils/dateUtils";

function WeeklyCalendarGrid({
  weekDays,
  appointments,
  selectedTimeZone,
  onCreateAppointment,
  onEditAppointment,
  onCancelAppointment
}) {
  const timeSlots = generateTimeSlots({
    startHour: 8,
    endHour: 17,
    intervalMinutes: 30
  });

  const today = getTodayDateString(selectedTimeZone);

  return (
    <div className="weekly-calendar-shell">
      <div className="weekly-calendar-grid">
        <div className="calendar-corner-cell">Time</div>

        {weekDays.map((day) => {
          const isToday = day.date === today;

          return (
            <div
              key={day.date}
              className={`calendar-day-column-header ${isToday ? "is-today" : ""}`}
            >
              <strong>{day.label}</strong>
              {isToday && <span>Today</span>}
            </div>
          );
        })}

        {timeSlots.map((slotTime) => (
          <div className="calendar-row-fragment" key={slotTime}>
            <div className="calendar-time-cell">{slotTime}</div>

            {weekDays.map((day) => {
              const slotAppointments = getAppointmentsForSlot(
                appointments,
                day.date,
                slotTime
              );

              const isToday = day.date === today;

              return (
                <div
                  key={`${day.date}-${slotTime}`}
                  className={`calendar-time-slot ${isToday ? "is-today-slot" : ""}`}
                >
                  {slotAppointments.length === 0 ? (
                    <button
                      type="button"
                      className="calendar-slot-add"
                      onClick={() =>
                        onCreateAppointment({
                          date: day.date,
                          startTime: slotTime,
                          endTime: addMinutesToTime(slotTime, 30)
                        })
                      }
                    >
                      +
                    </button>
                  ) : (
                    slotAppointments.map((appointment) => (
                      <article
                        key={appointment.id}
                        className={`calendar-slot-appointment status-${appointment.status}`}
                      >
                        <div>
                          <strong>
                            {appointment.startTime}–{appointment.endTime}
                          </strong>
                          <p>
                            {appointment.status === "cancelled"
                              ? "Cancelled"
                              : appointment.patientName || "Unknown Patient"}
                          </p>
                          <span>
                            {appointment.visitType || "General Visit"}
                          </span>
                        </div>

                        {appointment.status !== "cancelled" && (
                          <div className="calendar-slot-actions">
                            <button
                              type="button"
                              className="secondary-button"
                              onClick={(event) => {
                                event.stopPropagation();
                                onEditAppointment(appointment);
                              }}
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="danger-button"
                              onClick={(event) => {
                                event.stopPropagation();
                                onCancelAppointment(appointment);
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        )}

                        {appointment.status === "cancelled" && (
                          <button
                            type="button"
                            className="calendar-slot-add after-cancelled"
                            onClick={(event) => {
                              event.stopPropagation();
                              onCreateAppointment({
                                date: day.date,
                                startTime: appointment.startTime,
                                endTime: appointment.endTime
                              });
                            }}
                          >
                            Rebook slot
                          </button>
                        )}
                      </article>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default WeeklyCalendarGrid;