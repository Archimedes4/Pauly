import { loadingStateEnum } from "../../types"
import callMsGraph from "../microsoftAssets"
import { paulyListData, commissionsData, paulyClassExtentionData, paulyDataData, paulyEventExtentionData, scheduleData, sportsApprovedSubmissionsData, sportsData, sportsSubmissionsData, timetablesData, resourceData, paulyResourceExtentionData, dressCodeData } from "./initializePaulyData"

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
  
  var paulyListNewData = {"fields":{"Title":"Main"}}

  //Check if already data
  var secondRun: boolean = false
  const getPaulyListResult = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + getRootSiteIdResultData["id"] + "/lists/PaulyList/items/1?expand=fields")
  if (!getPaulyListResult.ok){return loadingStateEnum.failed}
  const getPaulyListResultData = await getPaulyListResult.json()
  if (getPaulyListResultData["fields"] !== undefined){
    secondRun = true
    paulyListNewData["fields"]["eventExtensionId"] = getPaulyListResultData["fields"]["eventExtensionId"] 
    paulyListNewData["fields"]["classExtensionId"] = getPaulyListResultData["fields"]["classExtensionId"]
    paulyListNewData["fields"]["resourceExtensionId"] = getPaulyListResultData["fields"]["resourceExtensionId"]
    paulyListNewData["fields"]["commissionListId"] = getPaulyListResultData["fields"]["commissionListId"]
    paulyListNewData["fields"]["paulyDataListId"] = getPaulyListResultData["fields"]["paulyDataListId"]
    paulyListNewData["fields"]["scheduleListId"] = getPaulyListResultData["fields"]["scheduleListId"]
    paulyListNewData["fields"]["sportsListId"] = getPaulyListResultData["fields"]["sportsListId"]
    paulyListNewData["fields"]["sportsApprovedSubmissionsListId"] = getPaulyListResultData["fields"]["sportsApprovedSubmissionsListId"]
    paulyListNewData["fields"]["sportsSubmissionsListId"] = getPaulyListResultData["fields"]["sportsSubmissionsListId"]
    paulyListNewData["fields"]["timetablesListId"] = getPaulyListResultData["fields"]["timetablesListId"]
    paulyListNewData["fields"]["resourceListId"] = getPaulyListResultData["fields"]["resourceListId"]
    paulyListNewData["fields"]["dressCodeListId"] = getPaulyListResultData["fields"]["dressCodeListId"]
  }
  
  //Extentions
  if (paulyListNewData["fields"]["eventExtensionId"] === undefined) {
    const eventExtensionResult = await callMsGraph("https://graph.microsoft.com/v1.0/schemaExtensions", "POST", false, JSON.stringify(paulyEventExtentionData))
    if (!eventExtensionResult.ok){return loadingStateEnum.failed}
    const eventExtensionData = await eventExtensionResult.json()
    paulyListNewData["fields"]["eventExtensionId"] = eventExtensionData["id"]
  }

  if (paulyListNewData["fields"]["classExtensionId"] === undefined) {
    const classExtensionResult = await callMsGraph("https://graph.microsoft.com/v1.0/schemaExtensions", "POST", false, JSON.stringify(paulyClassExtentionData))
    if (!classExtensionResult.ok) {return loadingStateEnum.failed}
    const classExtensionData = await classExtensionResult.json()
    paulyListNewData["fields"]["classExtensionId"] = classExtensionData["id"]
  }
  if (paulyListNewData["fields"]["resourceExtensionId"] === undefined) {
    const resourceExtensionResult = await callMsGraph("https://graph.microsoft.com/v1.0/schemaExtensions", "POST", false, JSON.stringify(paulyResourceExtentionData))
    if (!resourceExtensionResult.ok) {return loadingStateEnum.failed}
    const resourceExtensionData = await resourceExtensionResult.json()
    paulyListNewData["fields"]["resourceExtensionId"] = resourceExtensionData["id"]
  }
  if (paulyListNewData["fields"]["commissionListId"] === undefined) {
    const commissionsResult = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + getRootSiteIdResultData["id"] + "/lists", "POST", false, JSON.stringify(commissionsData))
    if (!commissionsResult.ok) {return loadingStateEnum.failed}
    const commissionsResultData = await commissionsResult.json()
    paulyListNewData["fields"]["commissionListId"] = commissionsResultData["id"]
  }
  if (paulyListNewData["fields"]["paulyDataListId"] === undefined) {
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
  if (paulyListNewData["fields"]["scheduleListId"] === undefined) {
    const scheduleResult = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + getRootSiteIdResultData["id"] + "/lists", "POST", false, JSON.stringify(scheduleData))        
    if (!scheduleResult.ok) {return loadingStateEnum.failed}
    const scheduleResultData = await scheduleResult.json()
    paulyListNewData["fields"]["scheduleListId"] = scheduleResultData["id"]
  }
  if (paulyListNewData["fields"]["sportsListId"] === undefined) {
    const sportsResult = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + getRootSiteIdResultData["id"] + "/lists", "POST", false, JSON.stringify(sportsData))
    if (!sportsResult.ok) {return loadingStateEnum.failed}
    const sportsResultData = await sportsResult.json()
    paulyListNewData["fields"]["sportsListId"] = sportsResultData["id"]
  }
  if (paulyListNewData["fields"]["sportsApprovedSubmissionsListId"] === undefined) {
    const sportsApprovedSubmissionsResult = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + getRootSiteIdResultData["id"] + "/lists", "POST", false, JSON.stringify(sportsApprovedSubmissionsData))
    if (!sportsApprovedSubmissionsResult.ok) {return loadingStateEnum.failed}
    const sportsApprovedSubmissionsResultData = await sportsApprovedSubmissionsResult.json()
    paulyListNewData["fields"]["sportsApprovedSubmissionsListId"] = sportsApprovedSubmissionsResultData["id"]
  }
  if (paulyListNewData["fields"]["sportsSubmissionsListId"] === undefined) {
    const sportsSubmissionsResult = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + getRootSiteIdResultData["id"] + "/lists", "POST", false, JSON.stringify(sportsSubmissionsData))
    if (!sportsSubmissionsResult.ok) {return loadingStateEnum.failed}
    const sportsSubmissionsResultData = await sportsSubmissionsResult.json()
    paulyListNewData["fields"]["sportsSubmissionsListId"] = sportsSubmissionsResultData["id"]
  }
  if (paulyListNewData["fields"]["timetablesListId"] === undefined) {
    const timetableResult = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + getRootSiteIdResultData["id"] + "/lists", "POST", false, JSON.stringify(timetablesData))
    if (!timetableResult.ok) {return loadingStateEnum.failed}
    const timetableResultData = await timetableResult.json()
    paulyListNewData["fields"]["timetablesListId"] = timetableResultData["id"]
  }
  if (paulyListNewData["fields"]["resourceListId"] === undefined) {
    const resourceResult = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + getRootSiteIdResultData["id"] + "/lists", "POST", false, JSON.stringify(resourceData))
    if (!resourceResult.ok) {return loadingStateEnum.failed}
    const resourceResultData = await resourceResult.json()
    paulyListNewData["fields"]["resourceListId"] = resourceResultData["id"]
  }
  if (paulyListNewData["fields"]["dressCodeListId"] === undefined) {
    const dressCodeResult = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + getRootSiteIdResultData["id"] + "/lists", "POST", false, JSON.stringify(dressCodeData))
    if (!dressCodeResult.ok) {return loadingStateEnum.failed}
    const dressCodeResultData = await dressCodeResult.json()
    paulyListNewData["fields"]["dressCodeListId"] = dressCodeResultData["id"]
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