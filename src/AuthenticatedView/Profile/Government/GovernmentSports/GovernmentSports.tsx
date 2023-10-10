import { View, Text, Dimensions, Pressable } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-native'
import callMsGraph from '../../../../Functions/Ultility/microsoftAssets';
import GovernmentHandleFileSubmissions from './GovernmentHandleFileSubmissions';
import { loadingStateEnum } from '../../../../types';
import { RootState } from '../../../../Redux/store';
import { useSelector } from 'react-redux';
import { getSports } from '../../../../Functions/sports/sportsFunctions';
import ProgressView from '../../../../UI/ProgressView';

export default function GovernmentSports() {
  const {width, height} = useSelector((state: RootState) => state.dimentions)
  
  const [currentSports, setCurrentSports] = useState<sportType[]>([])
  const [dataResult, setDataResult] = useState<loadingStateEnum>(loadingStateEnum.loading)

  const navigate = useNavigate()

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
      <View style={{height: height * 0.1}}>
        <Link to="/profile/government/">
          <Text>Back</Text>
        </Link>
        <Text>Government Sports</Text>
      </View>
      <View style={{height: height * 0.4}}>
        { (dataResult === loadingStateEnum.loading) ?
          <View style={{height: height * 0.4, width: width, alignContent: "center", alignItems: "center", justifyContent: "center"}}>
            <ProgressView width={((height * 0.4) < width) ? height * 0.1:width * 0.4} height={((height * 0.4) < width) ? height * 0.1:width * 0.4} />
            <Text>Loading</Text>
          </View>:
          <>
            {(dataResult === loadingStateEnum.success) ?
              <View>
                {currentSports.map((item, id) => (
                  <Pressable onPress={() => {navigate(`/profile/government/sports/team/${item.name}/${item.id}`)}} key={id}>
                    <View>
                      <Text>{item.name}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>:<View><Text>Error</Text></View>
            }
          </>
        }
      </View>
      <View style={{height: height * 0.1, overflow: "hidden"}}>
        <Pressable onPress={() => navigate("/profile/government/sports/create")}>
          <Text>Create Sport</Text>
        </Pressable>
        <Pressable onPress={() => navigate("/profile/government/sports/post/create")}>
          <Text>Create Post</Text>
        </Pressable>
      </View>
      <GovernmentHandleFileSubmissions width={width} height={height * 0.4}/>
    </View>
  )
}