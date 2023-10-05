import { View, Text, Pressable, TextInput } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import MicrosoftFilePicker from '../../../../UI/microsoftFilePicker'
import { Link, useNavigate, useSearchParams } from 'react-router-native'
import callMsGraph from '../../../../Functions/Ultility/microsoftAssets'
import create_UUID from '../../../../Functions/Ultility/CreateUUID'
import { useSelector } from 'react-redux'
import store, { RootState } from '../../../../Redux/store'
import { loadingStateEnum } from '../../../../types'
import { getSports, getSportsTeams } from '../../../../Functions/sportsFunctions'
import ProgressView from '../../../../UI/ProgressView'
import { ScrollView } from 'react-native-gesture-handler'

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
  const navigate = useNavigate()
  const [selectedSportId, setSelectedSportId] = useState<string>("")
  const [selectedTeamId, setSelectedTeamId] = useState<string>("")

  async function getShareLink(item: microsoftFileType) {
    const itemPathArray = item.itemGraphPath.split("/")
    if (itemPathArray[itemPathArray.length - 1] === "children"){
      const newItemPath = item.itemGraphPath.slice(0, -8);
      const data = {
        "type": "view",
        "scope": "organization"
      }
      const result = await callMsGraph("https://graph.microsoft.com/v1.0/drives/" + item.parentDriveId + "/items/" + item.id + "/createLink", "POST", false, JSON.stringify(data))
      if (result.ok){
        const dataOut = await result.json()
        setSelectedShareID(dataOut["shareId"])
      } else {
        
      }
    }
  }
  async function createFileSubmission(fileID: string) {
    setPostSubmissionResult(postSubmissionResultType.loading)
    const userIdResult = await callMsGraph("https://graph.microsoft.com/v1.0/me") 
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
    <ScrollView style={{width: width, height: height, backgroundColor: "white"}}>
      <Pressable onPress={() => {navigate("/profile/government/sports")}}>
        <Text>Back</Text>
      </Pressable>
      <Text>Add Sports Team Post</Text>
      <TextInput value={postName} onChangeText={(e) => {setPostName(e)}}/>
      <PickSportTeam height={400} width={width} onSelect={(e) => {setSelectedSportId(e.sportId); setSelectedTeamId(e.teamId)}} onBack={() => {setSelectedSportId(""); setSelectedTeamId("")}}/>
      <MicrosoftFilePicker onSelectedFile={(item: microsoftFileType) => {getShareLink(item)}} height={500} width={width} />
      { (selectedShareID !== "") ? 
        <Pressable onPress={() => {
          if (postSubmissionResult === postSubmissionResultType.notLoading){
            createFileSubmission(selectedShareID)
          }}}>
          <Text>Submit</Text>
        </Pressable>:null
      }
      {(postSubmissionResult === postSubmissionResultType.loading) ? <Text>Loading</Text>:null}
      {(postSubmissionResult === postSubmissionResultType.failure) ? <Text>Failure</Text>:null}
      {(postSubmissionResult === postSubmissionResultType.success) ? <Text>Success</Text>:null}
    </ScrollView>
  )
}

function PickSportTeam({width, height, onSelect, onBack}:{width: number, height: number, onSelect: (item: {sportId: string, teamId: string}) => void, onBack: () => void}) {
  const [currentSports, setCurrentSports] = useState<sportType[]>([])
  const [dataResult, setDataResult] = useState<loadingStateEnum>(loadingStateEnum.loading)
  const [selectedSport, setSelectedSport] = useState<sportType|undefined>(undefined)
  const [sportsTeams, setSportTeams] = useState<sportTeamType[]>([])
  const [sportTeamState, setSportTeamState] = useState<loadingStateEnum>(loadingStateEnum.notStarted)

  async function loadData() {
    const result = await getSports()
    if (result.result === loadingStateEnum.success && result.data !== undefined) {
      setCurrentSports(result.data)
    }
    setDataResult(result.result)
  }

  async function loadTeams() {
    if (selectedSport !== undefined) {
      setSportTeamState(loadingStateEnum.loading)
      const result = await getSportsTeams(selectedSport.id)
      if (result.result === loadingStateEnum.success && result.data !== undefined) {
        setSportTeams(result.data)
      }
      setSportTeamState(result.result)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    loadTeams()
  }, [selectedSport])

  return (
    <View style={{width: width, height: height}}>
      <>
        { (sportsTeams === undefined || sportTeamState === loadingStateEnum.notStarted) ?
          <>
            { (dataResult === loadingStateEnum.loading) ?
              <View style={{width: width, height: height, alignContent: "center", alignItems: "center", justifyContent: "center"}}>
                <ProgressView width={(width < height) ? width * 0.1: height * 0.1} height={(width < height)  ? width * 0.1: height * 0.1}/>
                <Text>Loading</Text>
              </View>:
              <>
                {(dataResult === loadingStateEnum.success) ?
                  <>
                    {currentSports.map((item, id) => (
                      <Pressable key={id} onPress={() => setSelectedSport(item)}>
                        <View>
                          <Text>{item.name}</Text>
                        </View>
                      </Pressable>
                    ))}
                  </>:<View><Text>Error</Text></View>
                }
              </>
            }
          </>:
          <>
            { (sportTeamState === loadingStateEnum.loading) ?
              <View style={{width: width, height: height, alignContent: "center", alignItems: "center", justifyContent: "center"}}>
                <ProgressView width={(width < height) ? width * 0.1: height * 0.1} height={(width < height)  ? width * 0.1: height * 0.1}/>
                <Text>Loading</Text>
              </View>:
              <>
                {(sportTeamState === loadingStateEnum.success && selectedSport !== undefined) ?
                  <View>
                    <Pressable onPress={() => setSelectedSport(undefined)}>
                      <Text>Back</Text>
                    </Pressable>
                    {sportsTeams.map((item, id) => (
                      <Pressable key={id} onPress={() => onSelect({sportId: selectedSport.id, teamId: item.teamID})}>
                        <View>
                          <Text>{item.teamName}</Text>
                        </View>
                      </Pressable>
                    ))}
                  </View>:<View><Text>Error</Text></View>
                }
              </>
            }
          </>
        }
      </>
    </View>
  )
}