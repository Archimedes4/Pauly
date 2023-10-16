import { View, Text, Pressable, Modal, TextInput } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-native'
import callMsGraph from '../../../../Functions/Ultility/microsoftAssets'
import { useSelector } from 'react-redux'
import store, { RootState } from '../../../../Redux/store'
import { Colors, loadingStateEnum } from '../../../../types'
import { getSportsTeams } from '../../../../Functions/sports/sportsFunctions'
import { WarningIcon } from '../../../../UI/Icons/Icons'
import { FlatList, ScrollView } from 'react-native-gesture-handler'
import SVGXml from '../../../../UI/SVGXml/SVGXml'
import getSport from '../../../../Functions/sports/getSport'

export default function GovernmentSportsTeams() {
  const { sport, id } = useParams()
  const {width, height} = useSelector((state: RootState) => state.dimentions)
  const navigate = useNavigate()

  const [dataResult, setDataResult] = useState<loadingStateEnum>(loadingStateEnum.loading)
  const [currentTeams, setCurrentTeams] = useState<sportTeamType[]>([])
  const [deleteSportState, setDeleteSportState] = useState<loadingStateEnum>(loadingStateEnum.notStarted)
  
  const [isPickingSvg, setIsPickingSvg] = useState<boolean>(false)

  async function deleteSport() {
    setDeleteSportState(loadingStateEnum.loading)
    const listResult = await callMsGraph(`https://graph.microsoft.com/v1.0/sites/${store.getState().paulyList.siteId}/lists/${id}`, "DELETE")
    if (listResult.ok) {
      const getSportResult = await callMsGraph(`https://graph.microsoft.com/v1.0/sites/${store.getState().paulyList.siteId}/lists/${store.getState().paulyList.sportsListId}/items?$expand=fields&$filter=fields/sportId%20eq%20'${id}'&$select=id`)
      if (getSportResult.ok) {
        const getSportData = await getSportResult.json()
        if (getSportData["value"].length === 1) {
          const itemDeleteResult = await callMsGraph(`https://graph.microsoft.com/v1.0/sites/${store.getState().paulyList.siteId}/lists/${store.getState().paulyList.sportsListId}/items/${getSportData["value"][0]["id"]}`, "DELETE")
          if (itemDeleteResult.ok) {
            setDeleteSportState(loadingStateEnum.success)
          } else {
            setDeleteSportState(loadingStateEnum.failed)
          }
        } else {
          setDeleteSportState(loadingStateEnum.failed)
        }
      } else {
        setDeleteSportState(loadingStateEnum.failed)
      }
    } else {
      setDeleteSportState(loadingStateEnum.failed)
    }
  }

  async function loadData() {
    if (id !== undefined) {
      const result = await getSportsTeams(id)
      if (result.result === loadingStateEnum.success && result.data !== undefined) {
        setCurrentTeams(result.data)
      }
      setDataResult(result.result)
    } else {
      setDataResult(loadingStateEnum.failed)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <View style={{width: width, height: height, backgroundColor: Colors.white}}>
      <Pressable onPress={() => navigate("/profile/government/sports")}>
        <Text>Back</Text>
      </Pressable>
      <Text>{sport} Teams</Text>
      <Pressable style={{borderRadius: 15, backgroundColor: "red"}} onPress={() => {
        if (deleteSportState === loadingStateEnum.notStarted || deleteSportState === loadingStateEnum.failed) {
          deleteSport()
        }
      }}>
        <View style={{flexDirection: "row", margin: 10}}>
          <WarningIcon width={14} height={14}/>
          <Text>{(deleteSportState === loadingStateEnum.loading) ? "Loading":(deleteSportState === loadingStateEnum.notStarted) ? "Delete Sport":(deleteSportState === loadingStateEnum.success) ? "Sport Deleted":"Failed To Delete Sport"}</Text>
        </View>
      </Pressable>
      <Pressable onPress={() => setIsPickingSvg(true)}>
        <Text>Pick Svg</Text>
      </Pressable>
      { (id !== undefined) ? 
        <SportsUpdateModel isPickingSvg={isPickingSvg} setIsPickingSvg={setIsPickingSvg} id={id} />:null
      }
      <View>
      { (dataResult === loadingStateEnum.loading) ?
        <View>
          <Text>Loading</Text>
        </View>:
        <>
        {(dataResult === loadingStateEnum.success) ?
          <>
            <FlatList 
              data={currentTeams}
              renderItem={(item) => (
                <Pressable key={`TeamBlock_${item.item.teamId}`} onPress={() => navigate(`/profile/government/sports/team/${sport}/${id}/${item.item.teamId}`)}>
                  <Text style={{margin: 10}}>{item.item.teamName}</Text>
                </Pressable>
              )}     
            />
          </>:
          <View>
            <Text>Error</Text>
          </View>
        }
        </>
      }
      </View>
      <Pressable onPress={() => navigate(`/profile/government/sports/team/${sport}/${id}/create`)}>
        <Text>Create New Team</Text>
      </Pressable>
    </View>
  )
}

function SportsUpdateModel({isPickingSvg, setIsPickingSvg, id}:{isPickingSvg: boolean, setIsPickingSvg: (item: boolean) => void, id: string}) {
  const [svgData, setSvgData] = useState<string>("")
  const [listId, setListId] = useState<string>("")
  const [getSportState, setGetSportState] = useState<loadingStateEnum>(loadingStateEnum.loading)
  async function updateSport() {
    const result = await callMsGraph(`https://graph.microsoft.com/v1.0/sites/${store.getState().paulyList.siteId}/lists/"${store.getState().paulyList.sportsListId}/items/`)
  }

  async function loadSport() {
    const result = await getSport(id)
    if (result.result === loadingStateEnum.success && result.data !== undefined && result.listId !== undefined) {
      setListId(result.listId)
      setGetSportState(loadingStateEnum.success)
    } else {
      setGetSportState(loadingStateEnum.failed)
    }
  }

  useEffect(() => {
    loadSport()
  }, [])

  return (
    <Modal visible={isPickingSvg} animationType="slide" style={{backgroundColor: Colors.white}}>
      { (getSportState === loadingStateEnum.loading) ?
        <View>
          <Text>Loading</Text>
          <Pressable onPress={() => setIsPickingSvg(false)}>
            <Text>Dismiss</Text>
          </Pressable>
        </View>:
        <>
          { (getSportState === loadingStateEnum.success) ?
            <View>
              <Text>Svg</Text>
              <SVGXml xml={svgData} width={100} height={100}/>
              <TextInput value={svgData} onChangeText={(e) => {setSvgData(e)}} multiline={true} numberOfLines={25}/>
              <Pressable>
                <Text>Confirm</Text>
              </Pressable>
              <Pressable onPress={() => setIsPickingSvg(false)}>
                <Text>Dismiss</Text>
              </Pressable>
            </View>:
            <View>
              <Text>Failed</Text>
              <Pressable onPress={() => setIsPickingSvg(false)}>
                <Text>Dismiss</Text>
              </Pressable>
            </View>

          }
        </>
      }
    </Modal>
  )
}