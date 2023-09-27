import { taskDeltaSlice } from "../../Redux/reducers/tasksReducers";
import store from "../../Redux/store";
import { loadingStateEnum, taskImportanceEnum, taskStatusEnum } from "../../types";
import callMsGraph from "../Ultility/microsoftAssets";

//deltaRunAgain is send if the delta link has failed or the responce 410 meaning syncronization is needed.
export default async function getUsersTasks(deltaRunAgain?: boolean): Promise<{result: loadingStateEnum, data?: taskType[]}> {
  var deltaMode = false
  if (store.getState().tasksDeltaLink !== "" && deltaRunAgain !== true) {deltaMode = true}
  const url = (deltaMode) ? store.getState().tasksDeltaLink:"https://graph.microsoft.com/v1.0/me/todo/lists/Tasks/tasks/delta"
  const tasksResult = await callMsGraph(url)
  if (tasksResult.ok){
    const taskData = await tasksResult.json()
    if (taskData["@odata.deltaLink"] !== undefined){
      store.dispatch(taskDeltaSlice.actions.setTaskDeltaLink(taskData["@odata.deltaLink"]))
    }
    var resultTasks: taskType[] = []
    for (var index = 0; index < taskData["value"].length; index++){
      resultTasks.push({
        name: taskData["value"][index]["title"],
        id: taskData["value"][index]["id"],
        importance: (taskData["value"][index]["importance"] === "high") ? taskImportanceEnum.high : (taskData["value"][index]["importance"] === "low") ? taskImportanceEnum.low : taskImportanceEnum.normal,
        status: (taskData["value"][index]["status"] === "notStarted") ? taskStatusEnum.notStarted:(taskData["value"][index]["status"] === "inProgress") ? taskStatusEnum.inProgress:(taskData["value"][index]["status"] === "completed") ? taskStatusEnum.completed:(taskData["value"][index]["status"] === "waitingOnOthers") ? taskStatusEnum.waitingOnOthers:taskStatusEnum.deferred,
        excess: false
      })
    }
    resultTasks.unshift({
      name: "",
      importance: taskImportanceEnum.normal,
      id: "",
      status: taskStatusEnum.notStarted,
      excess: true
    })
    return {result: loadingStateEnum.success, data: resultTasks}
  } else {
    if (deltaMode) {
      const secondAttempt = await getUsersTasks(true)
      return secondAttempt
    } else {
      return {result: loadingStateEnum.failed}
    }
  }
}