import { View, Text, Pressable } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-native'
import callMsGraph from '../../../../Functions/Ultility/microsoftAssets'
import { RootState } from '../../../../Redux/store'
import { useSelector } from 'react-redux'
import create_UUID from '../../../../Functions/Ultility/CreateUUID'

export default function GovernmentHandleFileSubmissions() {
  const {siteId, sportsSubmissionsListId} = useSelector((state: RootState) => state.paulyList)
  const [currentMediaSubmissions, setCurrentMediaSubmissions] = useState<mediaSubmissionType[]>([])
  const navigate = useNavigate()
  async function getSubmissions() {
      const result = await callMsGraph("https://graph.microsoft.com/v1.0/sites/"+siteId+"/lists/"+sportsSubmissionsListId+"/items?expand=fields")
      if (result.ok){
          const data = await result.json()
          console.log(data)
          var newMediaSubmissions: mediaSubmissionType[] = []
          if (data["value"].length !== undefined && data["value"].length !== null){
            for(let index = 0; index < data["value"].length; index++){
              newMediaSubmissions.push({
                Title: data["value"][index]["fields"]["Title"],
                User: data["value"][index]["fields"]["User"],
                SubmissionID: data["value"][index]["fields"]["SubmissionID"],
                Accepted: data["value"][index]["fields"]["Accepted"],
                FileId: data["value"][index]["fields"]["FileId"],
                ItemID:  data["value"][index]["id"]
              })
            }
            console.log(newMediaSubmissions)
            setCurrentMediaSubmissions(newMediaSubmissions)
          }
      } else {
        console.log("Uh Oh something has gone wrong")
      }
  }
  useEffect(() => {getSubmissions()}, [])
  return (
    <View>
      <Text>HandleFileSubmissions</Text>
      {currentMediaSubmissions.map((item) => (
        <Pressable key={`Submission_${item.SubmissionID}_${create_UUID()}`} onPress={() => navigate("/profile/government/sports/post/review/" + item.SubmissionID)} style={{borderColor: "black", borderWidth: 2}}>
          <Text>{item.Title}</Text>
          <Text>Accepted: {(item.Accepted) ? "Yes":"No"}</Text>
          <Text>{item.SubmissionID}</Text>
          <Text>{item.User}</Text>
          <Text>{item.FileId}</Text>
        </Pressable>
      ))}
    </View>
  )
}