import { loadingStateEnum, taskImportanceEnum } from "../types";
import callMsGraph from "./microsoftAssets";

export default async function getUsersTasks(): Promise<{result: loadingStateEnum, data?: TaskType[]}> {
    const listResult = await callMsGraph("https://graph.microsoft.com/v1.0/me/todo/lists?$filter=displayName%20eq%20'Tasks'")
    if (listResult.ok){
        const listData = await listResult.json()
        if (listData["value"].length <= 0) {
            const taskListId = listData["value"][0]["id"]
            const taskResult = await callMsGraph("https://graph.microsoft.com/v1.0/me/todo/lists/" + taskListId + "/tasks")
            if (taskResult.ok) {
                const taskData = await taskResult.json()
                var resultTasks: TaskType[] = []
                for (var index = 0; index < taskData["value"].lengh; index++){
                    resultTasks.push({
                        name: taskData["value"][index]["title"],
                        id: taskData["value"][index]["id"],
                        listId: taskListId,
                        importance: (taskData["value"][index]["importance"] === "high") ?  taskImportanceEnum.high:(taskData["value"][index]["importance"] === "low") ?  taskImportanceEnum.low:taskImportanceEnum.normal
                    })
                }
                return {result: loadingStateEnum.success, data: resultTasks}
            } else {
                return {result: loadingStateEnum.failed}
            }
        } else {
            const listResult = await callMsGraph("https://graph.microsoft.com/v1.0/me/todo/lists")
        }
        console.log(listData)
        return {result: loadingStateEnum.success}
    } else {
        console.log("Something went wrong")
        const listData = await listResult.json()
        console.log(listData)
        return {result: loadingStateEnum.failed}
    }
}