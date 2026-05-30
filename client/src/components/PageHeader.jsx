import { getSupportedTimeZones, getTodayDateString } from "../utils/dateUtils";
import ClinicClock from "./clinicClock";

function PageHeader({
  selectedDate,
  setSelectedDate,
  selectedTimeZone,
  setSelectedTimeZone
}) {
  return (
    <header className="workspace-header" id="today">
      <div>
        <p className="eyebrow">Aloha Practitioner</p>
        <h1>Today’s Clinic Workspace</h1>
        <p className="subtle">
          A calmer place to manage schedules, patients, and the day’s work.
        </p>
      </div>

      <div className="workspace-controls">
        <ClinicClock timeZone={selectedTimeZone}/>
        <label className="compact-label">
          Date
          <input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
          />
        </label>

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
      </div>
    </header>
  );
}

export default PageHeader;
