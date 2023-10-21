//July 21 2023
//Andrew Mainella
//Calendar functions

export function getDaysInMonth(input: Date): number{
  let d = new Date();
  d.setFullYear(input.getFullYear(), input.getMonth() + 1, 0)
  return d.getDate()
}

export function getDay(value: number, startdate: number): number | undefined {
  let offset: number = 0
  let let1: number = value/5.0
  let let2: number = Math.floor(let1)
  let let4: number = let2 * 2
  offset += let4
  let result: number = ((value - startdate) + 2) + offset
  let month = new Date()
  let d = new Date(month.getFullYear(), month.getMonth() + 1, 0)
  let DayInt = d.getDate()
  if (result >= (DayInt + 1)) {
      return undefined
  }
  return result
}

export function findFirstDayinMonth(currentTime: Date): number {
  let year = currentTime.getFullYear()
  let month = currentTime.getMonth()
  const weekDay = new Date(year, month).getDay()  
  return weekDay
  //Returns a which weekday day is the first day of the month.
  //Sunday is 0, Saturday is 6
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
};

//July 17 2023
//Andrew Mainella
//
//Converting a year to a school year.
//The year converted is the year of the graduating class
//
//For example 2024 would return 2023-2024

export function convertYearToSchoolYear(year: number) {
  return (year - 1) + "-" + year
}

export function calculateIfShowing(value: String, Time: Date): boolean { //TO DO shorten
  if (isDateToday(Time)) {
    const hourInt = Time.getHours()
    const minuiteInt = Time.getMinutes()
    if (minuiteInt + 15 >= 60){
      let resepctiveTime: string = "" + (hourInt > 12) ? (hourInt - 12).toString():hourInt.toString()
      resepctiveTime += (hourInt > 12) ? "PM":"AM"
      if (resepctiveTime === value){
        return false
      } else {
        return true
      }
    } else if (minuiteInt - 15 <= 0) {
      let resepctiveTime: string = "" + (hourInt > 12) ? (hourInt - 12).toString():hourInt.toString()
      resepctiveTime += (hourInt > 12) ? "PM":"AM"
      if (resepctiveTime === value){
        return false
      } else {
        return true
      }
    } else {
      return true
    }
  } else {
    return true
  }
}

export function findTimeOffset(time: Date, height: number): number {
  let hourWidth = height * 0.1;
  let minutieWidth = (height * 0.1)/60;
  let hourInt = time.getHours();
  let minuiteInt = time.getMinutes();
  let returnOffset = (hourWidth * hourInt) + (minutieWidth * minuiteInt);
  return returnOffset;
};

//Ryan was here April 13, 2023
//Andrew was here April 13, 2023

export function computeEventHeight(fromDate: Date, toDate: Date, height: number): number {
  let delta = toDate.getTime() - fromDate.getTime();
  if (delta >= 86400000) {
    delta = 86400000;
  };

  let deltaHours = delta/3600000;
  let deltaRemaining = delta % 3600000;
  let deltaMinutes = deltaRemaining / 60;
  
  const HourHeight = height * 0.1
  const MinuteHeight = (height * 0.1)/60

  let ReturnOffset = (HourHeight * deltaHours) + (MinuteHeight * deltaMinutes)
  return ReturnOffset
}

function getHorizontalOffset() {
  
}