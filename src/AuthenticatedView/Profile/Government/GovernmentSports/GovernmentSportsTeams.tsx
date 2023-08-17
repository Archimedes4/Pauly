import { View, Text } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-native'
import callMsGraph from '../../../../Functions/microsoftAssets'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../Redux/store'

enum currentDataResult{
    loading,
    success,
    error
}

type sportTeamType = {
    teamName: string
    season: number
    teamID: string
}

export default function GovernmentSportsTeams() {
    const { sport, id } = useParams()
    const {siteId} = useSelector((state: RootState) => state.paulyList)

    const [dataResult, setDataResult] = useState<currentDataResult>(currentDataResult.loading)
    const [currentTeams, setCurrentTeams] = useState<sportTeamType[]>([])
    async function getTeams(){
        const result = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + siteId + "/lists/" + id +"/items?expand=fields")//TO DO list id
        if (result.ok) {
          const data = await result.json()
          console.log(data)
          console.log(data)
          if (data["value"] !== null && data["value"] !== undefined){
            var resultData: sportTeamType[] = []
            for (let index = 0; index < data["value"].length; index++) {
              resultData.push({
                teamName: data["value"][index]["fields"]["TeamName"],
                season: data["value"][index]["fields"]["Season"],
                teamID: data["value"][index]["fields"]["teamID"]
              })
            }
            setCurrentTeams(resultData)
            console.log("Team Result", resultData)
            setDataResult(currentDataResult.success)
          } else {
            setDataResult(currentDataResult.error)
          }
        } else {
          setDataResult(currentDataResult.error)
        }
    }
    useEffect(() => {
        getTeams()
    }, [])
    return (
        <View>
            <Link to="/profile/government/sports">
                <Text>Back</Text>
            </Link>
            <Text>{sport} Teams</Text>
            <View>
            { (dataResult === currentDataResult.loading) ?
                <View><Text>Loading</Text></View>:
                <View>
                {(dataResult === currentDataResult.success) ?
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