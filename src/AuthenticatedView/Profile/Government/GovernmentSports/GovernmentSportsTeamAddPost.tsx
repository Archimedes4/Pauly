import { View, Text, Pressable, TextInput } from 'react-native'
import React, { useContext, useState } from 'react'
import MicrosoftFilePicker from '../../../../UI/microsoftFilePicker'
import { Link, useSearchParams } from 'react-router-native'
import callMsGraph from '../../../../Functions/microsoftAssets'
import { pageDataContext } from '../../../../Redux/AccessTokenContext'
import create_UUID from '../../../../Functions/CreateUUID'
import { useMsal } from '@azure/msal-react'
import { siteID } from '../../../../PaulyConfig'

enum postSubmissionResultType {
    notLoading,
    loading,
    failure,
    success
}

export default function GovernmentSportsTeamAddPost() {
    const pageData = useContext(pageDataContext);

    const [selectedShareID, setSelectedShareID] = useState<string>("")
    const [postName, setPostName] = useState<string>("")
    const [postSubmissionResult, setPostSubmissionResult] = useState<postSubmissionResultType>(postSubmissionResultType.notLoading)
    async function getShareLink(item: microsoftFileType) {
        const itemPathArray = item.itemGraphPath.split("/")
        if (itemPathArray[itemPathArray.length - 1] === "children"){
            const newItemPath = item.itemGraphPath.slice(0, -8);
            console.log("New Item path", newItemPath)
            try{
                const data = {
                    "type": "view",
                    "scope": "organization"
                }
                console.log( newItemPath + item.id + "/createLink")
                const result = await callMsGraph("https://graph.microsoft.com/v1.0/drives/" + item.parentDriveId + "/items/" + item.id + "/createLink", "POST", false, JSON.stringify(data))
                console.log(result)
                if (result.ok){
                    const data = await result.json()
                    console.log(data)
                    setSelectedShareID(data["shareId"])
                } else {
                    const data = await result.json()
                    console.log(data)
                }
            } catch {
    
            }
        }
    }
    async function createFileSubmission(fileID: string) {
        setPostSubmissionResult(postSubmissionResultType.loading)
        const userIdResult = await callMsGraph("https://graph.microsoft.com/v1.0/me") 
        const resultOne = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + siteID + "/lists/bf26e642-f655-47db-a037-188189b0d378/columns") //TO DO fix id
        const dataOne = await resultOne.json()
        console.log(dataOne)
        console.log(fileID.length)
        if (userIdResult.ok){
            const userData = await userIdResult.json()
            const submissionID = create_UUID()
            const data = {
                "fields": {
                  "Title": postName,
                  "FileId": fileID,
                  "Accepted":false,
                  "User":userData["id"],
                  "TimeCreated": new Date().toISOString(),
                  "SubmissionID": submissionID
                }
            }
            console.log(data)
            const result = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + siteID + "/lists/bf26e642-f655-47db-a037-188189b0d378/items", "POST", false, JSON.stringify(data)) //TO DO fix id
            if (result.ok){
                const data = await result.json()
                console.log(data, result)
                setPostSubmissionResult(postSubmissionResultType.success)
            } else {
                const data = await result.json()
                console.log(data, result)
                setPostSubmissionResult(postSubmissionResultType.failure)
            }
        } else {
            setPostSubmissionResult(postSubmissionResultType.failure)
            console.log(userIdResult)
        }
    }
  return (
    <View>
        <Link to="/profile/government/sports">
            <Text>Back</Text>
        </Link>
        <Text>GovernmentSportsTeamAddPost</Text>
        <TextInput value={postName} onChangeText={(e) => {setPostName(e)}}/>
        <View>
            <MicrosoftFilePicker onSelectedFile={(item: microsoftFileType) => {getShareLink(item)}} height={100} width={100} />
        </View>
        { (selectedShareID !== "") && 
            <Pressable onPress={() => {
                if (postSubmissionResult === postSubmissionResultType.notLoading){
                    createFileSubmission(selectedShareID)
                }
                }}>
                <Text>Submit</Text>
            </Pressable>
        }
        {(postSubmissionResult === postSubmissionResultType.loading) ? <Text>Loading</Text>:null}
        {(postSubmissionResult === postSubmissionResultType.failure) ? <Text>Failure</Text>:null}
        {(postSubmissionResult === postSubmissionResultType.success) ? <Text>Success</Text>:null}
    </View>
  )
}