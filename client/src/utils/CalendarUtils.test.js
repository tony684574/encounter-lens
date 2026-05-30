import { afterEach, describe, expect, test, vi } from "vitest";
import {
  addMinutesToTime,
  generateTimeSlots,
  getNextAvailableSlot,
  roundUpToNextSlot
} from "./calendarUtils";

describe("calendarUtils", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  describe("addMinutesToTime", () => {
    test("adds 30 minutes to a time string", () => {
      expect(addMinutesToTime("10:00", 30)).toBe("10:30");
    });

    test("rolls over to the next hour", () => {
      expect(addMinutesToTime("10:45", 30)).toBe("11:15");
    });
  });

  describe("generateTimeSlots", () => {
    test("generates 30-minute clinic slots from 8 to 9", () => {
      expect(
        generateTimeSlots({
          startHour: 8,
          endHour: 9,
          intervalMinutes: 30
        })
      ).toEqual(["08:00", "08:30"]);
    });
  });

  describe("roundUpToNextSlot", () => {
    test("rounds 10:15 up to 10:30", () => {
      expect(roundUpToNextSlot("10:15", 30)).toBe("10:30");
    });

    test("keeps 10:30 as 10:30", () => {
      expect(roundUpToNextSlot("10:30", 30)).toBe("10:30");
    });

    test("rounds 10:31 up to 11:00", () => {
      expect(roundUpToNextSlot("10:31", 30)).toBe("11:00");
    });
  });

  describe("getNextAvailableSlot", () => {
    test("returns the next slot after the current time for today", () => {
      // 2026-05-25 20:15 UTC = 2026-05-25 10:15 AM Pacific/Honolulu
      vi.setSystemTime(new Date("2026-05-25T20:15:00Z"));

      const result = getNextAvailableSlot({
        date: "2026-05-25",
        timeZone: "Pacific/Honolulu",
        appointments: []
      });

      expect(result).toEqual({
        date: "2026-05-25",
        startTime: "10:30",
        endTime: "11:00"
      });
    });

    test("skips a booked slot and returns the next available slot", () => {
      vi.setSystemTime(new Date("2026-05-25T20:15:00Z"));

      const result = getNextAvailableSlot({
        date: "2026-05-25",
        timeZone: "Pacific/Honolulu",
        appointments: [
          {
            scheduledDate: "2026-05-25",
            startTime: "10:30",
            endTime: "11:00",
            status: "scheduled"
          }
        ]
      });

      expect(result).toEqual({
        date: "2026-05-25",
        startTime: "11:00",
        endTime: "11:30"
      });
    });

    test("does not let a cancelled appointment block the slot", () => {
      vi.setSystemTime(new Date("2026-05-25T20:15:00Z"));

      const result = getNextAvailableSlot({
        date: "2026-05-25",
        timeZone: "Pacific/Honolulu",
        appointments: [
          {
            scheduledDate: "2026-05-25",
            startTime: "10:30",
            endTime: "11:00",
            status: "cancelled"
          }
        ]
      });

      expect(result).toEqual({
        date: "2026-05-25",
        startTime: "10:30",
        endTime: "11:00"
      });
    });

    test("blocks overlapping appointments, not just exact start times", () => {
      vi.setSystemTime(new Date("2026-05-25T20:15:00Z"));

      const result = getNextAvailableSlot({
        date: "2026-05-25",
        timeZone: "Pacific/Honolulu",
        appointments: [
          {
            scheduledDate: "2026-05-25",
            startTime: "10:00",
            endTime: "11:00",
            status: "scheduled"
          }
        ]
      });

      expect(result).toEqual({
        date: "2026-05-25",
        startTime: "11:00",
        endTime: "11:30"
      });
    });

    test("moves to tomorrow morning after clinic hours", () => {
      // 2026-05-26 04:45 UTC = 2026-05-25 6:45 PM Pacific/Honolulu
      vi.setSystemTime(new Date("2026-05-26T04:45:00Z"));

      const result = getNextAvailableSlot({
        date: "2026-05-25",
        timeZone: "Pacific/Honolulu",
        appointments: []
      });

      expect(result).toEqual({
        date: "2026-05-26",
        startTime: "08:00",
        endTime: "08:30"
      });
    });

    test("uses today when the selected date is in the past", () => {
      vi.setSystemTime(new Date("2026-05-25T20:15:00Z"));

      const result = getNextAvailableSlot({
        date: "2026-05-20",
        timeZone: "Pacific/Honolulu",
        appointments: []
      });

      expect(result).toEqual({
        date: "2026-05-25",
        startTime: "10:30",
        endTime: "11:00"
      });
    });

    test("returns null when no slots are available for the target date", () => {
      vi.setSystemTime(new Date("2026-05-25T18:00:00Z")); // 8:00 AM Honolulu

      const appointments = generateTimeSlots({
        startHour: 8,
        endHour: 17,
        intervalMinutes: 30
      }).map((slot) => ({
        scheduledDate: "2026-05-25",
        startTime: slot,
        endTime: addMinutesToTime(slot, 30),
        status: "scheduled"
      }));

      const result = getNextAvailableSlot({
        date: "2026-05-25",
        timeZone: "Pacific/Honolulu",
        appointments
      });

      expect(result).toEqual({
        date: "2026-05-26",
        startTime: "08:00",
        endTime: "08:30"
      });
    });
  });
});