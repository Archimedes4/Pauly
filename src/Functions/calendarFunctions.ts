//July 21 2023
//Andrew Mainella
//Calendar functions

export function getDaysInMonth(input: Date): number{
    var d = new Date();
    d.setFullYear(input.getFullYear(), input.getMonth() + 1, 0)
    return d.getDate()
}

export function getDay(value: number, startdate: number): number | undefined {
    var offset: number = 0
    let var1: number = value/5.0
    let var2: number = Math.floor(var1)
    let var4: number = var2 * 2
    offset += var4
    let result: number = ((value - startdate) + 2) + offset
    var month = new Date()
    var d = new Date(month.getFullYear(), month.getMonth() + 1, 0)
    let DayInt = d.getDate()
    if (result >= (DayInt + 1)) {
        return undefined
    }
    return result
}

export function findFirstDayinMonth(currentTime: Date): number {
    var year = currentTime.getFullYear()
    var month = currentTime.getMonth()
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

export function getEventFromJSON(input: string): eventType {
  var result = JSON.parse(input)
  result["endTime"] = new Date(result["endTime"])
  result["startTime"] = new Date(result["startTime"])
  return result
}