import store from "../Redux/store";
import { loadingStateEnum, semesters } from "../types";
import { getSchedule } from "./Calendar/calendarFunctionsGraph";
import callMsGraph from "./Ultility/microsoftAssets";

export default async function getClassEvents(scheduleId: string, semester: semesters, schoolYearEventId: string, schoolDay: schoolDayType, date: Date): Promise<{result: loadingStateEnum, data?: eventType[]}> {
  const scheduleResult = await getSchedule(scheduleId)
  if (scheduleResult.result === loadingStateEnum.success && scheduleResult.schedule !== undefined) {
    var classes: classType[] = []
    var classQuery: string = `https://graph.microsoft.com/v1.0/me/joinedTeams?$select=displayName,id,${store.getState().paulyList.classExtensionId}`
    while (classQuery !== undefined) {
      const classResult = await callMsGraph(classQuery)
      if (classResult.ok) {
        const classResultData = await classResult.json()
        var batchDataRequests: {id: string, method: string, url: string}[][] = [[]]
        for (var index = 0; index < classResultData["value"].length; index++) {
          batchDataRequests[Math.floor(index/20)].push({
            id: (index + 1).toString(),
            method: "GET",
            url: `/groups/${classResultData["value"][index]["id"]}?$select=displayName,id,${store.getState().paulyList.classExtensionId}`
          })
        }
        const batchHeaders = new Headers()
        batchHeaders.append("Accept", "application/json")
        for (var index = 0; index < batchDataRequests.length; index++) {
          const batchData = {
            "requests":batchDataRequests[index]
          }
          const batchResult = await callMsGraph("https://graph.microsoft.com/v1.0/$batch", "POST", undefined, JSON.stringify(batchData))
          if (batchResult.ok){
            const batchResultData = await batchResult.json()
            for (var batchIndex = 0; batchIndex < batchResultData["responses"].length; batchIndex++) {
              if (batchResultData["responses"][batchIndex]["status"] === 200) {
                if (batchResultData["responses"][batchIndex]["body"][store.getState().paulyList.classExtensionId] !== undefined) {
                  //Check if school year is the same for school day and class
                  if (batchResultData["responses"][batchIndex]["body"][store.getState().paulyList.classExtensionId]["schoolYearEventId"] === schoolYearEventId && semester === parseInt(batchResultData["responses"][batchIndex]["body"][store.getState().paulyList.classExtensionId]["semesterId"])) {
                    classes.push({
                      name: batchResultData["responses"][batchIndex]["body"]["displayName"],
                      id: batchResultData["responses"][batchIndex]["body"]["id"],
                      periods: JSON.parse(batchResultData["responses"][batchIndex]["body"][store.getState().paulyList.classExtensionId]["periodData"])
                    })
                  }
                }
              } else {
                return {result: loadingStateEnum.failed}
              }
            }
          } else {
            return {result: loadingStateEnum.failed}
          }
        }
        classQuery = classResultData["@odata.nextLink"]
      } else {
        return {result: loadingStateEnum.failed}
      }
    }
    var outputEvents: eventType[] = []
    for (var index = 0; index < classes.length; index++) {
      //This check should never fail
      if (classes[index].periods.length > schoolDay.order){
        //Find Time
        
        const period: number = classes[index].periods[schoolDay.order]
        const periodData = scheduleResult.schedule.periods[period]
        console.log(periodData)
        var startDate: Date = new Date(date.toISOString())
        startDate.setHours(periodData.startHour)
        startDate.setMinutes(periodData.startMinute)
        startDate.setSeconds(0)
        var endDate: Date = date
        endDate.setHours(periodData.endHour)
        endDate.setMinutes(periodData.endMinute)
        endDate.setSeconds(0)
        outputEvents.push({
          id: classes[index].id,
          name: classes[index].name,
          startTime: startDate,
          endTime: endDate,
          eventColor: "white",
          microsoftEvent: false
        })
      }
    }
    return {result: loadingStateEnum.success, data: outputEvents}
  } else {
    return {result: loadingStateEnum.failed}
  }
}