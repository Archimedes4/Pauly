//July 21 2023
//Andrew Mainella
//Calendar functions

import callMsGraph from "./microsoftAssets";
import { orgWideGroupID, siteID } from "../PaulyConfig";
import { calendarEventsSlice } from "../Redux/reducers/calendarEventReducer";
import { calendarEventsSchoolYearSlice } from "../Redux/reducers/calendarEventSchoolYearReducer";
import store from "../Redux/store";

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

export async function getOrgWideEvents(accessToken: string, schoolYear: boolean, eventsIn?: eventType[], url?: string) {
    const result = await callMsGraph(accessToken, (url !== undefined) ? url:"https://graph.microsoft.com/v1.0/groups/" + orgWideGroupID + "/calendar/events?$select=ext9u07b055_paulyEvents", "GET", true)
    if (result.ok){
      const data = await result.json()
      console.log("ORg Data", data)
      var newEvents: eventType[] = (eventsIn !== undefined) ? eventsIn:[]
      for(var index = 0; index < data["value"].length; index++) {
        if (schoolYear) {
          //TO DO update extention value
          if (data["value"][index]["ext9u07b055_paulyEvents"] !== undefined) {
            if (data["value"][index]["ext9u07b055_paulyEvents"]["eventType"] === "schoolYear") {
              newEvents.push({
                id: data["value"][index]["id"],
                name: data["value"][index]["subject"],
                startTime: new Date(data["value"][index]["start"]["dateTime"]),
                endTime: new Date(data["value"][index]["end"]["dateTime"]),
                eventColor: "white",
                schoolYearData: data["value"][index]["ext9u07b055_paulyEvents"]["eventData"]
              })
            }
          }
        } else {
          newEvents.push({
            id: data["value"][index]["id"],
            name: data["value"][index]["subject"],
            startTime: new Date(data["value"][index]["start"]["dateTime"]),
            endTime: new Date(data["value"][index]["end"]["dateTime"]),
            eventColor: "white"
          })
        }
      }
      if (data["@odata.nextLink"] !== undefined && data["@odata.nextLink"] !== null) {
        getOrgWideEvents(accessToken, schoolYear, newEvents, data["@odata.nextLink"])
      } else {
        var resultArray: string[] = []
        for(var index = 0; index < newEvents.length; index++) {
          resultArray.push(JSON.stringify(newEvents[index]))
        }
        if (schoolYear) {
          const { setCurrentEventsSchoolYear } = calendarEventsSchoolYearSlice.actions;
          store.dispatch(setCurrentEventsSchoolYear(resultArray))
        } else {
          const { setCurrentEvents } = calendarEventsSlice.actions;
          store.dispatch(setCurrentEvents(resultArray))
        }
      }
    } else {
      const data = await result.json()
      console.log(data)
    }
}

export async function getCalendarId(accessToken: string, url: string): Promise<{result: "Error"|"Success", id?: string}> {
  const result = await callMsGraph(accessToken, url)
  if (result.ok){
    const data = await result.json()
    return({result: "Success", id: data["id"]})
  } else {
    return({result: "Error"})
  }
}

enum loadingStateEnum {
  loading,
  success,
  failed
}

async function getSchedule(accessToken: string, id: string): Promise<{result: loadingStateEnum, schedule?: scheduleType}> {
  const result = await callMsGraph(accessToken, "https://graph.microsoft.com/v1.0/sites/" + siteID + "/lists/b2250d2c-0301-4605-87fe-0b65ccf635e9/items?expand=fields&$filter=fields/scheduleId%20eq%20'" + id +"'")//TO DO fix site id
  if (result.ok) {
    const data = await result.json()
    console.log(data)
    if (data["value"].length !== undefined) {
      if (data["value"].length === 1) {
        const resultSchedule: scheduleType = {
          name: data["value"][0]["fields"]["name"],
          periods: JSON.parse(data["value"][0]["fields"]["scheduleData"]) as periodType[],
          id: data["value"][0]["fields"]["scheduleId"]
        }
        return {result: loadingStateEnum.success, schedule: resultSchedule}
      } else {
        return {result: loadingStateEnum.failed, schedule: undefined}
      }
    } else {
      return {result: loadingStateEnum.failed, schedule: undefined}
    }
  } else {
    const data = await result.json()
    console.log(data)
    return {result: loadingStateEnum.failed, schedule: undefined}
  }
}

export async function getTimetable(accessToken: string, timetableId: string): Promise<{result: loadingStateEnum, timetable?: timetableType}> {
  const result = await callMsGraph(accessToken, "https://graph.microsoft.com/v1.0/sites/" + siteID + "/lists/72367e66-6d0f-4beb-8b91-bb6e9be9b433/items?expand=fields&$filter=fields/timetableId%20eq%20'" + timetableId +"'")//TO DO fix site id
  if (result.ok) {
    console.log(result)
    const data = await result.json()
    console.log(data)
    if (data["value"].length !== undefined){
      if (data["value"].length === 1) {
        try {
          const scheduleData: string[] = JSON.parse(data["value"][0]["fields"]["timetableDataSchedules"])
          var newSchedules: scheduleType[] = []
          for (var index = 0; index < scheduleData.length; index++) {
            const result = await getSchedule(accessToken, scheduleData[index])
            if (result.result === loadingStateEnum.success && result.schedule !== undefined) {
              newSchedules.push(result.schedule)
            } else {
              return {result: loadingStateEnum.failed}
            }
          }
          const resultingTimetable: timetableType = {
            name: data["value"][0]["fields"]["timetableName"],
            id: data["value"][0]["fields"]["timetableId"],
            schedules: newSchedules,
            days: JSON.parse(data["value"][0]["fields"]["timetableDataDays"])
          }
          return {result: loadingStateEnum.success, timetable: resultingTimetable}
        } catch (e) {
          return {result: loadingStateEnum.failed}
        }
      } else {
        return {result: loadingStateEnum.failed}
      }
    } else {
      return {result: loadingStateEnum.failed}
    }
  } else {
    const data = await result.json()
    console.log(data)
    return {result: loadingStateEnum.failed}
  }
}