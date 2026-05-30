import { useEffect, useMemo, useRef, useState } from "react";
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

  const scrollContainerRef = useRef(null);
  const [now, setNow] = useState(() => new Date());

  const today = getTodayDateString(selectedTimeZone);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(new Date());
    }, 60 * 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  const currentTimeInfo = useMemo(() => {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: selectedTimeZone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).formatToParts(now);

    let hour = parts.find((part) => part.type === "hour")?.value || "00";
    const minute = parts.find((part) => part.type === "minute")?.value || "00";

    if (hour === "24") {
      hour = "00";
    }

    const currentMinutes = Number(hour) * 60 + Number(minute);

    const activeSlot = timeSlots.find((slotTime) => {
      const [slotHour, slotMinute] = slotTime.split(":").map(Number);
      const slotStartMinutes = slotHour * 60 + slotMinute;
      const slotEndMinutes = slotStartMinutes + 30;

      return currentMinutes >= slotStartMinutes && currentMinutes < slotEndMinutes;
    });

    if (!activeSlot) {
      return null;
    }

    const [slotHour, slotMinute] = activeSlot.split(":").map(Number);
    const slotStartMinutes = slotHour * 60 + slotMinute;
    const minutesIntoSlot = currentMinutes - slotStartMinutes;
    const percentIntoSlot = (minutesIntoSlot / 30) * 100;

    return {
      activeSlot,
      label: `${hour}:${minute}`,
      percentIntoSlot
    };
  }, [now, selectedTimeZone, timeSlots]);

  useEffect(() => {
    const container = scrollContainerRef.current;

    if (!container) {
      return;
    }

    const calendarHasToday = weekDays.some((day) => day.date === today);

    if (!calendarHasToday || !currentTimeInfo) {
      container.scrollTop = 0;
      return;
    }

    const currentSlotIndex = timeSlots.findIndex(
      (slotTime) => slotTime === currentTimeInfo.activeSlot
    );

    if (currentSlotIndex === -1) {
      return;
    }

    const rowHeight = 96;
    const headerHeight = 58;

    // Put the current/next time slot near the top,
    // so the default view focuses on what is coming next.
    const rowsBeforeCurrentSlot = Math.max(currentSlotIndex+1, 0);

    container.scrollTop = headerHeight + rowsBeforeCurrentSlot * rowHeight;
  }, [currentTimeInfo, today, timeSlots, weekDays]);

  return (
    <div className="weekly-calendar-shell" ref={scrollContainerRef}>
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
                  {isToday && currentTimeInfo?.activeSlot === slotTime && (
                    <div
                      className="current-time-marker"
                      style={{ top: `${currentTimeInfo.percentIntoSlot}%` }}
                      aria-label={`Current time ${currentTimeInfo.label}`}
                    >
                      <span>{currentTimeInfo.label}</span>
                    </div>
                  )}

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
                          <span>{appointment.visitType || "General Visit"}</span>
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