import { orgWideGroupID} from "../PaulyConfig";
import callMsGraph from "./Ultility/microsoftAssets";
import { loadingStateEnum } from "../types";
import store from "../Redux/store";
import { Data } from "@react-google-maps/api";
import getDressCode from "./Homepage/getDressCode";

//Defaults to org wide events
export async function getGraphEvents(schoolYear: boolean, url?: string, referenceUrl?: string): Promise<{ result: loadingStateEnum; events?: eventType[]; nextLink?: string; }> {
  const result = await callMsGraph((url !== undefined) ? url:"https://graph.microsoft.com/v1.0/groups/" + orgWideGroupID + "/calendar/events?$select=ext9u07b055_paulyEvents", "GET", true)
  if (result.ok){
    const data = await result.json()
    var newEvents: eventType[] = []
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
              paulyEventType: data["value"][index]["ext9u07b055_paulyEvents"]["eventType"],
              paulyEventData: data["value"][index]["ext9u07b055_paulyEvents"]["eventData"],
              microsoftEvent: true,
              microsoftReference: (referenceUrl !== undefined) ? referenceUrl + data["value"][index]["id"]:"https://graph.microsoft.com/v1.0/groups/" + orgWideGroupID + "/calendar/events/" + data["value"][index]["id"]
            })
          }
        }
      } else {
        const newEvent: eventType = {
          id: data["value"][index]["id"],
          name: data["value"][index]["subject"],
          startTime: new Date(data["value"][index]["start"]["dateTime"]),
          endTime: new Date(data["value"][index]["end"]["dateTime"]),
          eventColor: "white",
          microsoftEvent: true,
          microsoftReference: (referenceUrl !== undefined) ? referenceUrl + data["value"][index]["id"]:"https://graph.microsoft.com/v1.0/groups/" + orgWideGroupID + "/calendar/events/" + data["value"][index]["id"]
        }
        newEvents.push(newEvent)
      }
    }
    return {result: loadingStateEnum.success, events: newEvents, nextLink: data["@odata.nextLink"]}
  } else {
    return {result: loadingStateEnum.failed}
  }
}
  
export async function getSchedule(id: string): Promise<{result: loadingStateEnum, schedule?: scheduleType}> {
  const result = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + store.getState().paulyList.siteId + "/lists/" + store.getState().paulyList.scheduleListId + "/items?expand=fields&$filter=fields/scheduleId%20eq%20'" + id +"'")//TO DO fix site id
  if (result.ok) {
    const data = await result.json()
    console.log(data)
    if (data["value"].length !== undefined) {
      if (data["value"].length === 1) {
        const resultSchedule: scheduleType = {
          properName: data["value"][0]["fields"]["scheduleProperName"],
          descriptiveName: data["value"][0]["fields"]["scheduleDescriptiveName"],
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
  
export async function getTimetable(timetableId: string): Promise<{result: loadingStateEnum, timetable?: timetableType}> {
  const result = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + store.getState().paulyList.siteId + "/lists/" + store.getState().paulyList.timetablesListId + "/items?expand=fields&$filter=fields/timetableId%20eq%20'" + timetableId +"'")//TO DO fix site id
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
            const result = await getSchedule(scheduleData[index])
            if (result.result === loadingStateEnum.success && result.schedule !== undefined) {
              newSchedules.push(result.schedule)
            } else {
              return {result: loadingStateEnum.failed}
            }
          }
          const dressCodeResult = await getDressCode(data["value"][0]["fields"]["timetableDressCodeId"])
          if (dressCodeResult.result === loadingStateEnum.success && dressCodeResult.data !== undefined) {
            const resultingTimetable: timetableType = {
              name: data["value"][0]["fields"]["timetableName"],
              id: data["value"][0]["fields"]["timetableId"],
              schedules: newSchedules,
              days: JSON.parse(data["value"][0]["fields"]["timetableDataDays"]),
              dressCode: dressCodeResult.data
            }
            return {result: loadingStateEnum.success, timetable: resultingTimetable}
          } else {
            return {result: loadingStateEnum.failed}
          }
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

export async function getSchoolDayOnSelectedDay(selectedDate: Date): Promise<{ result: loadingStateEnum; event?: eventType; }> {
  const startDate: string = new Date(Date.UTC(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 0)).toISOString().slice(0, -1) + "0000"
  const endDate: string = new Date(Date.UTC(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1, 0)).toISOString().slice(0, -1) + "0000"
  const result = await callMsGraph("https://graph.microsoft.com/v1.0/groups/" + orgWideGroupID + "/calendar/events?$filter=start/dateTime%20eq%20'" + startDate + "'%20and%20end/dateTime%20eq%20'" + endDate + "'&$select=ext9u07b055_paulyEvents", "GET", true)
  if (result.ok) {
    const data = await result.json()
    for(var index = 0; index < data["value"].length; index++){
      if (data["value"][index]["ext9u07b055_paulyEvents"] !== undefined) {
        const event: eventType = {
          id: data["value"][index]["id"],
          name: data["value"][index]["subject"],
          startTime: new Date(data["value"][index]["start"]["dateTime"]),
          endTime: new Date(data["value"][index]["end"]["dateTime"]),
          eventColor: "white",
          microsoftEvent: true,
          microsoftReference: "https://graph.microsoft.com/v1.0/groups/" + orgWideGroupID + "/calendar/events/" + data["value"][index]["id"],
          paulyEventType: data["value"][index]["ext9u07b055_paulyEvents"]["eventType"],
          paulyEventData: data["value"][index]["ext9u07b055_paulyEvents"]["eventData"]
        }
        return {result: loadingStateEnum.success, event: event}
      }
    }
    return {result: loadingStateEnum.failed}
  } else {
    return {result: loadingStateEnum.failed}
  }
}