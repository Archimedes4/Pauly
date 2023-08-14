import { View, Text, Dimensions, Image } from 'react-native'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-native'
import { ChevronLeft } from '../../UI/Icons/Icons'
import { siteID } from '../../PaulyConfig'
import { accessTokenContent } from '../../../App'
import callMsGraph from '../../Functions/microsoftAssets'
import getFileWithShareID from '../../Functions/getFileWithShareID'
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useMsal } from '@azure/msal-react'
import { useSelector } from 'react-redux'
import { RootState } from '../../Redux/store'
import { loadingStateEnum } from '../../types'

const windowDimensions = Dimensions.get('window');
const screenDimensions = Dimensions.get('screen');

enum dataContentTypeOptions {
  video,
  image,
  unknown
}

// enum loadingResultEnum {
//   loading,
//   success,
//   failure,
//   unauthorized
// }

declare global {
  type sportPost = {
    caption: string,
    fileID: string,
    fileType: dataContentTypeOptions
  }
}

export default function Sports() {
  const pageData = useContext(pageDataContext);
  const {sportsApprovedSubmissionsListId} = useSelector((state: RootState) => state.paulyList)
  const [sportsPosts, setSportsPosts] = useState<sportPost[]>([])
  const [loadingResult, setLoadingResult] = useState<loadingStateEnum>(loadingStateEnum.loading)

  async function getSportsContent() {
    const result = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + siteID + "/lists/" + sportsApprovedSubmissionsListId + "/items?expand=fields")
    if (result.ok){
      const dataResult = await result.json()
      if (dataResult["value"].length !== undefined){
        var newSportsPosts: sportPost[] = []
        for (let index = 0; index < dataResult["value"].length; index++){
          try{
            const shareResult = await getFileWithShareID(dataResult["value"][index]["fields"]["FileId"])
            newSportsPosts.push({
              caption: dataResult["value"][index]["fields"]["Caption"],
              fileID: shareResult.url,
              fileType: shareResult.contentType
            })
          } catch {

          }
        }
        setSportsPosts(newSportsPosts)
        setLoadingResult(loadingStateEnum.success)
      } else {
        setLoadingResult(loadingStateEnum.failed)
      }
    } else {
      setLoadingResult(loadingStateEnum.failed)
    }
  }
  useEffect(() => {
    getSportsContent()
  }, [])

  const [fontsLoaded] = useFonts({
    'BukhariScript': require('../../../assets/fonts/BukhariScript.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }
  return (
    <View style={{height: pageData.dimensions.window.height, width: pageData.dimensions.window.width, backgroundColor: "white", overflow: "hidden"}}>
      <View style={{height: pageData.dimensions.window.height * 0.075, width: pageData.dimensions.window.width, backgroundColor: '#444444', alignContent: "center", alignItems: "center", justifyContent: "center"}}>
        { (pageData.dimensions.window.width > 576) ?
          null:<Link to="/">
            <View style={{flexDirection: "row"}}>
              <ChevronLeft width={14} height={14}/>
              <Text>Back</Text>
            </View>
          </Link>
        }
        <Text style={{fontFamily: "BukhariScript"}}>Sports</Text>
      </View>
      
      { (loadingResult === loadingStateEnum.loading) ?
        <View>
          <Text>Loading</Text>
        </View>:
        <View> 
          { (loadingResult === loadingStateEnum.success) ?
            <View>
              { sportsPosts.map((item) => (
                <View style={{marginTop: pageData.dimensions.window.height * 0.05}}>
                { (item.fileType === dataContentTypeOptions.image) ?
                  <Image style={{width: pageData.dimensions.window.width * 0.9, height: pageData.dimensions.window.height * 0.6, marginLeft: pageData.dimensions.window.width * 0.05}} source={{uri: item.fileID}}/>:null
                }
                { (item.fileType === dataContentTypeOptions.video) ?
                  <video src={item.fileID} style={{width: pageData.dimensions.window.width * 0.9, height: pageData.dimensions.window.height * 0.6}} controls/>:null
                }
                </View>
              ))
              }
            </View>:
            <View>
              { (loadingResult === loadingStateEnum.failed) ?
                <View>
                  <Text>Something went wrong</Text>
                </View>:null
              }
            </View>
          }
        </View>
      }
    </View>
  )
}