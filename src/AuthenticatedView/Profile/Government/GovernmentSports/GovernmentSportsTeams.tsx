import { View, Text, Pressable } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-native'
import callMsGraph from '../../../../Functions/Ultility/microsoftAssets'
import { useSelector } from 'react-redux'
import store, { RootState } from '../../../../Redux/store'
import { loadingStateEnum } from '../../../../types'
import { getSportsTeams } from '../../../../Functions/sports/sportsFunctions'
import { WarningIcon } from '../../../../UI/Icons/Icons'

export default function GovernmentSportsTeams() {
  const { sport, id } = useParams()
  const {width, height} = useSelector((state: RootState) => state.dimentions)
  const navigate = useNavigate()

  const [dataResult, setDataResult] = useState<loadingStateEnum>(loadingStateEnum.loading)
  const [currentTeams, setCurrentTeams] = useState<sportTeamType[]>([])
  const [deleteSportState, setDeleteSportState] = useState<loadingStateEnum>(loadingStateEnum.notStarted)
  
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
    <View style={{width: width, height: height, backgroundColor: "white"}}>
      <Link to="/profile/government/sports">
        <Text>Back</Text>
      </Link>
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
      <View>
      { (dataResult === loadingStateEnum.loading) ?
        <View>
          <Text>Loading</Text>
        </View>:
        <View>
        {(dataResult === loadingStateEnum.success) ?
          <>
          {currentTeams.map((item, idIn) => (
            <Pressable key={idIn} onPress={() => navigate(`/profile/government/sports/team/edit/${sport}/${id}/${item.teamName}/${item.teamID}/${item.season}`)}>
              <Text style={{margin: 10}}>{item.teamName}</Text>
            </Pressable>
          ))}
          </>:<View><Text>Error</Text></View>
        }
        </View>
      }
      </View>
      <Link to={"/profile/government/sports/team/" + sport + "/" + id + "/create"}>
        <Text>Create New Team</Text>
      </Link>
    </View>
  )
}