import { AccountInfo, IPublicClientApplication } from "@azure/msal-browser"
import { loadingStateEnum } from "../../types"
import callMsGraph from "../microsoftAssets"
import { clientId } from "../../PaulyConfig"
import { paulyListData, commissionsData, paulyClassExtentionData, paulyDataData, paulyEventExtentionData, scheduleData, sportsApprovedSubmissionsData, sportsData, sportsSubmissionsData, timetablesData, resourceData } from "./initializePaulyData"

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

export async function initializePaulyPartThree(groupId: string): Promise<loadingStateEnum> {
  const getTeam = await callMsGraph("https://graph.microsoft.com/v1.0/teams/" + groupId)
  if (!getTeam.ok){return loadingStateEnum.failed}
  const getTeamData = await getTeam.json()
  
  const getRootSiteIdResult = await callMsGraph("https://graph.microsoft.com/v1.0/groups/" + getTeamData["id"] + "/sites/root")
  if (!getRootSiteIdResult.ok){return loadingStateEnum.failed}
  const getRootSiteIdResultData = await getRootSiteIdResult.json()
  console.log("Site Result", getRootSiteIdResultData)
  
  var paulyListNewData = {"fields":{"Title":"Main"}}
  
  //Extentions
  const eventExtensionResult = await callMsGraph("https://graph.microsoft.com/v1.0/schemaExtensions", "POST", false, JSON.stringify(paulyEventExtentionData))
  if (!eventExtensionResult.ok){
    const eventExtensionData = await eventExtensionResult.json()
    console.log(eventExtensionData)
    return loadingStateEnum.failed
  }
  const eventExtensionData = await eventExtensionResult.json()
  console.log(eventExtensionData)
  paulyListNewData["fields"]["eventExtensionId"] = eventExtensionData["id"]

  const classExtensionResult = await callMsGraph("https://graph.microsoft.com/v1.0/schemaExtensions", "POST", false, JSON.stringify(paulyClassExtentionData))
  if (!classExtensionResult.ok) {return loadingStateEnum.failed}
  const classExtensionData = await classExtensionResult.json()
  paulyListNewData["fields"]["classExtensionId"] = classExtensionData["id"]

  const commissionsResult = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + getRootSiteIdResultData["id"] + "/lists", "POST", false, JSON.stringify(commissionsData))
  if (!commissionsResult.ok && commissionsResult.status !== 409) {return loadingStateEnum.failed}
  const commissionsResultData = await commissionsResult.json()
  paulyListNewData["fields"]["commissionListId"] = commissionsResultData["id"]

  const paulyDataResult = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + getRootSiteIdResultData["id"] + "/lists", "POST", false, JSON.stringify(paulyDataData))
  if (!paulyDataResult.ok && paulyDataResult.status !== 409) {return loadingStateEnum.failed}
  var paulyDataResultData: JSON = await paulyDataResult.json()
  if (paulyDataResult.status === 409){
    const paulyDataGetResult = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + getRootSiteIdResultData["id"] + "/lists/PaulyData")
    if (!paulyDataGetResult.ok) {return loadingStateEnum.failed}
    paulyDataResultData = await paulyDataGetResult.json()
  }
  paulyListNewData["fields"]["paulyDataListId"] = paulyDataResultData["id"]

  const scheduleResult = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + getRootSiteIdResultData["id"] + "/lists", "POST", false, JSON.stringify(scheduleData))        
  if (!scheduleResult.ok && scheduleResult.status !== 409) {return loadingStateEnum.failed}
  const scheduleResultData = await scheduleResult.json()
  paulyListNewData["fields"]["scheduleListId"] = scheduleResultData["id"]
  
  const sportsResult = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + getRootSiteIdResultData["id"] + "/lists", "POST", false, JSON.stringify(sportsData))
  if (!sportsResult.ok && sportsResult.status !== 409) {return loadingStateEnum.failed}
  const sportsResultData = await sportsResult.json()
  paulyListNewData["fields"]["sportsListId"] = sportsResultData["id"]
  
  const sportsApprovedSubmissionsResult = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + getRootSiteIdResultData["id"] + "/lists", "POST", false, JSON.stringify(sportsApprovedSubmissionsData))
  if (!sportsApprovedSubmissionsResult.ok && sportsApprovedSubmissionsResult.status !== 409) {return loadingStateEnum.failed}
  const sportsApprovedSubmissionsResultData = await sportsApprovedSubmissionsResult.json()
  paulyListNewData["fields"]["sportsApprovedSubmissionsListId"] = sportsApprovedSubmissionsResultData["id"]
  
  const sportsSubmissionsResult = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + getRootSiteIdResultData["id"] + "/lists", "POST", false, JSON.stringify(sportsSubmissionsData))
  if (!sportsSubmissionsResult.ok && sportsSubmissionsResult.status !== 409) {return loadingStateEnum.failed}
  const sportsSubmissionsResultData = await sportsSubmissionsResult.json()
  paulyListNewData["fields"]["sportsSubmissionsListId"] = sportsSubmissionsResultData["id"]

  const timetableResult = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + getRootSiteIdResultData["id"] + "/lists", "POST", false, JSON.stringify(timetablesData))
  if (!timetableResult.ok && timetableResult.status !== 409) {return loadingStateEnum.failed}
  const timetableResultData = await timetableResult.json()
  paulyListNewData["fields"]["timetablesListId"] = timetableResultData["id"]

  const resourceResult = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + getRootSiteIdResultData["id"] + "/lists", "POST", false, JSON.stringify(resourceData))
  if (!resourceResult.ok && resourceResult.status !== 409) {return loadingStateEnum.failed}
  const resourceResultData = await resourceResult.json()
  paulyListNewData["fields"]["resourceListId"] = resourceResultData["id"]

  const paulyListResult = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + getRootSiteIdResultData["id"] + "/lists", "POST", false, JSON.stringify(paulyListData))
  if (!paulyListResult.ok && paulyListResult.status !== 409) {return loadingStateEnum.failed}

  const addPaulyListResult = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + getRootSiteIdResultData["id"] + "/lists/PaulyList/items",  "POST", false, JSON.stringify(paulyListNewData))
  if (!addPaulyListResult.ok) {
    console.log("error 1"); 
    const addPaulyListResultData = await addPaulyListResult.json(); console.log(addPaulyListResultData); return loadingStateEnum.failed}

  const paulyDataNewData = {
    "fields": {
      "Title":"Main",
      "animationSpeed":10,
      "message":"Pauly",
      "powerpointId":"unset"
    }
  }
  const setPaulyDataNewDataResult = await callMsGraph("https://graph.microsoft.com/v1.0/sites/"  +getRootSiteIdResultData["id"] + "/lists/" + paulyDataResultData["id"] + "/items", "POST", false, JSON.stringify(paulyDataNewData))
  console.log(setPaulyDataNewDataResult)
  if (!setPaulyDataNewDataResult.ok) {return loadingStateEnum.failed}
  return loadingStateEnum.success
}