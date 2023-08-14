import { View, Text, Dimensions, Pressable } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-native'
import callMsGraph from '../../../../Functions/microsoftAssets';
import { pageDataContext } from '../../../../../App';
import GovernmentHandleFileSubmissions from './GovernmentHandleFileSubmissions';
import { siteID } from '../../../../PaulyConfig';
import { loadingStateEnum } from '../../../../types';

type sportType = {
  name: string
  id: string
}

export default function GovernmentSports() {
  const pageData = useContext(pageDataContext);
  const [currentSports, setCurrentSports] = useState<sportType[]>([])
  const [dataResult, setDataResult] = useState<loadingStateEnum>(loadingStateEnum.loading)

  async function getSports(){
    const result = await callMsGraph("https://graph.microsoft.com/v1.0/sites" + siteID + "/lists/af29f01a-df11-4e9d-85c8-7461ca4dc6e9/items?expand=fields")//TO DO list id
    if (result.ok) {
      const data = await result.json()
      console.log(data)
      console.log(data)
      if (data["value"] !== null && data["value"] !== undefined){
        var resultData: sportType[] = []
        for (let index = 0; index < data["value"].length; index++) {
          resultData.push({
            name: data["value"][index]["fields"]["SportName"],
            id: data["value"][index]["fields"]["SportID"]
          })
        }
        setCurrentSports(resultData)
        console.log(resultData)
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
    <View>
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