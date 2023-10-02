//Andrew Mainella
//Pauly 

import { orgWideGroupID } from "../../PaulyConfig";
import callMsGraph from "../Ultility/microsoftAssets";
import { loadingStateEnum } from "../../types";
import store from "../../Redux/store";
import { Data } from "@react-google-maps/api";
import getDressCode from "../Homepage/getDressCode";

//Defaults to org wide events
export async function getGraphEvents(url?: string, referenceUrl?: string): Promise<{ result: loadingStateEnum; events?: eventType[]; nextLink?: string}> {
  const result = await callMsGraph((url !== undefined) ? url:`https://graph.microsoft.com/v1.0/groups/${orgWideGroupID}/calendar/events?$expand=singleValueExtendedProperties&$select=id,subject,start,end,isAllDay,singleValueExtendedProperties`, "GET", true)
  if (result.ok){
    const data = await result.json()
    var newEvents: eventType[] = []
    for(var index = 0; index < data["value"].length; index++) {
      const eventTypeExtensionID = store.getState().paulyList.eventTypeExtensionId
      const eventDataExtensionID = store.getState().paulyList.eventDataExtensionId
      const singleValueExtendedProperties: {id: string, value: string}[] = data["value"][index]["singleValueExtendedProperties"]
      const eventType: string | undefined = (data["value"][index]["singleValueExtendedProperties"] !== undefined) ? singleValueExtendedProperties.find((e: {id: string, value: string}) => {return  e.id === eventDataExtensionID})?.value:undefined
      const eventData: string | undefined = (data["value"][index]["singleValueExtendedProperties"] !== undefined) ? singleValueExtendedProperties.find((e: {id: string, value: string}) => {return  e.id === eventTypeExtensionID})?.value:undefined
      newEvents.push({
        id: data["value"][index]["id"],
        name: data["value"][index]["subject"],
        startTime: data["value"][index]["start"]["dateTime"],
        endTime: data["value"][index]["end"]["dateTime"],
        allDay: data["value"][index]["isAllDay"],
        eventColor: "white",
        paulyEventType: (eventType === "schoolYear") ? "schoolYear":(eventType === "schoolDay") ? "schoolDay":undefined,
        paulyEventData: eventData,
        microsoftEvent: true,
        microsoftReference: (referenceUrl !== undefined) ? referenceUrl + data["value"][index]["id"]:"https://graph.microsoft.com/v1.0/groups/" + orgWideGroupID + "/calendar/events/" + data["value"][index]["id"]
      })
    }
    return {result: loadingStateEnum.success, events: newEvents, nextLink: data["@odata.nextLink"]}
  } else {
    return {result: loadingStateEnum.failed}
  }
}

//Gets an event from paulys team
export async function getEvent(id: string): Promise<{result: loadingStateEnum, data?: eventType}> {
  const result = await callMsGraph("https://graph.microsoft.com/v1.0/groups/" + orgWideGroupID + `/calendar/events/${id}?$expand=singleValueExtendedProperties($filter=id%20eq%20'${store.getState().paulyList.eventTypeExtensionId}'%20or%20id%20eq%20'${store.getState().paulyList.eventDataExtensionId}')`, "GET", true)
  if (result.ok){
    const data = await result.json()
    var event: eventType = {
      id: data["id"],
      name: data["subject"],
      startTime: data["start"]["dateTime"],
      endTime: data["end"]["dateTime"],
      allDay: data["isAllDay"],
      eventColor: "white",
      microsoftEvent: true,
      microsoftReference: "https://graph.microsoft.com/v1.0/groups/" + orgWideGroupID + "/calendar/events/" + data["id"]
    }
    if (data["singleValueExtendedProperties"] !== undefined){
      const eventData: {id: string, value: string}[] = data["singleValueExtendedProperties"]
      const eventType = eventData.find((e) => {return e.id === store.getState().paulyList.eventTypeExtensionId})?.value 
      event["paulyEventType"] = (eventType === "schoolDay") ? "schoolDay":(eventType === "schoolYear") ? "schoolYear":undefined
      event["paulyEventData"] = eventData.find((e) => {return e.id === store.getState().paulyList.eventDataExtensionId})?.value
    }
    return {result: loadingStateEnum.success, data: event}
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
          id: data["value"][0]["fields"]["scheduleId"],
          color:  data["value"][0]["fields"]["scheduleColor"]
        }
        return {result: loadingStateEnum.success, schedule: resultSchedule}
      } else {
        return {result: loadingStateEnum.failed, schedule: undefined}
      }
    } else {
      return {result: loadingStateEnum.failed, schedule: undefined}
    }
  } else {
    return {result: loadingStateEnum.failed, schedule: undefined}
  }
}
  
