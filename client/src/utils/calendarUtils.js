function toDateOnlyString(date) {
  return date.toISOString().slice(0, 10);
}

export function getStartOfWeek(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  const day = date.getDay();
  const diffToSunday = day;

  date.setDate(date.getDate() - diffToSunday);

  return toDateOnlyString(date);
}

export function addDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + days);
  return toDateOnlyString(date);
}

export function getWeekDays(startDateString) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(startDateString, index);

    return {
      date,
      label: new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric"
      })
    };
  });
}

export function groupAppointmentsByDate(appointments) {
  return appointments.reduce((groups, appointment) => {
    const date = appointment.scheduledDate?.slice(0, 10);

    if (!date) {
      return groups;
    }

    if (!groups[date]) {
      groups[date] = [];
    }

    groups[date].push(appointment);

    return groups;
  }, {});
}

export function generateTimeSlots({
  startHour = 8,
  endHour = 17,
  intervalMinutes = 30
} = {}) {
  const slots = [];

  for (let hour = startHour; hour < endHour; hour += 1) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      const label = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      slots.push(label);
    }
  }

  return slots;
}

export function addMinutesToTime(time, minutesToAdd) {
  const [hour, minute] = time.split(":").map(Number);
  const date = new Date();

  date.setHours(hour, minute + minutesToAdd, 0, 0);

  return date.toTimeString().slice(0, 5);
}

export function getAppointmentsForSlot(appointments, date, slotTime) {
  return appointments.filter((appointment) => {
    const appointmentDate = appointment.scheduledDate?.slice(0, 10);

    return appointmentDate === date && appointment.startTime === slotTime;
  });
}