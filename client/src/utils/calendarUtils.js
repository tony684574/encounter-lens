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

export function getDateStringInTimeZone(timeZone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

export function getTimeStringInTimeZone(timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(new Date());

  let hour = parts.find((part) => part.type === "hour")?.value || "00";
  const minute = parts.find((part) => part.type === "minute")?.value || "00";

  // Some browsers may format midnight as 24:00. Normalize to 00:00.
  if (hour === "24") {
    hour = "00";
  }

  return `${hour}:${minute}`;
}

export function roundUpToNextSlot(time, intervalMinutes = 30) {
  const [hour, minute] = time.split(":").map(Number);
  const totalMinutes = hour * 60 + minute;
  const roundedMinutes =
    Math.ceil(totalMinutes / intervalMinutes) * intervalMinutes;

  const roundedHour = Math.floor(roundedMinutes / 60);
  const roundedMinute = roundedMinutes % 60;

  return `${String(roundedHour).padStart(2, "0")}:${String(
    roundedMinute
  ).padStart(2, "0")}`;
}

function timeToMinutes(time) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

function appointmentsOverlap(slotStart, slotEnd, appointmentStart, appointmentEnd) {
  const slotStartMinutes = timeToMinutes(slotStart);
  const slotEndMinutes = timeToMinutes(slotEnd);
  const appointmentStartMinutes = timeToMinutes(appointmentStart);
  const appointmentEndMinutes = timeToMinutes(appointmentEnd);

  return (
    slotStartMinutes < appointmentEndMinutes &&
    slotEndMinutes > appointmentStartMinutes
  );
}

export function getNextAvailableSlot({
  date,
  timeZone,
  appointments,
  clinicStartHour = 8,
  clinicEndHour = 17,
  intervalMinutes = 30
}) {
  const today = getDateStringInTimeZone(timeZone);

  let targetDate = date < today ? today : date;

  const slots = generateTimeSlots({
    startHour: clinicStartHour,
    endHour: clinicEndHour,
    intervalMinutes
  });

  function findAvailableSlotForDate(dateToCheck, candidateSlots) {
    const blockingAppointments = appointments.filter((appointment) => {
      const appointmentDate = appointment.scheduledDate?.slice(0, 10);

      return (
        appointmentDate === dateToCheck &&
        appointment.status !== "cancelled"
      );
    });

    const availableStartTime = candidateSlots.find((slot) => {
      const slotEnd = addMinutesToTime(slot, intervalMinutes);

      return !blockingAppointments.some((appointment) =>
        appointmentsOverlap(
          slot,
          slotEnd,
          appointment.startTime,
          appointment.endTime
        )
      );
    });

    if (!availableStartTime) {
      return null;
    }

    return {
      date: dateToCheck,
      startTime: availableStartTime,
      endTime: addMinutesToTime(availableStartTime, intervalMinutes)
    };
  }

  if (targetDate === today) {
    const currentTime = getTimeStringInTimeZone(timeZone);
    const nextSlot = roundUpToNextSlot(currentTime, intervalMinutes);
    const remainingSlotsToday = slots.filter((slot) => slot >= nextSlot);

    const availableToday = findAvailableSlotForDate(
      targetDate,
      remainingSlotsToday
    );

    if (availableToday) {
      return availableToday;
    }

    targetDate = addDays(today, 1);
  }

  return findAvailableSlotForDate(targetDate, slots);
}