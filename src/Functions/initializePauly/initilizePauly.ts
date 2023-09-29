import { AccountInfo, IPublicClientApplication } from "@azure/msal-browser"
import { loadingStateEnum } from "../../types"
import callMsGraph from "../microsoftAssets"
import { clientId } from "../../PaulyConfig"
import { PaulyListData, commissionsData, paulyDataData, scheduleData, sportsApprovedSubmissionsData, sportsData, sportsSubmissionsData, timetablesData } from "./initilizePaulyData"

export async function initilizePaulyPartTwo(groupId: string): Promise<loadingStateEnum> {
  console.log("Started for part two")
  const teamsData = {
    "template@odata.bind": "https://graph.microsoft.com/v1.0/teamsTemplates('standard')",
    "group@odata.bind": "https://graph.microsoft.com/v1.0/groups('" + groupId + "')"
  }
  const createTeamResult = await callMsGraph("https://graph.microsoft.com/v1.0/teams", "POST", false, JSON.stringify(teamsData))
  if (createTeamResult.ok){
    const getTeam = await callMsGraph("https://graph.microsoft.com/v1.0/teams/" + groupId)
    if (getTeam.ok){
      const getTeamData = await getTeam.json()
      console.log(getTeamData)
    } else {
      return loadingStateEnum.failed
    }
    // const getRootSiteIdResult = await callMsGraph("https://graph.microsoft.com/v1.0/groups/" + createTeamResultData["id"] + "/sites/root")
    // if (getRootSiteIdResult.ok){
    //   const getRootSiteIdResultData = await getRootSiteIdResult.json()
    //   var PaulyListNewData = {"fields":{"Title":"Main"}}
    //   const commissionsResult = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + getRootSiteIdResultData["id"] + "/lists", "POST", false, JSON.stringify(commissionsData))
    //   if (commissionsResult.ok) {
    //     const commissionsResultData = await commissionsResult.json()
    //     PaulyListNewData["fields"]["commissionListId"] = commissionsResultData["id"]
    //     const paulyDataResult = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + getRootSiteIdResultData["id"] + "/lists", "POST", false, JSON.stringify(paulyDataData))
    //     if (paulyDataResult.ok) {
    //       const paulyDataResultData = await paulyDataResult.json()
    //       PaulyListNewData["fields"]["paulyDataListId"] = paulyDataResultData["id"]
    //       const scheduleResult = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + getRootSiteIdResultData["id"] + "/lists", "POST", false, JSON.stringify(scheduleData))
    //       if (scheduleResult.ok) {
    //         const scheduleResultData = await scheduleResult.json()
    //         PaulyListNewData["fields"]["scheduleListId"] = scheduleResultData["id"]
    //         const sportsResult = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + getRootSiteIdResultData["id"] + "/lists", "POST", false, JSON.stringify(sportsData))
    //         if (sportsResult.ok) {
    //           const sportsResultData = await sportsResult.json()
    //           PaulyListNewData["fields"]["sportsListId"] = sportsResultData["id"]
    //           const sportsApprovedSubmissionsResult = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + getRootSiteIdResultData["id"] + "/lists", "POST", false, JSON.stringify(sportsApprovedSubmissionsData))
    //           if (sportsApprovedSubmissionsResult.ok) {
    //             const sportsApprovedSubmissionsResultData = await sportsApprovedSubmissionsResult.json()
    //             PaulyListNewData["fields"]["sportsApprovedSubmissionsListId"] = sportsApprovedSubmissionsResultData["id"]
    //             const sportsSubmissionsResult = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + getRootSiteIdResultData["id"] + "/lists", "POST", false, JSON.stringify(sportsSubmissionsData))
    //             if (sportsSubmissionsResult.ok) {
    //               const sportsSubmissionsResultData = await sportsSubmissionsResult.json()
    //               PaulyListNewData["fields"]["sportsSubmissionsListId"] = sportsSubmissionsResultData["id"]
    //               const timetableResult = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + getRootSiteIdResultData["id"] + "/lists", "POST", false, JSON.stringify(timetablesData))
    //               if (timetableResult.ok) {
    //                 const timetableResultData = await timetableResult.json()
    //                 PaulyListNewData["fields"]["timetablesListId"] = timetableResultData["id"]
    //                 const paulyListResult = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + getRootSiteIdResultData["id"] + "/lists", "POST", false, JSON.stringify(PaulyListData))
    //                 if (paulyListResult.ok){
    //                   const paulyListResultData = await paulyListResult.json()
    //                   const addPaulyListResult = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + getRootSiteIdResultData["id"] + "/lists/" + paulyListResultData["id"] + "/items",  "POST", false, JSON.stringify(PaulyListNewData))
    //                   if (addPaulyListResult.ok){
    //                     const paulyDataNewData = {
    //                       "fields": {
    //                         "Title":"Main",
    //                         "animatedSpeed":10,
    //                         "message":"Pauly",
    //                         "powerpointId":"unset"
    //                       }
    //                     }
    //                     const setPaulyDataNewDataResult = await callMsGraph("https://graph.microsoft.com/v1.0/sites/"  +getRootSiteIdResultData["id"] + "/lists/" + paulyDataResultData["id"] + "/items", "POST", false, JSON.stringify(paulyDataNewData))
    //                     if (setPaulyDataNewDataResult.ok) {
    //                       console.log("Yeah")
    //                       console.log(PaulyListNewData)
    //                       return loadingStateEnum.success
    //                     } else {
    //                       console.log("Add Pauly List Data Result Failed")
    //                       return loadingStateEnum.failed
    //                     }
    //                   } else {
    //                     console.log("Add Pauly List Result Failed")
    //                     return loadingStateEnum.failed
    //                   }
    //                 } else {
    //                   return loadingStateEnum.failed
    //                 }
    //               } else {
    //                 console.log("Timetable Failed")
    //                 return loadingStateEnum.failed
    //               }
    //             } else {
    //               console.log("Sports Submissions Failed")
    //               return loadingStateEnum.failed
    //             }
    //           } else {
    //             console.log("Sports Approval Failed")
    //             return loadingStateEnum.failed
    //           }
    //         } else {
    //           console.log("Sports Failed")
    //           return loadingStateEnum.failed
    //         }
    //       } else {
    //         console.log("Schedule Failed")
    //         const scheduleData = await scheduleResult.json()
    //         console.log(scheduleData)
    //         return loadingStateEnum.failed
    //       }
    //     } else {
    //       console.log("Pauly Data Failed")
    //       return loadingStateEnum.failed
    //     }
    //   } else {
    //     console.log("Commissions Failed")
    //     return loadingStateEnum.failed
    //   }
    // } else {
    //   return loadingStateEnum.failed
    // }
  } else {
    const createTeamResultData = await createTeamResult.json()
    console.log("This Failed", createTeamResultData)
    return loadingStateEnum.failed
  }
}

