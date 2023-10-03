import store from "../Redux/store";
import { loadingStateEnum, semesters } from "../types";
import { getSchedule } from "./Calendar/calendarFunctionsGraph";
import callMsGraph from "./Ultility/microsoftAssets";

export async function getClasses(): Promise<{result: loadingStateEnum, data?: classType[]}> {
  var classQuery: string = `https://graph.microsoft.com/v1.0/me/joinedTeams?$select=id`
  var batchDataRequests: {id: string, method: string, url: string}[][] = [[]]
  while (classQuery !== "") {
    const classResult = await callMsGraph(classQuery)
    if (classResult.ok) {
      const classData = await classResult.json()
      classQuery = classData["@odata.nextLink"]

      //Batch Request perfroming a get request on each class group

      //Format Data
      for (var index = 0; index < classData["value"].length; index++) {
        batchDataRequests[Math.floor(index/20)].push({
          id: (index + 1).toString(),
          method: "GET",
          url: `/groups/${classData["value"][index]["id"]}?$select=displayName,id,${store.getState().paulyList.classExtensionId}`
        })
      }
    } else {
      return {result: loadingStateEnum.failed}
    }
  }
  //Run Queries
  const batchHeaders = new Headers()
  batchHeaders.append("Accept", "application/json")
  var classes: classType[] = []
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
            classes.push({
              name: batchResultData["responses"][batchIndex]["body"]["displayName"],
              id: batchResultData["responses"][batchIndex]["body"]["id"],
              periods: JSON.parse(batchResultData["responses"][batchIndex]["body"][store.getState().paulyList.classExtensionId]["periodData"]),
              room: {
                name: "",
                id: ""
              },
              schoolYearId: "",
              semester: semesters.semesterOne
            })
            
          }
        } else {
          return {result: loadingStateEnum.failed}
        }
      }
    } else {
      return {result: loadingStateEnum.failed}
    }
  }
  return {result: loadingStateEnum.success, data: classes}
}

export default async function getClassEvents(scheduleId: string, semester: semesters, schoolYearEventId: string, schoolDay: schoolDayType, date: Date): Promise<{result: loadingStateEnum, data?: eventType[]}> {
  const scheduleResult = await getSchedule(scheduleId)
  const classResult = await getClasses()
  if (scheduleResult.result === loadingStateEnum.success && classResult.result === loadingStateEnum.success && classResult.data !== undefined && scheduleResult.schedule !== undefined) {
    var outputEvents: eventType[] = []
    for (var index = 0; index < classResult.data.length; index++) {
      if (classResult.data[index].schoolYearId === schoolYearEventId && classResult.data[index].semester === semester) {
        //This check should never fail
        if (classResult.data[index].periods.length > schoolDay.order){
          //Find Time
          const period: number = classResult.data[index].periods[schoolDay.order]
          const periodData = scheduleResult.schedule.periods[period]
          var startDate: Date = new Date(date.toISOString())
          startDate.setHours(periodData.startHour)
          startDate.setMinutes(periodData.startMinute)
          startDate.setSeconds(0)
          var endDate: Date = date
          endDate.setHours(periodData.endHour)
          endDate.setMinutes(periodData.endMinute)
          endDate.setSeconds(0)
          outputEvents.push({
            id: classResult.data[index].id,
            name: classResult.data[index].name,
            startTime: startDate.toISOString(),
            endTime: endDate.toISOString(),
            eventColor: "white",
            microsoftEvent: false,
            allDay: false
          })
        }
      }
    }
    outputEvents.sort((a, b) => {return new Date(a.startTime).getTime() - new Date(b.startTime).getTime()})
    return {result: loadingStateEnum.success, data: outputEvents}
  } else {
    return {result: loadingStateEnum.failed}
  }
}