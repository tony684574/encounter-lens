export const DEFAULT_TIME_ZONE = "Pacific/Honolulu";

export function getTodayDateString(timeZone = DEFAULT_TIME_ZONE) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });

  return formatter.format(new Date());
}

export function getSupportedTimeZones() {
  return [
    {
      label: "Hawaii Time",
      value: "Pacific/Honolulu"
    },
    {
      label: "Pacific Time",
      value: "America/Los_Angeles"
    },
    {
      label: "Mountain Time",
      value: "America/Denver"
    },
    {
      label: "Central Time",
      value: "America/Chicago"
    },
    {
      label: "Eastern Time",
      value: "America/New_York"
    },
    {
      label: "UTC",
      value: "UTC"
    }
  ];
}