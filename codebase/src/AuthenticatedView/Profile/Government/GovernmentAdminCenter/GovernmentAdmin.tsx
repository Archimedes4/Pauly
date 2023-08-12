import { View, Text, Button } from 'react-native'
import React, { useContext } from 'react'
import callMsGraph from '../../../../Functions/microsoftAssets'
import { useMsal } from '@azure/msal-react';
import { accessTokenContent } from '../../../../../App';
import { siteID } from '../../../../PaulyConfig';

enum loadingStateEnum {
  loading,
  success,
  failed
}

export default function GovernmentAdmin() {
  const microsoftAccessToken = useContext(accessTokenContent);
  const { instance, accounts } = useMsal();
  async function InitilizePauly() {
    const PaulyListData = {
      "displayName": "Commissions",
      "columns": [
        {
          "name":"CommissionListId",
          "text":{},
          "required": true
        },
        {
          "name":"PaulyDataListId",
          "text":{},
          "required": true
        },
        {
          "name":"ScheduleListId",
          "text":{},
          "required": true
        },
        {
          "name":"SportsListId",
          "text":{},
          "required": true
        },
        {
          "name":"SportsApprovedSubmissionsListId",
          "text":{},
          "required": true
        },
        {
          "name":"SportsSubmissionsListId",
          "text":{},
          "required": true
        },
        {
          "name":"TimetablesListId",
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
          "name":"AnimatedSpeed",
          "number":{ },
          "required": true
        },
        {
          "name":"Message",
          "text":{ },
          "required": true
        },
      ],
      "list": {
        "template": "genericList"
      }
    }
    const scheduleData = {
      "displayName": "Schedule",
      "columns": [
        {
          "name":"ScheduleId",
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
          "name":"ScheduleData",
          "text":{"allowMultipleLines": true},
          "required": true
        },
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
        }
      ],
      "list": {
        "template": "genericList"
      }
    }
    var PaulyListNewData = {}
    const commissionsResult = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/sites/" + siteID + "/lists", instance, accounts, "POST", false, JSON.stringify(commissionsData))
    if (commissionsResult.ok) {
      const commissionsResultData = await commissionsResult.json()
      PaulyListNewData["CommissionListId"] = commissionsResultData["fields"]["id"]
      const paulyDataResult = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/sites/" + siteID + "/lists", instance, accounts, "POST", false, JSON.stringify(paulyDataData))
      if (paulyDataResult.ok) {
        const paulyDataResultData = await paulyDataResult.json()
        PaulyListNewData["PaulyDataListId"] = paulyDataResultData["fields"]["id"]
        const scheduleResult = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/sites/" + siteID + "/lists", instance, accounts, "POST", false, JSON.stringify(scheduleData))
        if (scheduleResult.ok) {
          const scheduleResultData = await scheduleResult.json()
          PaulyListNewData["ScheduleListId"] = scheduleResultData["fields"]["id"]
          const sportsResult = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/sites/" + siteID + "/lists", instance, accounts, "POST", false, JSON.stringify(sportsData))
          if (sportsResult.ok) {
            const sportsResultData = await sportsResult.json()
            PaulyListNewData["SportsListId"] = sportsResultData["fields"]["id"]
            const sportsApprovedSubmissionsResult = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/sites/" + siteID + "/lists", instance, accounts, "POST", false, JSON.stringify(sportsApprovedSubmissionsData))
            if (sportsApprovedSubmissionsResult.ok) {
              const sportsApprovedSubmissionsResultData = await sportsApprovedSubmissionsResult.json()
              PaulyListNewData["SportsApprovedSubmissionsListId"] = sportsApprovedSubmissionsResultData["fields"]["id"]
              const sportsSubmissionsResult = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/sites/" + siteID + "/lists", instance, accounts, "POST", false, JSON.stringify(sportsSubmissionsData))
              if (sportsSubmissionsResult.ok) {
                const sportsSubmissionsResultData = await sportsSubmissionsResult.json()
                PaulyListNewData["SportsSubmissionsListId"] = sportsSubmissionsResultData["fields"]["id"]
                const timetableResult = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/sites/" + siteID + "/lists", instance, accounts, "POST", false, JSON.stringify(timetablesData))
                if (timetableResult.ok) {
                  const timetableResultData = await timetableResult.json()
                  PaulyListNewData["TimetablesListId"] = timetableResultData["fields"]["id"]
                  const paulyListResult = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/sites/" + siteID + "/lists", instance, accounts, "POST", false, JSON.stringify(PaulyListData))
                  if (paulyListResult.ok){
                    const addPaulyListResult = await callMsGraph(microsoftAccessToken.accessToken, "", instance, accounts)
                    if (addPaulyListResult.ok){
                      console.log("Yeah")
                      console.log(PaulyListNewData)
                    } else {
                      console.log("Add Pauly List Result Failed")
                    }
                  }
                } else {
                  console.log("Timetable Failed")
                }
              } else {
                console.log("Sports Submissions Failed")
              }
            } else {
              console.log("Sports Approval Failed")
            }
          } else {
            console.log("Sports Failed")
          }
        } else {
          console.log("Schedule Failed")
        }
      } else {
        console.log("Pauly Data Failed")
      }
    } else {
      console.log("Commissions Failed")
    }
  }
  async function checkIfListIdValid(listId: string): Promise<{ result: loadingStateEnum; success?: boolean }> {
    return {result: loadingStateEnum.failed}
  }
  return (
    <View>
      <Button title="Initilize Pauly on New Tenant" onPress={() => {InitilizePauly()}}/>
    </View>
  )
}