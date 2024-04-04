/*
  Pauly
  Andrew Mainella
  21 July 2023
  calendarFunctions.ts
  Basic calendar functions non api, non async
*/

import createUUID from "../ultility/createUUID";

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
  const dateToCheck =
    typeof dateToCheckIn === 'string' ? new Date(dateToCheckIn) : dateToCheckIn;
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

  const ReturnOffset =
    HourHeight * Math.floor(deltaHours) + MinuteHeight * deltaMinutes;
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

export function isTimeDuringInterval(
  start: number,
  end: number,
  checkStart: number,
  checkEnd: number,
) {
  // Start time starts before and end time ends after or on day
  if (start <= checkStart && end > checkStart) {
    return true;
    // Start time is on day
  }
  if (start >= checkStart && start < checkEnd) {
    return true;
  }
  return false;
}

export function isEventDuringInterval(
  input:
    | {
        selectedDate: Date | string;
        event: eventType;
        checkDayStart?: number;
        checkDayEnd?: number;
      }
    | {
        event: eventType;
        checkStart: number;
        checkEnd: number;
      },
): boolean {
  const startTimeDate = new Date(input.event.startTime).getTime(); // String to date
  const endTimeDate = new Date(input.event.endTime).getTime(); // String to date

  if ('selectedDate' in input) {
    const checkDate =
      typeof input.selectedDate === 'string'
        ? new Date(input.selectedDate)
        : input.selectedDate;

    // Check is the current date
    const checkStart: number = new Date(
      checkDate.getFullYear(),
      checkDate.getMonth(),
      input.checkDayStart !== undefined
        ? input.checkDayStart
        : checkDate.getDate(),
      0,
      0,
    ).getTime();
    const checkEnd: number = new Date(
      checkDate.getFullYear(),
      checkDate.getMonth(),
      input.checkDayEnd !== undefined
        ? input.checkDayEnd
        : checkDate.getDate() + 1,
      0,
      0,
    ).getTime();

    return isTimeDuringInterval(
      startTimeDate,
      endTimeDate,
      checkStart,
      checkEnd,
    );
  }
  return isTimeDuringInterval(
    startTimeDate,
    endTimeDate,
    input.checkStart,
    input.checkEnd,
  );
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

export function encodeSchoolDayData(data: schoolDayDataCompressedType): string {
  let result = '';
  if (data.dcId.length !== 36) {
    return 'failed';
  }
  if (data.sId.length !== 36) {
    return 'failed';
  }
  if (data.sdId.length !== 36) {
    return 'failed';
  }
  if (data.syeId.length !== 36) {
    return 'failed';
  }
  result += data.dcId + data.sId + data.sdId + data.syeId;
  if (data.dciId !== '') {
    result += data.dciId;
  }
  result += data.sem;
  return result;
}

export function decodeSchoolDayData(
  data: string,
): schoolDayDataCompressedType | 'failed' {
  if (data.length < 145) {
    // failed
    return 'failed';
  }

  if (data.length >= 180) {
    try {
      const sem = parseInt(data.substring(180, data.length));
      return {
        dcId: data.substring(0, 36),
        sId: data.substring(36, 72),
        sdId: data.substring(72, 108),
        syeId: data.substring(108, 144),
        sem,
        dciId: data.substring(144, 180),
      };
    } catch {
      return 'failed';
    }
  }
  try {
    const sem = parseInt(data.substring(144, data.length));
    return {
      dciId: '',
      dcId: data.substring(0, 36),
      sId: data.substring(36, 72),
      sdId: data.substring(72, 108),
      syeId: data.substring(108, 144),
      sem,
    };
  } catch {
    return 'failed';
  }
}

export function encodeSchoolYearData(timetableId: string) {
  if (timetableId.length !== 36) {
    return 'failed'
  }
  return timetableId + createUUID()
}

export function decodeSchoolYearData(input: string) {
  if (input.length !== 72) {
    return 'failed'
  }
  return {
    timetableId: input.substring(0, 36),
    paulyId: input.substring(36, 72)
  }
}

// just sets the date
export function getDateWithDay(date: string, day: number): Date {
  const dateResult = new Date(date)
  dateResult.setDate(day)
  return dateResult
}

// finds the first day of an event in a week
// This functions makes assumptions about the input.
// First there is a day that is showing in days
// Second the event is occuring during the week that the days are provided for
export function findFirstDayEventWeek(event: monthEventType, days: monthDataType[]) {
  let firstDate = 0;
  for (let index = 0; index < days.length; index += 1) {
    if (days[index].showing) {
      firstDate = days[index].dayData
      break
    }
  }
  const eventFirstDate = new Date(event.startTime).getDate()
  if (eventFirstDate > firstDate) {
    return eventFirstDate
  }
  // Maybe some error handling if the first day is zero
  return firstDate
}

// Gets the number of days left in the week for an event. This is used in the month view section.
// For example if an event spans from the 1st to the 20th. And the 4 was a saturday. the result would be 7 as the 4 -> 10 would be 6.
export function getWeekLengthOfEvent(event: eventType, day: Date) {
  const numberOfDaysLeft = Math.floor(new Date(event.endTime).getTime()/86400000) - Math.floor(new Date(day).getTime()/86400000)
  const dayOfWeek = day.getDay()

  const result = 7 - dayOfWeek
  if (numberOfDaysLeft <= result) {
    if (numberOfDaysLeft == 0) {
      return 1
    }
    return numberOfDaysLeft
  }
  return result
}

function getHeightAbove(events: monthEventType[], order: number) {
  let heightAbove = 0
  for (let index = 0; index < events.length; index += 1) {
    const event = events[index]
    if (event.order < order && event.height !== undefined) {
      heightAbove += event.height + 6
    }
  }
  return heightAbove
}

export function getHeightEventsAbove(events: monthEventType[], event: monthEventType, selectedDate: string, days: monthDataType[]) {
  let dateOfFirstDay = getDateWithDay(selectedDate, findFirstDayEventWeek(event, days))
  const delta = getWeekLengthOfEvent(event, dateOfFirstDay) + dateOfFirstDay.getDate()
  let heightestHeight = 0;
  for (let day = dateOfFirstDay.getDate(); day < delta; day += 1) {
    const heightEvents = getEventsOnDay(events, getDateWithDay(selectedDate, day))
    if (event.name === "Admin Day:  No Classes") {
      console.log("Admin", heightEvents)
    }
    const newHeight = getHeightAbove(heightEvents, event.order)
    if (newHeight > heightestHeight) {
      heightestHeight = newHeight
    }
  }
  return heightestHeight
}

export function getEventsOnDay(events: monthEventType[], day: Date): monthEventType[] {
  let result: monthEventType[] = []
  for (let index = 0; index < events.length; index += 1) {
    if (isEventDuringInterval({selectedDate: day, event: events[index]})) {
      result.push(events[index])
    }
  }
  return result
}

export function getEventsWithEvent(events: monthEventType[], event: monthEventType): monthEventType[] {
  let result: monthEventType[] = []
  for (let index = 0; index < events.length; index += 1) {
    if (isEventDuringInterval({checkStart: new Date(event.startTime).getTime(), checkEnd: new Date(event.endTime).getTime(), event: events[index]})) {
      result.push(events[index])
    }
  }
  return result
}
