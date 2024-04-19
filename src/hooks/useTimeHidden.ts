import store from '@src/redux/store';
import { isDateToday } from '@src/utils/calendar/calendarFunctions';
import { useEffect, useState } from 'react';

/**
 * Gets the time that is within 15 of the start of the hour. 15-45 -> "" 45-25 -> "{Time}""
 * @param currentTime Time to check
 * @returns Returns the time that should be hidden or ""
 */
export function calculateHiddenTime(currentTime: Date): string {
  const hourInt = currentTime.getHours();
  const minuiteInt = currentTime.getMinutes();
  if (minuiteInt + 15 >= 60) {
    // If the current time + 15 is over 60.
    let resepctiveTime: string =
      hourInt + 1 > 12
        ? (hourInt + 1 - 12).toString()
        : (hourInt + 1).toString();
    resepctiveTime += hourInt + 1 >= 12 ? 'PM' : 'AM';
    return resepctiveTime;
  }
  if (minuiteInt - 15 <= 0) {
    // If the current time + 15 is under 0.
    let resepctiveTime: string =
      hourInt > 12 ? (hourInt - 12).toString() : hourInt.toString();
    resepctiveTime += hourInt >= 12 ? 'PM' : 'AM';
    return resepctiveTime;
  }
  return '';
}

/**
 * calculates if the time is showing withing 15 min of the shown time (the red line). This is used in day and weekDay.
 * @returns Time the current time that the view is showing
 */
export default function useTimeHidden() {
  const [hiddenTime, setHiddenTime] = useState<string>('');

  useEffect(() => {
    const interval = setInterval(() => {
      if (isDateToday(new Date(store.getState().selectedDate))) {
        setHiddenTime(calculateHiddenTime(new Date()));
      } else {
        setHiddenTime('');
      }
    }, 1000);

    return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
  }, []);

  return hiddenTime;
}