export async function getTimetable(timetableId: string): Promise<{result: loadingStateEnum, timetable?: timetableType}> {
  const result = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + store.getState().paulyList.siteId + "/lists/" + store.getState().paulyList.timetablesListId + "/items?expand=fields&$filter=fields/timetableId%20eq%20'" + timetableId +"'")
  if (result.ok) {
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
          console.log(dressCodeResult)
          if (dressCodeResult.result === loadingStateEnum.success && dressCodeResult.data !== undefined){
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
    return {result: loadingStateEnum.failed}
  }
}

export async function getSchoolDay(selectedDate: Date): Promise<{ result: loadingStateEnum; event?: eventType; }> {
  const startDate: string = new Date(Date.UTC(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 0)).toISOString().slice(0, -1) + "0000"
  const endDate: string = new Date(Date.UTC(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1, 0)).toISOString().slice(0, -1) + "0000"
  const result = await callMsGraph("https://graph.microsoft.com/v1.0/groups/" + orgWideGroupID + `/calendar/events?$expand=singleValueExtendedProperties($filter=id%20eq%20'${store.getState().paulyList.eventTypeExtensionId}'%20or%20id%20eq%20'${store.getState().paulyList.eventDataExtensionId}')&$filter=singleValueExtendedProperties/Any(ep:%20ep/id%20eq%20'${store.getState().paulyList.eventTypeExtensionId}'%20and%20ep/value%20eq%20'schoolDay')%20and%20start/dateTime%20eq%20'${startDate}'%20and%20end/dateTime%20eq%20'${endDate}'`, "GET", true)
  if (result.ok) {
    const data = await result.json()
    for(var index = 0; index < data["value"].length; index++){
      const eventTypeExtensionID = store.getState().paulyList.eventTypeExtensionId
      const eventDataExtensionID = store.getState().paulyList.eventDataExtensionId
      if (data["value"][index]["singleValueExtendedProperties"] !== undefined) {
        const eventData: {id: string, value: string}[] = data["value"][index]["singleValueExtendedProperties"]
        if (eventData !== undefined) {
          if (eventData.find((e) => {if (e !== undefined) {return e.id === eventTypeExtensionID}}).value === "schoolDay") {
            const event: eventType = {
              id: data["value"][index]["id"],
              name: data["value"][index]["subject"],
              startTime: data["value"][index]["start"]["dateTime"],
              endTime: data["value"][index]["end"]["dateTime"],
              allDay: data["value"][index]["isAllDay"],
              eventColor: "white",
              microsoftEvent: true,
              microsoftReference: "https://graph.microsoft.com/v1.0/groups/" + orgWideGroupID + "/calendar/events/" + data["value"][index]["id"],
              paulyEventType: (eventData.find((e) => {return e.id === eventTypeExtensionID}).value === "schoolDay") ? "schoolDay":undefined,
              paulyEventData: eventData.find((e) => {return e.id === eventDataExtensionID}).value
            }
            return {result: loadingStateEnum.success, event: event}
          }
        }
        return {result: loadingStateEnum.failed}
      }
      return {result: loadingStateEnum.failed}
    }
    return {result: loadingStateEnum.failed}
  } else {
    return {result: loadingStateEnum.failed}
  }
}

export async function getSchoolDays(date: Date) {
  var firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().replace(/.\d+Z$/g, "Z").split(/[T ]/i, 1)[0] + "T00:00:00.0000000"
  var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().replace(/.\d+Z$/g, "Z").split(/[T ]/i, 1)[0] + "T00:00:00.0000000"
  const result = await callMsGraph(`https://graph.microsoft.com/v1.0/groups/${orgWideGroupID}/calendar/events?$expand=singleValueExtendedProperties($filter=id%20eq%20'${store.getState().paulyList.eventTypeExtensionId}'%20or%20id%20eq%20'${store.getState().paulyList.eventDataExtensionId}')&$filter=singleValueExtendedProperties/Any(ep:%20ep/id%20eq%20'${store.getState().paulyList.eventTypeExtensionId}'%20and%20ep/value%20eq%20'schoolDay')%20and%20start/DateTime%20ge%20'${firstDay}'%20AND%20end/DateTime%20le%20'${lastDay}'`, "GET", true)
  if (result.ok) {
    const data = await result.json()
    console.log(data)
  }
}