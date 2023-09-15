import store from "../Redux/store";
import { loadingStateEnum, semesters } from "../types";
import { getSchedule } from "./Calendar/calendarFunctionsGraph";
import callMsGraph from "./Ultility/microsoftAssets";

export default async function getClassEvents(scheduleId: string, semester: semesters) {
  const scheduleResult = await getSchedule(scheduleId)
  if (scheduleResult.result === loadingStateEnum.success && scheduleResult.schedule !== undefined) {
    var classes: classType[] = []
    var classQuery: string = undefined
    while (classQuery !== undefined) {
      const classResult = await callMsGraph(classQuery)
      if (classResult.ok) {
        const classResultData = await classResult.json()
        for (var index = 0; index < classResultData["value"].length; index++) {
          classes.push({
            name: classResultData["value"][index]["id"],
            id: classResultData["value"][index]["id"],
            periods: classResultData["value"][index][store.getState().paulyList.classExtensionId][""]
          })
        }
        classQuery = classResultData["@odata.nextLink"]
      }
    }
  }
}