import { findFirstDayEventWeek, getDateWithDay, getEventsOnDay, getWeekLengthOfEvent } from "./calendarFunctions";

export default function getEventTop(
  events: monthEventType[],
  event: monthEventType,
  selectedDate: string,
  days: monthDataType[],
  isEvent?: boolean,
  rootEvent?: monthEventType
): number {
  if (event.order === 0 && isEvent === false) {
    return (event.height ?? 0) + 3
  }

  if (event.order === 0) {
    return 0
  }

  // The first day of the week in the row.
  const dateOfFirstDay = getDateWithDay(
    selectedDate,
    findFirstDayEventWeek(event, days),
  );
  // The length of the event in that week + start date
  const delta = getWeekLengthOfEvent(event, dateOfFirstDay) + dateOfFirstDay.getDate();
  let heightestHeight = 0;
  let isEventAbove = false
  // Go from first day to last day of event in that week.
  for (let day = dateOfFirstDay.getDate(); day < delta; day += 1) {
    const heightEvents = getEventsOnDay(
      events,
      getDateWithDay(selectedDate, day),
    ).filter((e) => {return e.order < event.order}).sort((a, b) => {return a.order-b.order});
    if (heightEvents.length === 0) {
      continue
    }
    isEventAbove = true
    let newHeight = 0
    if (isEvent === false) {
      newHeight = getEventTop(events, heightEvents[heightEvents.length - 1], selectedDate, days, false, rootEvent) + (event.height ?? 0) + 3
    } else {
      newHeight = getEventTop(events, heightEvents[heightEvents.length - 1], selectedDate, days, false, event)
    }
    if (newHeight > heightestHeight) {
      heightestHeight = newHeight;
    }
  }

  if (!isEventAbove) {
    return (event.height ?? 0)
  }
  return heightestHeight
}