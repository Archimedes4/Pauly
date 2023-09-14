import { orgWideGroupID } from "../PaulyConfig"
import store from "../Redux/store"
import { paulyEventType } from "../types"
import callMsGraph from "./Ultility/microsoftAssets"

export default async function createEvent() {
  var data = {
    "subject": store.getState().addEvent.eventName,
    "start": {
      "dateTime": store.getState().addEvent.startDate.toISOString().replace(/.\d+Z$/g, "Z"),
      "timeZone": "Central America Standard Time"
    },
    "end": {
      "dateTime": store.getState().addEvent.endDate.toISOString().replace(/.\d+Z$/g, "Z"),
      "timeZone": "Central America Standard Time"
    }
  }
  if (store.getState().addEvent.selectedEventType === paulyEventType.schoolDay) {
    if (store.getState().addEvent.selectedSchoolDayData === undefined) return
    data["start"]["dateTime"] = startDate.toISOString().replace(/.\d+Z$/g, "Z").split(/[T ]/i, 1)[0] + "T00:00:00.0000000"
    var newEndDate = startDate
    newEndDate.setDate(startDate.getDate() + 1)
    data["end"]["dateTime"] = newEndDate.toISOString().replace(/.\d+Z$/g, "Z").split(/[T ]/i, 1)[0] + "T00:00:00.0000000"
    data["isAllDay"] = true
    data["subject"] = store.getState().addEvent.selectedSchoolDayData.schoolDay.name + " " + selectedSchoolDayData.schedule.properName
  } else if (store.getState().addEvent.allDay) {
    data["start"]["dateTime"] = startDate.toISOString().replace(/.\d+Z$/g, "Z").split(/[T ]/i, 1)[0] + "T00:00:00.0000000"
    data["end"]["dateTime"] = endDate.toISOString().replace(/.\d+Z$/g, "Z").split(/[T ]/i, 1)[0] + "T00:00:00.0000000"
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
      paulyEventType: (selectedEventType === paulyEventType.schoolDay) ? "schoolDay":(selectedEventType === paulyEventType.schoolYear) ? "schoolYear":undefined,
      paulyEventData: (selectedEventType === paulyEventType.schoolDay) ? JSON.stringify(selectedSchoolDayData):(selectedEventType === paulyEventType.schoolYear) ? selectedTimetable.id:undefined,
      microsoftEvent: true,
      microsoftReference: ""
    }
    dispatch(currentEventsSlice.actions.pushEvent(JSON.stringify(resultEvent)))
    setCreateEventState(loadingStateEnum.success)
  } else {
    setCreateEventState(loadingStateEnum.failed)
  }
}