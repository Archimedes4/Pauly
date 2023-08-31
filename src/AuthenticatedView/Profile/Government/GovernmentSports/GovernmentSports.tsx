import { View, Text, Dimensions, Pressable } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-native'
import callMsGraph from '../../../../Functions/microsoftAssets';
import GovernmentHandleFileSubmissions from './GovernmentHandleFileSubmissions';
import { loadingStateEnum } from '../../../../types';
import { RootState } from '../../../../Redux/store';
import { useSelector } from 'react-redux';

type sportType = {
  name: string
  id: string
}

export default function GovernmentSports() {
  const {width, height} = useSelector((state: RootState) => state.dimentions)
  const {siteId, sportsListId} = useSelector((state: RootState) => state.paulyList)
  
  const [currentSports, setCurrentSports] = useState<sportType[]>([])
  const [dataResult, setDataResult] = useState<loadingStateEnum>(loadingStateEnum.loading)

  async function getSports(){
    const result = await callMsGraph("https://graph.microsoft.com/v1.0/sites" + siteId + "/lists/" + sportsListId + "/items?expand=fields")//TO DO list id
    if (result.ok) {
      const data = await result.json()
      if (data["value"] !== null && data["value"] !== undefined){
        var resultData: sportType[] = []
        for (let index = 0; index < data["value"].length; index++) {
          resultData.push({
            name: data["value"][index]["fields"]["SportName"],
            id: data["value"][index]["fields"]["SportID"]
          })
        }
        setCurrentSports(resultData)
        setDataResult(loadingStateEnum.success)
      } else {
        setDataResult(loadingStateEnum.failed)
      }
    } else {
      setDataResult(loadingStateEnum.failed)
    }
  }

  useEffect(() => {
    getSports()
  }, [])

  return (
    <View style={{width: width, height: height, backgroundColor: "white"}}>
      <Link to="/profile/government/">
        <Text>Back</Text>
      </Link>
      <Text>Government Sports</Text>
      <View>
        { (dataResult === loadingStateEnum.loading) ?
          <View><Text>Loading</Text></View>:
          <View>
            {(dataResult === loadingStateEnum.success) ?
              <View>
                {currentSports.map((item, id) => (
                  <Link to={"/profile/government/sports/team/" + item.name + "/" + item.id}>
                    <View key={id}>
                      <Text>{item.name}</Text>
                    </View>
                  </Link>
                ))}
              </View>:<View><Text>Error</Text></View>
            }
          </View>
        }
      </View>
      <Link to="/profile/government/sports/create">
        <Text>Create Sport</Text>
      </Link>
      <Link to="/profile/government/sports/post/0/0/0/0/0">
        <Text>Create Post</Text>
      </Link>
      <GovernmentHandleFileSubmissions/>
    </View>
  )
}