import { View, Text } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-native'
import callMsGraph from '../../../../Functions/Ultility/microsoftAssets'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../Redux/store'
import { loadingStateEnum } from '../../../../types'
import { getSportsTeams } from '../../../../Functions/sports/sportsFunctions'

export default function GovernmentSportsTeams() {
  const { sport, id } = useParams()
  const {width, height} = useSelector((state: RootState) => state.dimentions)
  const navigate = useNavigate()

  const [dataResult, setDataResult] = useState<loadingStateEnum>(loadingStateEnum.loading)
  const [currentTeams, setCurrentTeams] = useState<sportTeamType[]>([])
  
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
      <View>
      { (dataResult === loadingStateEnum.loading) ?
        <View>
          <Text>Loading</Text>
        </View>:
        <View>
        {(dataResult === loadingStateEnum.success) ?
          <View>
          {currentTeams.map((item, idIn) => (
            <Link key={idIn} to={"/profile/government/sports/team/edit/" + sport + "/" + id + "/" + item.teamName + "/" + item.teamID + "/" + item.season}>
              <View key={idIn}>
                <Text>{item.teamName}</Text>
              </View>
            </Link>
          ))}
          </View>:<View><Text>Error</Text></View>
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