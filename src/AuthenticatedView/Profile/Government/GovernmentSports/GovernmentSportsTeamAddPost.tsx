import { View, Text, Pressable, TextInput } from 'react-native'
import React, { useContext, useState } from 'react'
import MicrosoftFilePicker from '../../../../UI/microsoftFilePicker'
import { Link, useSearchParams } from 'react-router-native'
import callMsGraph from '../../../../Functions/Ultility/microsoftAssets'
import create_UUID from '../../../../Functions/Ultility/CreateUUID'
import { useSelector } from 'react-redux'
import store, { RootState } from '../../../../Redux/store'

enum postSubmissionResultType {
    notLoading,
    loading,
    failure,
    success
}

export default function GovernmentSportsTeamAddPost() {
    const {width, height} = useSelector((state: RootState) => state.dimentions)
    const {siteId} = useSelector((state: RootState) => state.paulyList)
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
                console.log(newItemPath + item.id + "/createLink")
                const result = await callMsGraph("https://graph.microsoft.com/v1.0/drives/" + item.parentDriveId + "/items/" + item.id + "/createLink", "POST", false, JSON.stringify(data))
                console.log(result)
                if (result.ok){
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
        const resultOne = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + siteId + "/lists/bf26e642-f655-47db-a037-188189b0d378/columns") //TO DO fix id
        const dataOne = await resultOne.json()
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
            const result = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + siteId + `/lists/${store.getState().paulyList.sportsSubmissionsListId}/items`, "POST", false, JSON.stringify(data)) //TO DO fix id
            if (result.ok){
              setPostSubmissionResult(postSubmissionResultType.success)
            } else {
              setPostSubmissionResult(postSubmissionResultType.failure)
            }
        } else {
          setPostSubmissionResult(postSubmissionResultType.failure)
        }
    }
  return (
    <View style={{width: width, height: height, backgroundColor: "white"}}>
      <Link to="/profile/government/sports">
        <Text>Back</Text>
      </Link>
      <Text>Add Sports Team Post</Text>
      <TextInput value={postName} onChangeText={(e) => {setPostName(e)}}/>
      <MicrosoftFilePicker onSelectedFile={(item: microsoftFileType) => {getShareLink(item)}} height={500} width={500} />
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