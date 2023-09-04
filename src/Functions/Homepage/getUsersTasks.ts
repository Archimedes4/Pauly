import { loadingStateEnum, taskImportanceEnum } from "../../types";
import callMsGraph from "../Ultility/microsoftAssets";

export default async function getUsersTasks(): Promise<{result: loadingStateEnum, data?: taskType[]}> {
    const tasksResult = await callMsGraph("https://graph.microsoft.com/v1.0/me/todo/lists/Tasks/tasks")
    if (tasksResult.ok){
        const taskData = await tasksResult.json()
        var resultTasks: taskType[] = []
        for (var index = 0; index < taskData["value"].length; index++){
            resultTasks.push({
                name: taskData["value"][index]["title"],
                id: taskData["value"][index]["id"],
                importance: (taskData["value"][index]["importance"] === "high") ?  taskImportanceEnum.high:(taskData["value"][index]["importance"] === "low") ?  taskImportanceEnum.low:taskImportanceEnum.normal
            })
        }
        return {result: loadingStateEnum.success, data: resultTasks}
    } else {
        return {result: loadingStateEnum.failed}
    }
}