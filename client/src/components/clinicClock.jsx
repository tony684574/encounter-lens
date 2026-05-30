import { useEffect, useState } from "react";

function formatClockTime(date, timeZone) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  }).format(date);
}

function formatClockDate(date, timeZone) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function getTimeZoneLabel(timeZone) {
  if (timeZone === "Pacific/Honolulu") return "Honolulu";
  if (timeZone === "America/Los_Angeles") return "Pacific";
  if (timeZone === "America/Denver") return "Mountain";
  if (timeZone === "America/Chicago") return "Central";
  if (timeZone === "America/New_York") return "Eastern";
  if (timeZone === "UTC") return "UTC";

  return timeZone;
}

function ClinicClock({ timeZone }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <section className="clinic-clock" aria-label="Clinic clock">
      <span className="clinic-clock-label">
        {getTimeZoneLabel(timeZone)} Time
      </span>
      <strong>{formatClockTime(now, timeZone)}</strong>
      <span>{formatClockDate(now, timeZone)}</span>
    </section>
  );
}

export default ClinicClock;