export async function initilizePaulyPartOne(secondUserId: string): Promise<{result: loadingStateEnum, groupId?: string}> {

    //Extentions
    const paulyEventExtentionPlaceholder = {
        "id": "paulyEvents",
        "description": "Pauly Event Data",
        "targetTypes": [
            "Event"
        ],
        "owner": clientId,
        "properties": [
            {
                "name": "eventType",
                "type": "String"
            },
            {
                "name": "eventData",
                "type": "String"
            }
        ]
    }
    
    const currentUsersIdResult = await callMsGraph("https://graph.microsoft.com/v1.0/me", "GET")
    if (currentUsersIdResult.ok) {
      const currentUsersIdResultData = await currentUsersIdResult.json()
      const createGroupData = {
        "description": "Pauly's Team Containing all it's data",
        "displayName": "Pauly",
        "groupTypes": [
          "Unified", "DynamicMembership"
        ],
        "mailEnabled": true,
        "mailNickname": "pauly",
        "visibility":"HiddenMembership",
        "membershipRule": "(user.accountEnabled -eq true)",
        "membershipRuleProcessingState": "on",
        "owners@odata.bind": [
          "https://graph.microsoft.com/v1.0/users/" + currentUsersIdResultData["id"],
          "https://graph.microsoft.com/v1.0/users/" + secondUserId
        ],
        "securityEnabled": false
      }
      const createGroupResult = await callMsGraph("https://graph.microsoft.com/v1.0/groups", "POST", false, JSON.stringify(createGroupData))
      if (createGroupResult.ok){
        const createGroupResultData = await createGroupResult.json()
        console.log(createGroupResultData["id"])
        return {result: loadingStateEnum.success, groupId: createGroupResultData["id"]}
      } else {
        const data = await createGroupResult.json()
        console.log(data)
        return {result: loadingStateEnum.failed}
      }
    } else {
      return {result: loadingStateEnum.failed}
    }
  }