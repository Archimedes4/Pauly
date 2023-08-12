import { AccountInfo, IPublicClientApplication } from "@azure/msal-browser";
import { orgWideGroupID, siteID } from "../PaulyConfig";
import callMsGraph from "./microsoftAssets";

//Defaults to org wide events
export async function getGraphEvents(accessToken: string, schoolYear: boolean, instance: IPublicClientApplication, accounts: AccountInfo[], url?: string, referenceUrl?: string): Promise<{ result: loadingStateEnum; events?: eventType[]; nextLink?: string; }> {
  const result = await callMsGraph(accessToken, (url !== undefined) ? url:"https://graph.microsoft.com/v1.0/groups/" + orgWideGroupID + "/calendar/events?$select=ext9u07b055_paulyEvents", instance, accounts, "GET", true)
  if (result.ok){
    const data = await result.json()
    console.log(data)
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
              schoolYearData: data["value"][index]["ext9u07b055_paulyEvents"]["eventData"],
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
  
async function getSchedule(accessToken: string, id: string, instance: IPublicClientApplication, accounts: AccountInfo[]): Promise<{result: loadingStateEnum, schedule?: scheduleType}> {
  const result = await callMsGraph(accessToken, "https://graph.microsoft.com/v1.0/sites/" + siteID + "/lists/b2250d2c-0301-4605-87fe-0b65ccf635e9/items?expand=fields&$filter=fields/scheduleId%20eq%20'" + id +"'", instance, accounts)//TO DO fix site id
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
  
export async function getTimetable(accessToken: string, timetableId: string, instance: IPublicClientApplication, accounts: AccountInfo[]): Promise<{result: loadingStateEnum, timetable?: timetableType}> {
  const result = await callMsGraph(accessToken, "https://graph.microsoft.com/v1.0/sites/" + siteID + "/lists/72367e66-6d0f-4beb-8b91-bb6e9be9b433/items?expand=fields&$filter=fields/timetableId%20eq%20'" + timetableId +"'", instance, accounts)//TO DO fix site id
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
            const result = await getSchedule(accessToken, scheduleData[index], instance, accounts)
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