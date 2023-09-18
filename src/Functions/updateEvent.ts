import { orgWideGroupID } from "../PaulyConfig"
import { addEventSlice } from "../Redux/reducers/addEventReducer"
import { currentEventsSlice } from "../Redux/reducers/currentEventReducer"
import store from "../Redux/store"
import { loadingStateEnum, paulyEventType } from "../types"
import callMsGraph from "./Ultility/microsoftAssets"

export default async function createEvent(): Promise<loadingStateEnum> {
  var data = {
    "subject": store.getState().addEvent.eventName,
    "start": {
      "dateTime": store.getState().addEvent.startDate.replace(/.\d+Z$/g, "Z"),
      "timeZone": "Central America Standard Time"
    },
    "end": {
      "dateTime": store.getState().addEvent.endDate.replace(/.\d+Z$/g, "Z"),
      "timeZone": "Central America Standard Time"
    }
  }
  if (store.getState().addEvent.selectedEventType === paulyEventType.schoolDay) {
    if (store.getState().addEvent.selectedSchoolDayData === undefined) return
    data["start"]["dateTime"] = store.getState().addEvent.startDate.replace(/.\d+Z$/g, "Z").split(/[T ]/i, 1)[0] + "T00:00:00.0000000"
    var newEndDate = new Date(store.getState().addEvent.startDate)
    newEndDate.setDate(new Date(store.getState().addEvent.startDate).getDate() + 1)
    data["end"]["dateTime"] = newEndDate.toISOString().replace(/.\d+Z$/g, "Z").split(/[T ]/i, 1)[0] + "T00:00:00.0000000"
    data["isAllDay"] = true
    data["subject"] = store.getState().addEvent.selectedSchoolDayData.schoolDay.name + " " + store.getState().addEvent.selectedSchoolDayData.schedule.properName
  } else if (store.getState().addEvent.allDay) {
    data["start"]["dateTime"] = store.getState().addEvent.startDate.replace(/.\d+Z$/g, "Z").split(/[T ]/i, 1)[0] + "T00:00:00.0000000"
    data["end"]["dateTime"] = store.getState().addEvent.endDate.replace(/.\d+Z$/g, "Z").split(/[T ]/i, 1)[0] + "T00:00:00.0000000"
    data["isAllDay"] = true
  }
  if (store.getState().addEvent.selectedEventType === paulyEventType.schoolYear) {
    data["singleValueExtendedProperties"] = [
      {
        "id":store.getState().paulyList.eventTypeExtensionId,
        "value":"schoolYear"
      },
      {
        "id":store.getState().paulyList.eventDataExtensionId,
        "value":store.getState().addEvent.selectedTimetable.id
      }
    ]
  } else if (store.getState().addEvent.selectedEventType === paulyEventType.schoolDay && store.getState().addEvent.selectedSchoolDayData !== undefined) {
    const selectedSchoolDayDataCompressed: schoolDayDataCompressedType = {
      schoolDayId: store.getState().addEvent.selectedSchoolDayData.schoolDay.id,
      scheduleId: store.getState().addEvent.selectedSchoolDayData.schedule.id,
      dressCodeId: store.getState().addEvent.selectedSchoolDayData.dressCode.id,
      semester: store.getState().addEvent.selectedSchoolDayData.semester,
      dressCodeIncentiveId: store.getState().addEvent.selectedSchoolDayData.dressCodeIncentive?.id,
      schoolYearEventId: store.getState().addEvent.selectedSchoolYear.id
    }
    data["singleValueExtendedProperties"] = [
      {
        "id":store.getState().paulyList.eventTypeExtensionId,
        "value":"schoolDay"
      },
      {
        "id":store.getState().paulyList.eventDataExtensionId,
        "value":JSON.stringify(selectedSchoolDayDataCompressed)
      }
    ]
  }
  if (store.getState().addEvent.recurringEvent) {
  }
  const result = await callMsGraph("https://graph.microsoft.com/v1.0/groups/" + orgWideGroupID + "/calendar/events", "POST", true, JSON.stringify(data))
  if (result.ok){
    const dataOut = await result.json()
    const resultEvent: eventType = {
      id: data["id"],
      name: dataOut["subject"],
      startTime: new Date(dataOut["start"]["dateTime"]),
      endTime: new Date(dataOut["end"]["dateTime"]),
      eventColor: "white",
      paulyEventType: (store.getState().addEvent.selectedEventType === paulyEventType.schoolDay) ? "schoolDay":(store.getState().addEvent.selectedEventType === paulyEventType.schoolYear) ? "schoolYear":undefined,
      paulyEventData: (store.getState().addEvent.selectedEventType === paulyEventType.schoolDay) ? JSON.stringify(store.getState().addEvent.selectedSchoolDayData):(store.getState().addEvent.selectedEventType === paulyEventType.schoolYear) ? store.getState().addEvent.selectedTimetable.id:undefined,
      microsoftEvent: true,
      microsoftReference: ""
    }
    store.dispatch(currentEventsSlice.actions.pushEvent(JSON.stringify(resultEvent)))
    store.dispatch(addEventSlice.actions.setCreateEventState(loadingStateEnum.success))
  } else {
    store.dispatch(addEventSlice.actions.setCreateEventState(loadingStateEnum.failed))
  }
}