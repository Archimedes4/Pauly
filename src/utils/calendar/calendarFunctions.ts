/*
  Pauly
  Andrew Mainella
  21 July 2023
  calendarFunctions.ts
  Basic calendar functions non api, non async
*/

export function getDaysInMonth(input: Date): number {
  const d = new Date();
  d.setFullYear(input.getFullYear(), input.getMonth() + 1, 0);
  return d.getDate();
}

export function getDay(value: number, startdate: number): number | undefined {
  let offset: number = 0;
  const weekNumDec: number = value / 5.0;
  const weekNum: number = Math.floor(weekNumDec);
  const let4: number = weekNum * 2;
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

export function isDateToday(dateToCheckIn: Date | string): boolean {
  const dateToCheck = (typeof dateToCheckIn === 'string') ? new Date(dateToCheckIn):dateToCheckIn
  // Get today's date
  const today = new Date();

  // Return true if the dateToCheck is today, otherwise return false
  return isTimeOnDay(dateToCheck.toISOString(), today.toISOString());
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
  // get the length of event in miliseconds
  let delta = toDate.getTime() - fromDate.getTime();
  if (delta >= 86400000) {
    delta = 86400000;
  }

  // devide by one hour in miliseconds
  const deltaHours = delta / 3600000;
  const deltaRemaining = delta % 3600000;
  // devide by one minute in miliseoncds
  const deltaMinutes = deltaRemaining / 60000;

  const HourHeight = height * 0.1;
  const MinuteHeight = (height * 0.1) / 60;

  const ReturnOffset = HourHeight * Math.floor(deltaHours) + MinuteHeight * deltaMinutes;
  return ReturnOffset;
}

export function isTimeOnDay(lhs: string, rhs: string): boolean {
  // compare year
  if (new Date(lhs).getFullYear() !== new Date(rhs).getFullYear()) {
    return false;
  }
  // compare month
  if (new Date(lhs).getMonth() !== new Date(rhs).getMonth()) {
    return false;
  }
  // compare date
  if (new Date(lhs).getDate() !== new Date(rhs).getDate()) {
    return false;
  }
  return true;
}

export function isEventDuringInterval(
  selectedDate: Date | string,
  event: eventType,
  checkDayStart?: number,
  checkDayEnd?: number,
) {
  const startTimeDate = new Date(event.startTime).getTime(); // String to date
  const endTimeDate = new Date(event.endTime).getTime(); // String to date

  const checkDate =
    typeof selectedDate === 'string' ? new Date(selectedDate) : selectedDate;

  // Check is the current date
  const checkStart: number = new Date(
    checkDate.getFullYear(),
    checkDate.getMonth(),
    checkDayStart !== undefined ? checkDayStart : checkDate.getDate(),
    0,
    0,
  ).getTime();
  const checkEnd: number = new Date(
    checkDate.getFullYear(),
    checkDate.getMonth(),
    checkDayEnd !== undefined ? checkDayEnd : checkDate.getDate() + 1,
    0,
    0,
  ).getTime();

  // Start time starts before and end time ends after or on day
  if (startTimeDate < checkStart && endTimeDate >= checkEnd) {
    return true;
    // Start time is on day
  }
  if (startTimeDate >= checkStart && startTimeDate < checkEnd) {
    return true;
  }
  return false;
}

export function isEventDuringIntervalRaw(
  event: eventType,
  checkStart: number,
  checkEnd: number,
) {
  const startTimeDate = new Date(event.startTime).getTime(); // String to date
  const endTimeDate = new Date(event.endTime).getTime(); // String to date
  // Start time starts before and end time ends after or on day
  if (startTimeDate < checkStart && endTimeDate >= checkEnd) {
    return true;
    // Start time is on day
  }
  if (startTimeDate >= checkStart && startTimeDate < checkEnd) {
    return true;
  }
  return false;
}

export function getDOW(selectedDate: Date) {
  const week: Date[] = [];
  // Starting Monday not Sunday
  selectedDate.setDate(selectedDate.getDate() - selectedDate.getDay());
  for (let i = 0; i < 7; i += 1) {
    week.push(new Date(selectedDate));
    selectedDate.setDate(selectedDate.getDate() + 1);
  }
  return week;
}