import { View, Text, Dimensions, Pressable } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-native'
import callMsGraph from '../../../../Functions/Ultility/microsoftAssets';
import GovernmentHandleFileSubmissions from './GovernmentHandleFileSubmissions';
import { loadingStateEnum } from '../../../../types';
import { RootState } from '../../../../Redux/store';
import { useSelector } from 'react-redux';
import { getSports } from '../../../../Functions/sportsFunctions';

export default function GovernmentSports() {
  const {width, height} = useSelector((state: RootState) => state.dimentions)
  
  const [currentSports, setCurrentSports] = useState<sportType[]>([])
  const [dataResult, setDataResult] = useState<loadingStateEnum>(loadingStateEnum.loading)

  async function loadData() {
    const result = await getSports()
    if (result.result === loadingStateEnum.success && result.data !== undefined) {
      setCurrentSports(result.data)
      console.log(result.data)
    } else {
      console.log("failed")
    }
    setDataResult(result.result)
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <View style={{width: width, height: height, backgroundColor: "white"}}>
      <Link to="/profile/government/">
        <Text>Back</Text>
      </Link>
      <Text>Government Sports</Text>
      <>
        { (dataResult === loadingStateEnum.loading) ?
          <View><Text>Loading</Text></View>:
          <>
            {(dataResult === loadingStateEnum.success) ?
              <View>
                {currentSports.map((item, id) => (
                  <Link key={id} to={"/profile/government/sports/team/" + item.name + "/" + item.id}>
                    <View>
                      <Text>{item.name}</Text>
                    </View>
                  </Link>
                ))}
              </View>:<View><Text>Error</Text></View>
            }
          </>
        }
      </>
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