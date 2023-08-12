import { View, Text, Button } from 'react-native'
import React, { useContext, useState } from 'react'
import callMsGraph from '../../../../Functions/microsoftAssets'
import { useMsal } from '@azure/msal-react';
import { accessTokenContent } from '../../../../../App';
import { siteID } from '../../../../PaulyConfig';
import { loadingStateEnum } from '../../../../types';
import { Link } from 'react-router-native';

export default function GovernmentAdmin() {
  const microsoftAccessToken = useContext(accessTokenContent);
  const { instance, accounts } = useMsal();
  const [initilizePaulyLoadingResult, setInitilizePaulyLoadingResult] = useState<loadingStateEnum>(loadingStateEnum.notStarted)
  async function InitilizePauly() {
    setInitilizePaulyLoadingResult(loadingStateEnum.loading)
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
    var PaulyListNewData = {"fields":{"Title":"Main"}}
    const commissionsResult = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/sites/" + siteID + "/lists", instance, accounts, "POST", false, JSON.stringify(commissionsData))
    if (commissionsResult.ok) {
      const commissionsResultData = await commissionsResult.json()
      PaulyListNewData["fields"]["commissionListId"] = commissionsResultData["id"]
      const paulyDataResult = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/sites/" + siteID + "/lists", instance, accounts, "POST", false, JSON.stringify(paulyDataData))
      if (paulyDataResult.ok) {
        const paulyDataResultData = await paulyDataResult.json()
        PaulyListNewData["fields"]["paulyDataListId"] = paulyDataResultData["id"]
        const scheduleResult = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/sites/" + siteID + "/lists", instance, accounts, "POST", false, JSON.stringify(scheduleData))
        if (scheduleResult.ok) {
          const scheduleResultData = await scheduleResult.json()
          PaulyListNewData["fields"]["scheduleListId"] = scheduleResultData["id"]
          const sportsResult = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/sites/" + siteID + "/lists", instance, accounts, "POST", false, JSON.stringify(sportsData))
          if (sportsResult.ok) {
            const sportsResultData = await sportsResult.json()
            PaulyListNewData["fields"]["sportsListId"] = sportsResultData["id"]
            const sportsApprovedSubmissionsResult = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/sites/" + siteID + "/lists", instance, accounts, "POST", false, JSON.stringify(sportsApprovedSubmissionsData))
            if (sportsApprovedSubmissionsResult.ok) {
              const sportsApprovedSubmissionsResultData = await sportsApprovedSubmissionsResult.json()
              PaulyListNewData["fields"]["sportsApprovedSubmissionsListId"] = sportsApprovedSubmissionsResultData["id"]
              const sportsSubmissionsResult = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/sites/" + siteID + "/lists", instance, accounts, "POST", false, JSON.stringify(sportsSubmissionsData))
              if (sportsSubmissionsResult.ok) {
                const sportsSubmissionsResultData = await sportsSubmissionsResult.json()
                PaulyListNewData["fields"]["sportsSubmissionsListId"] = sportsSubmissionsResultData["id"]
                const timetableResult = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/sites/" + siteID + "/lists", instance, accounts, "POST", false, JSON.stringify(timetablesData))
                if (timetableResult.ok) {
                  const timetableResultData = await timetableResult.json()
                  PaulyListNewData["fields"]["timetablesListId"] = timetableResultData["id"]
                  const paulyListResult = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/sites/" + siteID + "/lists", instance, accounts, "POST", false, JSON.stringify(PaulyListData))
                  if (paulyListResult.ok){
                    const paulyListResultData = await paulyListResult.json()
                    const addPaulyListResult = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/sites/" + siteID + "/lists/" + paulyListResultData["id"] + "/items", instance, accounts, "POST", false, JSON.stringify(PaulyListNewData))
                    if (addPaulyListResult.ok){
                      setInitilizePaulyLoadingResult(loadingStateEnum.success)
                      console.log("Yeah")
                      console.log(PaulyListNewData)
                    } else {
                      setInitilizePaulyLoadingResult(loadingStateEnum.failed)
                      console.log("Add Pauly List Result Failed")
                    }
                  } else {
                    setInitilizePaulyLoadingResult(loadingStateEnum.failed)
                  }
                } else {
                  console.log("Timetable Failed")
                }
              } else {
                setInitilizePaulyLoadingResult(loadingStateEnum.failed)
                console.log("Sports Submissions Failed")
              }
            } else {
              setInitilizePaulyLoadingResult(loadingStateEnum.failed)
              console.log("Sports Approval Failed")
            }
          } else {
            setInitilizePaulyLoadingResult(loadingStateEnum.failed)
            console.log("Sports Failed")
          }
        } else {
          setInitilizePaulyLoadingResult(loadingStateEnum.failed)
          console.log("Schedule Failed")
          const scheduleData = await scheduleResult.json()
          console.log(scheduleData)
        }
      } else {
        setInitilizePaulyLoadingResult(loadingStateEnum.failed)
        console.log("Pauly Data Failed")
      }
    } else {
      setInitilizePaulyLoadingResult(loadingStateEnum.failed)
      console.log("Commissions Failed")
    }
  }
  return (
    <View>
      <Link to="/profile/government">
        <Text>Back</Text>
      </Link>
      <Button title={(initilizePaulyLoadingResult === loadingStateEnum.notStarted) ? "Initilize Pauly on New Tenant":(initilizePaulyLoadingResult ===  loadingStateEnum.loading) ? "Loading":(initilizePaulyLoadingResult === loadingStateEnum.success) ? "Success":"Failed"} onPress={() => {if (initilizePaulyLoadingResult === loadingStateEnum.notStarted) {InitilizePauly()}}}/>
    </View>
  )
}