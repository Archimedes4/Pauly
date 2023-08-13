import { AccountInfo, IPublicClientApplication } from "@azure/msal-browser"
import { loadingStateEnum } from "../types"
import callMsGraph from "./microsoftAssets"
import { clientId } from "../authConfig"

export default async function initilizePauly(accessToken: string, instance: IPublicClientApplication, accounts: AccountInfo[]): Promise<loadingStateEnum> {
    const PaulyListData = {
      "displayName": "PaulyList",
      "columns": [
        {
          "name":"commissionListId",
          "text":{},
          "required": true
        },
        {
          "name":"paulyDataListId",
          "text":{},
          "required": true
        },
        {
          "name":"scheduleListId",
          "text":{},
          "required": true
        },
        {
          "name":"sportsListId",
          "text":{},
          "required": true
        },
        {
          "name":"sportsApprovedSubmissionsListId",
          "text":{},
          "required": true
        },
        {
          "name":"sportsSubmissionsListId",
          "text":{},
          "required": true
        },
        {
          "name":"timetablesListId",
          "text":{},
          "required": true
        }
      ],
      "list": {
        "template": "genericList"
      }

    }
    const commissionsData = {
      "displayName": "Commissions",
      "columns": [
        {
          "name":"StartDate",
          "text":{ },
          "required": true
        },
        {
          "name":"EndDate",
          "text":{ },
          "required": true
        },
        {
          "name":"Points",
          "number":{},
          "required": true
        },
        {
          "name":"Proximity",
          "number":{}
        },
        {
          "name":"Hidden",
          "boolean":{},
          "required": true
        },
        {
          "name":"CoordinateLat",
          "number":{}
        },
        {
          "name":"CoordinateLng",
          "number":{}
        },
        {
          "name":"CommissionID",
          "text":{ },
          "required": true,
          "indexed": true,
          "enforceUniqueValues": true
        },
      ],
      "list": {
        "template": "genericList"
      }
    }
    const paulyDataData = {
      "displayName": "PaulyData",
      "columns": [
        {
          "name":"animationSpeed",
          "number":{ },
          "required": true
        },
        {
          "name":"message",
          "text":{ },
          "required": true
        },
        {
          "name":"powerpointId",
          "text":{ },
          "required": true
        }
      ],
      "list": {
        "template": "genericList"
      }
    }
    const scheduleData = {
      "displayName": "Schedule",
      "columns": [
        {
          "name":"scheduleId",
          "text":{ },
          "required": true,
          "indexed": true,
          "enforceUniqueValues": true
        },
        {
          "name":"scheduleProperName",
          "text":{ },
          "required": true
        },
        {
          "name":"scheduleDescriptiveName",
          "text":{ },
          "required": true
        },
        {
          "name":"scheduleData",
          "text":{"allowMultipleLines": true},
          "required": true
        }
      ],
      "list": {
        "template": "genericList"
      }
    }
    const sportsData = {
      "displayName": "Sports",
      "columns": [
        {
          "name":"SportsName",
          "text":{ },
          "required": true
        },
        {
          "name":"SportsID",
          "text":{ },
          "required": true,
          "indexed": true,
          "enforceUniqueValues": true
        },
      ],
      "list": {
        "template": "genericList"
      }
    }
    const sportsApprovedSubmissionsData = {
      "displayName": "SportsApprovedSubmissions",
      "columns": [
        {
          "name":"FileId",
          "text":{ },
          "required": true,
          "indexed": true,
          "enforceUniqueValues": true
        },
        {
          "name":"Caption",
          "text":{ },
          "required": true
        },
      ],
      "list": {
        "template": "genericList"
      }
    }
    const sportsSubmissionsData = {
      "displayName": "SportsSubmissions",
      "columns": [
        {
          "name":"Accepted",
          "boolean":{ },
          "required": true
        },
        {
          "name":"User",
          "text":{ },
          "required": true
        },
        {
          "name":"TimeCreated",
          "text":{ },
          "required": true
        },
        {
          "name":"SubmissionID",
          "text":{ },
          "required": true,
          "indexed": true,
          "enforceUniqueValues": true
        },
        {
          "name":"FileId",
          "text":{ },
          "required": true
        },
      ],
      "list": {
        "template": "genericList"
      }
    }
    const timetablesData = {
      "displayName": "Timetables",
      "columns": [
        {
          "name":"timetableName",
          "text":{ },
          "required": true
        },
        {
          "name":"timetableId",
          "text":{ },
          "required": true,
          "indexed": true,
          "enforceUniqueValues": true
        },
        {
          "name":"timetableDataDays",
          "text":{"allowMultipleLines": true},
          "required": true
        },
        {
          "name":"timetableDataSchedules",
          "text":{"allowMultipleLines": true},
          "required": true
        },
        {
          "name":"timetableDefaultScheduleId",
          "text":{ },
          "required": true
        }
      ],
      "list": {
        "template": "genericList"
      }
    }

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
    const currentUsersIdResult = await callMsGraph(accessToken, "https://graph.microsoft.com/v1.0/me", instance, accounts, "GET")
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
          "https://graph.microsoft.com/v1.0/users/" + currentUsersIdResultData["id"]
        ],
        "securityEnabled": false
      }
      const createGroupResult = await callMsGraph(accessToken, "https://graph.microsoft.com/v1.0/groups", instance, accounts, "POST", false, JSON.stringify(createGroupData))
      if (createGroupResult.ok){
        const createGroupResultData = await createGroupResult.json()
        console.log(createGroupResultData)
        const createTeamResult = await callMsGraph(accessToken, "https://graph.microsoft.com/v1.0/groups/" + createGroupResultData["id"] + "/team", instance, accounts, "PUT")
        const createTeamResultData = await createTeamResult.json()
        console.log("This < ------ ", createTeamResultData)
        const getRootSiteIdResult = await callMsGraph(accessToken, "https://graph.microsoft.com/v1.0/groups/" + createGroupResultData["id"] + "/sites/root", instance, accounts)
        if (getRootSiteIdResult.ok){
          const getRootSiteIdResultData = await getRootSiteIdResult.json()
          var PaulyListNewData = {"fields":{"Title":"Main"}}
          const commissionsResult = await callMsGraph(accessToken, "https://graph.microsoft.com/v1.0/sites/" + getRootSiteIdResultData["id"] + "/lists", instance, accounts, "POST", false, JSON.stringify(commissionsData))
          if (commissionsResult.ok) {
            const commissionsResultData = await commissionsResult.json()
            PaulyListNewData["fields"]["commissionListId"] = commissionsResultData["id"]
            const paulyDataResult = await callMsGraph(accessToken, "https://graph.microsoft.com/v1.0/sites/" + getRootSiteIdResultData["id"] + "/lists", instance, accounts, "POST", false, JSON.stringify(paulyDataData))
            if (paulyDataResult.ok) {
              const paulyDataResultData = await paulyDataResult.json()
              PaulyListNewData["fields"]["paulyDataListId"] = paulyDataResultData["id"]
              const scheduleResult = await callMsGraph(accessToken, "https://graph.microsoft.com/v1.0/sites/" + getRootSiteIdResultData["id"] + "/lists", instance, accounts, "POST", false, JSON.stringify(scheduleData))
              if (scheduleResult.ok) {
                const scheduleResultData = await scheduleResult.json()
                PaulyListNewData["fields"]["scheduleListId"] = scheduleResultData["id"]
                const sportsResult = await callMsGraph(accessToken, "https://graph.microsoft.com/v1.0/sites/" + getRootSiteIdResultData["id"] + "/lists", instance, accounts, "POST", false, JSON.stringify(sportsData))
                if (sportsResult.ok) {
                  const sportsResultData = await sportsResult.json()
                  PaulyListNewData["fields"]["sportsListId"] = sportsResultData["id"]
                  const sportsApprovedSubmissionsResult = await callMsGraph(accessToken, "https://graph.microsoft.com/v1.0/sites/" + getRootSiteIdResultData["id"] + "/lists", instance, accounts, "POST", false, JSON.stringify(sportsApprovedSubmissionsData))
                  if (sportsApprovedSubmissionsResult.ok) {
                    const sportsApprovedSubmissionsResultData = await sportsApprovedSubmissionsResult.json()
                    PaulyListNewData["fields"]["sportsApprovedSubmissionsListId"] = sportsApprovedSubmissionsResultData["id"]
                    const sportsSubmissionsResult = await callMsGraph(accessToken, "https://graph.microsoft.com/v1.0/sites/" + getRootSiteIdResultData["id"] + "/lists", instance, accounts, "POST", false, JSON.stringify(sportsSubmissionsData))
                    if (sportsSubmissionsResult.ok) {
                      const sportsSubmissionsResultData = await sportsSubmissionsResult.json()
                      PaulyListNewData["fields"]["sportsSubmissionsListId"] = sportsSubmissionsResultData["id"]
                      const timetableResult = await callMsGraph(accessToken, "https://graph.microsoft.com/v1.0/sites/" + getRootSiteIdResultData["id"] + "/lists", instance, accounts, "POST", false, JSON.stringify(timetablesData))
                      if (timetableResult.ok) {
                        const timetableResultData = await timetableResult.json()
                        PaulyListNewData["fields"]["timetablesListId"] = timetableResultData["id"]
                        const paulyListResult = await callMsGraph(accessToken, "https://graph.microsoft.com/v1.0/sites/" + getRootSiteIdResultData["id"] + "/lists", instance, accounts, "POST", false, JSON.stringify(PaulyListData))
                        if (paulyListResult.ok){
                          const paulyListResultData = await paulyListResult.json()
                          const addPaulyListResult = await callMsGraph(accessToken, "https://graph.microsoft.com/v1.0/sites/" + getRootSiteIdResultData["id"] + "/lists/" + paulyListResultData["id"] + "/items", instance, accounts, "POST", false, JSON.stringify(PaulyListNewData))
                          if (addPaulyListResult.ok){
                            const paulyDataNewData = {
                              "fields": {
                                "Title":"Main",
                                "animatedSpeed":10,
                                "message":"Pauly",
                                "powerpointId":"unset"
                              }
                            }
                            const setPaulyDataNewDataResult = await callMsGraph(accessToken, "https://graph.microsoft.com/v1.0/sites/"  +getRootSiteIdResultData["id"] + "/lists/" + paulyDataResultData["id"] + "/items", instance, accounts, "POST", false, JSON.stringify(paulyDataNewData))
                            if (setPaulyDataNewDataResult.ok) {
                              console.log("Yeah")
                              console.log(PaulyListNewData)
                              return loadingStateEnum.success
                            } else {
                              console.log("Add Pauly List Data Result Failed")
                              return loadingStateEnum.failed
                            }
                          } else {
                            console.log("Add Pauly List Result Failed")
                            return loadingStateEnum.failed
                          }
                        } else {
                          return loadingStateEnum.failed
                        }
                      } else {
                        console.log("Timetable Failed")
                        return loadingStateEnum.failed
                      }
                    } else {
                      console.log("Sports Submissions Failed")
                      return loadingStateEnum.failed
                    }
                  } else {
                    console.log("Sports Approval Failed")
                    return loadingStateEnum.failed
                  }
                } else {
                  console.log("Sports Failed")
                  return loadingStateEnum.failed
                }
              } else {
                console.log("Schedule Failed")
                const scheduleData = await scheduleResult.json()
                console.log(scheduleData)
                return loadingStateEnum.failed
              }
            } else {
              console.log("Pauly Data Failed")
              return loadingStateEnum.failed
            }
          } else {
            console.log("Commissions Failed")
            return loadingStateEnum.failed
          }
        } else {
          return loadingStateEnum.failed
        }
      } else {
        return loadingStateEnum.failed
      }
    } else {
      return loadingStateEnum.failed
    }
  }