import { loadingStateEnum } from "../types"
import callMsGraph from "./Ultility/microsoftAssets"

export async function getTeams(nextLink?: string): Promise<{result: loadingStateEnum, data?: groupType[], nextLink?: string}> {
  const groupResult = await callMsGraph(nextLink ? nextLink:"https://graph.microsoft.com/v1.0/me/joinedTeams")
  if (groupResult.ok) {
    const groupResultData = await groupResult.json()
    if (groupResultData["value"] !== undefined){
      var outputData: groupType[] = []
      for(var index = 0; index < groupResultData["value"].length; index++) {
        outputData.push({
          name: groupResultData["value"][index]["displayName"],
          id: groupResultData["value"][index]["id"]
        })
      }
      return {result: loadingStateEnum.success, data: outputData, nextLink: groupResultData["@odata.nextLink"]}
    } else {
      return {result: loadingStateEnum.failed}
    }
  } else {
    return {result: loadingStateEnum.failed}
  }
}

export async function getChannels(teamId: string, nextLink?: string): Promise<{result: loadingStateEnum, data?: channelType[], nextLink?: string}> {
  const result = await callMsGraph(`https://graph.microsoft.com/v1.0/teams/${teamId}/allChannels`)
  if (result.ok) {
    const data = await result.json()
    var output: channelType[] = []
    for (var index = 0; index < data["value"].length; index++) {
      output.push({
        id: data["value"][index]["id"],
        displayName: data["value"][index]["displayName"],
        selected: false,
        loading: false,
        error: false
      })
    }
    return {result: loadingStateEnum.success, data: output, nextLink: data["@odata.nextLink"]}
  } else {
    return {result: loadingStateEnum.failed}
  }
}

export async function getPosts(teamId: string, channelId: string): Promise<{result: loadingStateEnum, data?: resourceDataType[], nextLink?: string}> {
  const result = await callMsGraph(`https://graph.microsoft.com/v1.0/teams/${teamId}/channels/${channelId}/messages`)
  if (result.ok) {
    const data = await result.json()
    var output: resourceDataType[] = []
    for (var index = 0; index < data["value"].length; index++) {
      output.push({
        id: data["value"][index]["id"],
        body: data["value"][index]["body"]["content"]
      })
    }
    return {result: loadingStateEnum.success, data: output, nextLink: data["@odata.nextLink"]}
  } else {
    return {result: loadingStateEnum.failed}
  }
}