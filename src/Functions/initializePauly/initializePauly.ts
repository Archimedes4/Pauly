import { loadingStateEnum } from "../../types"
import callMsGraph from "../microsoftAssets"
import { paulyListData, commissionsData, paulyClassExtensionData, paulyDataData, paulyEventExtensionData, scheduleData, sportsApprovedSubmissionsData, sportsData, sportsSubmissionsData, timetablesData, resourceData, paulyResourceExtensionData, dressCodeData, paulyUserExtensionData, addDataArray } from "./initializePaulyData"

export async function initializePaulyPartOne(secondUserId: string): Promise<{result: loadingStateEnum, groupId?: string}> {  
  const currentUsersIdResult = await callMsGraph("https://graph.microsoft.com/v1.0/me", "GET")
  if (currentUsersIdResult.ok) {
    const currentUsersIdResultData = await currentUsersIdResult.json()
    const createGroupData = {
      "description": "Pauly's Team Containing all it's data",
      "displayName": "Pauly",
      "groupTypes": [
        "Unified"
        //, "DynamicMembership"
      ],
      "mailEnabled": true,
      "mailNickname": "pauly",
      "visibility":"HiddenMembership",
      // "membershipRule": "(user.accountEnabled -eq true)",
      // "membershipRuleProcessingState": "on",
      "owners@odata.bind": [
        "https://graph.microsoft.com/v1.0/users/" + currentUsersIdResultData["id"],
        "https://graph.microsoft.com/v1.0/users/" + secondUserId
      ],
      "securityEnabled": false
    }
    console.log(createGroupData)
    const createGroupResult = await callMsGraph("https://graph.microsoft.com/v1.0/groups", "POST", false, JSON.stringify(createGroupData))
    if (createGroupResult.ok){
      const createGroupResultData = await createGroupResult.json()
      console.log(createGroupResultData["id"])
      return {result: loadingStateEnum.success, groupId: createGroupResultData["id"]}
    } else {
      const data = await createGroupResult.json()
      console.log("Failed Here", data)
      return {result: loadingStateEnum.failed}
    }
  } else {
    return {result: loadingStateEnum.failed}
  }
}

export async function initializePaulyPartTwo(groupId: string): Promise<loadingStateEnum> {
  console.log("Started for part two")
  const teamsData = {
    "template@odata.bind": "https://graph.microsoft.com/v1.0/teamsTemplates('standard')",
    "group@odata.bind": "https://graph.microsoft.com/v1.0/groups('" + groupId + "')"
  }
  const createTeamResult = await callMsGraph("https://graph.microsoft.com/v1.0/teams", "POST", false, JSON.stringify(teamsData))
  if (createTeamResult.ok){
    return loadingStateEnum.success
  } else {
    const createTeamResultData = await createTeamResult.json()
    console.log("This Failed", createTeamResultData)
    return loadingStateEnum.failed
  }
}

export async function initializePaulyPartThree(groupId: string, update?: string[]): Promise<loadingStateEnum> {
  const getTeam = await callMsGraph("https://graph.microsoft.com/v1.0/teams/" + groupId)
  if (!getTeam.ok){return loadingStateEnum.failed}
  const getTeamData = await getTeam.json()
  
  const getRootSiteIdResult = await callMsGraph("https://graph.microsoft.com/v1.0/groups/" + getTeamData["id"] + "/sites/root")
  if (!getRootSiteIdResult.ok){return loadingStateEnum.failed}
  const getRootSiteIdResultData = await getRootSiteIdResult.json()
  
  var paulyListNewData = {"fields":{"Title":"Main"}}

  //Check if already data
  var secondRun: boolean = false
  const getPaulyListResult = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + getRootSiteIdResultData["id"] + "/lists/PaulyList/items/1?expand=fields")
  if (!getPaulyListResult.ok && getPaulyListResult.status !== 404){console.log("second run failed"); return loadingStateEnum.failed}
  const getPaulyListResultData = await getPaulyListResult.json()
  if (getPaulyListResult.status !== 404) {
    if (getPaulyListResultData["fields"] !== undefined){
      secondRun = true
    }
  }

  console.log("Started for")

  //TO DO think about 409 if only half  of list where created and then interuption
  for (var index = 0; index < addDataArray.length; index++) {
    const callData = addDataArray[index]
    console.log(callData)
    if (getPaulyListResultData["fields"] !== undefined) {
      if (getPaulyListResultData["fields"][callData.id] !== undefined) {
        paulyListNewData["fields"][callData.id] = getPaulyListResultData["fields"][callData.id] 
      }
    }
    if (paulyListNewData["fields"][callData.id] === undefined || update?.includes(callData.id)) {
      const result = await callMsGraph((callData.urlTwo !== undefined) ? callData.urlOne + getRootSiteIdResultData["id"] + callData.urlTwo:callData.urlOne, "POST", false, JSON.stringify(callData.data))
      if (!result.ok){return loadingStateEnum.failed}
      const data = await result.json()
      paulyListNewData["fields"][callData.id] = data["id"]
    }
  }

  console.log("Ended for")
  if (paulyListNewData["fields"]["paulyDataListId"] !== undefined) {
    const paulyDataResult = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + getRootSiteIdResultData["id"] + "/lists", "POST", false, JSON.stringify(paulyDataData))
    if (!paulyDataResult.ok) {return loadingStateEnum.failed}
    var paulyDataResultData = await paulyDataResult.json()
    const paulyDataNewData = {
      "fields": {
        "Title":"Main",
        "animationSpeed":10,
        "message":"Pauly",
        "powerpointId":"unset"
      }
    }
    const setPaulyDataNewDataResult = await callMsGraph("https://graph.microsoft.com/v1.0/sites/"  +getRootSiteIdResultData["id"] + "/lists/" + paulyDataResultData["id"] + "/items", "POST", false, JSON.stringify(paulyDataNewData))
    if (!setPaulyDataNewDataResult.ok) {return loadingStateEnum.failed}
    paulyListNewData["fields"]["paulyDataListId"] = paulyDataResultData["id"]
  }
  if (secondRun === false) {
    const paulyListResult = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + getRootSiteIdResultData["id"] + "/lists", "POST", false, JSON.stringify(paulyListData))
    if (!paulyListResult.ok) {return loadingStateEnum.failed} 
    const addPaulyListResult = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + getRootSiteIdResultData["id"] + "/lists/PaulyList/items",  "POST", false, JSON.stringify(paulyListNewData))
    if (!addPaulyListResult.ok) {return loadingStateEnum.failed}
  } else {
    const addPaulyListResult = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + getRootSiteIdResultData["id"] + "/lists/PaulyList/items/1",  "PATCH", false, JSON.stringify(paulyListNewData))
    if (!addPaulyListResult.ok) {return loadingStateEnum.failed}
  }
  return loadingStateEnum.success
}