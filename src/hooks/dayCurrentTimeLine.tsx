/*
  Pauly
  Andrew Mainella
*/
import { findTimeOffset } from '@utils/calendar/calendarFunctions';
import { useCallback, useEffect, useState } from 'react';

export default function dayCurrentTimeLine(height: number) {
  const [currentMinuteInt, setCurrentMinuteInt] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<string>('12:00');
  const [heightOffsetTop, setHeightOffsetTop] = useState<number>(0);

  function setCurrentTimeFunction(hour: number, minuite: number) {
    if (minuite.toString().length === 1) {
      if (hour === 12) {
        setCurrentTime(`12:0${minuite.toString()}`);
      } else {
        setCurrentTime(`${(hour % 12).toString()}:0${minuite.toString()}`);
      }
    } else if (hour === 12) {
      setCurrentTime(`12:${minuite}`);
    } else {
      setCurrentTime(`${(hour % 12).toString()}:${minuite.toString()}`);
    }
  }

  // https://stackoverflow.com/questions/65049812/how-to-call-a-function-every-minute-in-a-react-component
  // Upadtes every second
  useEffect(() => {
    const interval = setInterval(() => {
      const minuiteInt = new Date().getMinutes();
      if (currentMinuteInt !== minuiteInt!) {
        setCurrentMinuteInt(minuiteInt);

        const hourInt = new Date().getHours();
        if (minuiteInt.toString().length === 1) {
          setCurrentTimeFunction(hourInt, minuiteInt);
        } else {
          setCurrentTimeFunction(hourInt, minuiteInt);
        }
        setHeightOffsetTop(findTimeOffset(new Date(), height));
      }
    }, 1000);

    return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
  }, [currentMinuteInt, height]);

  const loadCalendarContent = useCallback(() => {
    const currentDate = new Date();
    const resultHeightTopOffset = findTimeOffset(currentDate, height);
    setHeightOffsetTop(resultHeightTopOffset);
    const minuiteInt: number = currentDate.getMinutes();
    setCurrentMinuteInt(minuiteInt);
    const hourInt = currentDate.getHours();
    setCurrentTimeFunction(hourInt, minuiteInt);
  }, [height]);

  useEffect(() => {
    loadCalendarContent();
  }, [height]);

  return {
    currentTime,
    heightOffsetTop,
  };
}
