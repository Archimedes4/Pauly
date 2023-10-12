import { homepageDataSlice } from "../Redux/reducers/homepageDataReducer"
import store from "../Redux/store"
import { loadingStateEnum } from "../types"
import { getEvent, getSchoolDay, getTimetable } from "./calendar/calendarFunctionsGraph"
import getClassEvents from "./getClassEventsTimetable"

export default async function getClassEventsFromDay(date?: Date): Promise<{result: loadingStateEnum, data?: eventType[]}> {
  const result = await getSchoolDay(date ? date:new Date())
  if (result.result === loadingStateEnum.success && result.event !== undefined && result.event.paulyEventData !== undefined){
    const outputIds: schoolDayDataCompressedType = JSON.parse(result.event.paulyEventData)
    const eventResult = await getEvent(outputIds.schoolYearEventId)
    if (eventResult.result === loadingStateEnum.success && eventResult.data !== undefined && eventResult.data?.paulyEventData !== undefined){
      const timetableResult = await getTimetable(eventResult.data.paulyEventData)
      if (timetableResult.result === loadingStateEnum.success && timetableResult.timetable !== undefined){
        const schoolDay = timetableResult.timetable.days.find((e) => {return e.id === outputIds.schoolDayId})
        const schedule = timetableResult.timetable.schedules.find((e) => {return e.id === outputIds.scheduleId})
        const dressCode = timetableResult.timetable.dressCode.dressCodeData.find((e) => {return e.id === outputIds.dressCodeId})
        const dressCodeIncentive = timetableResult.timetable.dressCode.dressCodeIncentives.find((e) => {return e.id === outputIds?.dressCodeIncentiveId})
        if (schoolDay !== undefined && schedule !== undefined && dressCode !== undefined) {
          store.dispatch(homepageDataSlice.actions.setSchoolDayData({
            schoolDay: schoolDay,
            schedule: schedule,
            dressCode: dressCode,
            semester: outputIds.semester,
            dressCodeIncentive: dressCodeIncentive
          }))
          if (schedule !== undefined) {
            const classResult = await getClassEvents(schedule.id, outputIds.semester, outputIds.schoolYearEventId, schoolDay, new Date(result.event.startTime))
            if (classResult.result === loadingStateEnum.success && classResult.data !== undefined) {
              if (classResult.data.length >= 1) {
                const startTimeDate = new Date(classResult.data[0].startTime)
                const hourTime = (((startTimeDate.getHours() % 12) + 1 <= 9) ? `0${((startTimeDate.getHours() % 12) + 1)}`:((startTimeDate.getHours() % 12) + 1))
                const monthTime = (startTimeDate.getMinutes() <= 9) ? `0${startTimeDate.getMinutes()}`:startTimeDate.getMinutes().toString()
                store.dispatch(homepageDataSlice.actions.setStartTime( hourTime + ":" + monthTime ))
              }
              return {result: loadingStateEnum.success, data: classResult.data}
            } else {
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
    } else {
      return {result: loadingStateEnum.failed}
    }
  } else {
    return {result: loadingStateEnum.failed}
  }
}