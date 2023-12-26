/*
  Pauly
  Andrew Mainella
  21 July 2023
  calendarFunctions.ts
  Basic calendar functions non api not async
*/

export function getDaysInMonth(input: Date): number {
  const d = new Date();
  d.setFullYear(input.getFullYear(), input.getMonth() + 1, 0);
  return d.getDate();
}

export function getDay(value: number, startdate: number): number | undefined {
  let offset: number = 0;
  const let1: number = value / 5.0;
  const let2: number = Math.floor(let1);
  const let4: number = let2 * 2;
  offset += let4;
  const result: number = value - startdate + 2 + offset;
  const month = new Date();
  const d = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const DayInt = d.getDate();
  if (result >= DayInt + 1) {
    return undefined;
  }
  return result;
}

export function findFirstDayinMonth(currentTime: Date): number {
  const year = currentTime.getFullYear();
  const month = currentTime.getMonth();
  const weekDay = new Date(year, month).getDay();
  return weekDay;
  // Returns a which weekday day is the first day of the month.
  // Sunday is 0, Saturday is 6
}

export function isDateToday(dateToCheck: Date) {
  // Get today's date
  const today = new Date();

  // Compare the components of the dateToCheck with today's date
  const isSameDate =
    dateToCheck.getDate() === today.getDate() &&
    dateToCheck.getMonth() === today.getMonth() &&
    dateToCheck.getFullYear() === today.getFullYear();

  // Return true if the dateToCheck is today, otherwise return false
  return isSameDate;
}

// July 17 2023
// Andrew Mainella
//
// Converting a year to a school year.
// The year converted is the year of the graduating class
//
// For example 2024 would return 2023-2024

export function convertYearToSchoolYear(year: number) {
  return `${year - 1}-${year}`;
}

export function calculateIfShowing(value: string, Time: Date): boolean {
  // TO DO shorten
  if (isDateToday(Time)) {
    const hourInt = Time.getHours();
    const minuiteInt = Time.getMinutes();
    if (minuiteInt + 15 >= 60) {
      let resepctiveTime: string = `${hourInt > 12}`
        ? (hourInt - 12).toString()
        : hourInt.toString();
      resepctiveTime += hourInt > 12 ? 'PM' : 'AM';
      if (resepctiveTime === value) {
        return false;
      }
      return true;
    }
    if (minuiteInt - 15 <= 0) {
      let resepctiveTime: string = `${hourInt > 12}`
        ? (hourInt - 12).toString()
        : hourInt.toString();
      resepctiveTime += hourInt > 12 ? 'PM' : 'AM';
      if (resepctiveTime === value) {
        return false;
      }
      return true;
    }
    return true;
  }
  return true;
}

export function findTimeOffset(time: Date, height: number): number {
  const hourWidth = height * 0.1;
  const minutieWidth = (height * 0.1) / 60;
  const hourInt = time.getHours();
  const minuiteInt = time.getMinutes();
  const returnOffset = hourWidth * hourInt + minutieWidth * minuiteInt;
  return returnOffset;
}

// Ryan was here April 13, 2023
// Andrew was here April 13, 2023

export function computeEventHeight(
  fromDate: Date,
  toDate: Date,
  height: number,
): number {
  let delta = toDate.getTime() - fromDate.getTime();
  if (delta >= 86400000) {
    delta = 86400000;
  }

  const deltaHours = delta / 3600000;
  const deltaRemaining = delta % 3600000;
  const deltaMinutes = deltaRemaining / 60;

  const HourHeight = height * 0.1;
  const MinuteHeight = (height * 0.1) / 60;

  const ReturnOffset = HourHeight * deltaHours + MinuteHeight * deltaMinutes;
  return ReturnOffset;
}

export function isTimeOnDay(lhs: string, rhs: string): boolean {
  if (new Date(lhs).getFullYear() !== new Date(rhs).getFullYear()) {
    return false
  } else if (new Date(lhs).getMonth() !== new Date(rhs).getMonth()) {
    return false
  } else if (new Date(lhs).getDate() !== new Date(rhs).getDate()) {
    return false
  }
  return true
}