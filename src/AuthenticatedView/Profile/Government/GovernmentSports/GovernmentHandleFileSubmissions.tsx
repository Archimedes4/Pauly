import { View, Text } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-native'
import callMsGraph from '../../../../Functions/microsoftAssets'
import { siteID } from '../../../../PaulyConfig'

declare global {
    type mediaSubmissionType = {
        Title: string
        User: string
        SubmissionID: string
        Accepted: boolean
        FileId: string
        ItemID: string
    }
}

export default function GovernmentHandleFileSubmissions() {

    const [currentMediaSubmissions, setCurrentMediaSubmissions] = useState<mediaSubmissionType[]>([])
    async function getSubmissions() {
        const result = await callMsGraph("https://graph.microsoft.com/v1.0/sites/"+siteID+"/lists/bf26e642-f655-47db-a037-188189b0d378/items?expand=fields")//TO DO fix id
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
            <Link to={"/profile/government/sports/post/review/" + item.SubmissionID}>
                <View style={{borderColor: "black", borderWidth: 2}}>
                    <Text>{item.Title}</Text>
                    <Text>Accepted: {(item.Accepted) ? "Yes":"No"}</Text>
                    <Text>{item.SubmissionID}</Text>
                    <Text>{item.User}</Text>
                    <Text>{item.FileId}</Text>
                </View>
            </Link> 
            ))}
    </View>
  )
}