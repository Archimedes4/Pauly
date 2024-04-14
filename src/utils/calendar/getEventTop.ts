import { findFirstDayEventWeek, getDateWithDay, getEventsOnDay, getWeekLengthOfEvent } from "./calendarFunctions";

function getHeightAbove(events: monthEventType[], order: number) {
  let heightAbove = 0;
  for (let index = 0; index < events.length; index += 1) {
    const event = events[index];
    if (event.order < order && event.height !== undefined) {
      heightAbove += event.height + 6;
    }
  }
  return heightAbove;
}

function getHeightEventsAbove(
  events: monthEventType[],
  event: monthEventType,
  selectedDate: string,
  days: monthDataType[],
) {
  // The first day of the week in the row.
  const dateOfFirstDay = getDateWithDay(
    selectedDate,
    findFirstDayEventWeek(event, days),
  );
  // The length of the event in that week + start date
  const delta =
    getWeekLengthOfEvent(event, dateOfFirstDay) + dateOfFirstDay.getDate();
  let heightestHeight = 0;
  // Go from first day to last day of event in that week.
  for (let day = dateOfFirstDay.getDate(); day < delta; day += 1) {
    const heightEvents = getEventsOnDay(
      events,
      getDateWithDay(selectedDate, day),
    );
    const newHeight = getHeightAbove(heightEvents, event.order);
    if (newHeight > heightestHeight) {
      heightestHeight = newHeight;
    }
  }
  return heightestHeight;
}

export default function getEventTop(
  events: monthEventType[],
  event: monthEventType,
  selectedDate: string,
  days: monthDataType[],
) {
  let eventsAbove = getEventsOnDay(
    events,
    getDateWithDay(selectedDate, findFirstDayEventWeek(event, days)),
  ).filter((e) => {return e.order < event.order})
  let previousHeight = -3
  let totalHeight = 0
  for (let index = 0; index < eventsAbove.length; index += 1) {
    let result = getHeightEventsAbove(events, eventsAbove[index], selectedDate, days) + (eventsAbove[index].height ?? 0)
    if (event.name === "Grad Photos") {
      console.log(`${eventsAbove[index].name}\nResult:${result}\nEvent Height:${eventsAbove[index].height}\nOrder: ${eventsAbove[index].order}\nEvents:`, eventsAbove)
    }
    totalHeight += result - previousHeight
    previousHeight = result
  }
  totalHeight += getHeightEventsAbove(events, event, selectedDate, days) - previousHeight
  if (event.name === "Grad Photos") {
    console.log(`
      Main Thing \n
      Result: ${totalHeight}
      Height Above: ${getHeightEventsAbove(events, event, selectedDate, days)}
      Events: 
    `, events, "\nevents above", eventsAbove)
  }
  return totalHeight
}