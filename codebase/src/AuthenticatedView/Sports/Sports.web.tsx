import { View, Text, Dimensions, Image } from 'react-native'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-native'
import NavBarComponent from '../../UI/NavComponent'
import { siteID } from '../../PaulyConfig'
import { accessTokenContent } from '../../../App'
import callMsGraph from '../../Functions/microsoftAssets'
import getFileWithShareID from '../../Functions/getFileWithShareID'
import ChevronLeft from '../../UI/ChevronLeft'
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

const windowDimensions = Dimensions.get('window');
const screenDimensions = Dimensions.get('screen');

enum dataContentTypeOptions {
  video,
  image,
  unknown
}

enum loadingResultEnum {
  loading,
  success,
  failure,
  unauthorized
}

declare global {
  type sportPost = {
    caption: string,
    fileID: string,
    fileType: dataContentTypeOptions
  }
}

export default function Sports() {
  const microsoftAccessToken = useContext(accessTokenContent);
  const [sportsPosts, setSportsPosts] = useState<sportPost[]>([])
  const [loadingResult, setLoadingResult] = useState<loadingResultEnum>(loadingResultEnum.loading)

  async function getSportsContent() {
    const result = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/sites/" + siteID + "/lists/d10e9373-7e8b-4400-98f1-62ba95e4cd34/items?expand=fields")
    if (result.ok){
      const dataResult = await result.json()
      if (dataResult["value"].length !== undefined){
        var newSportsPosts: sportPost[] = []
        for (let index = 0; index < dataResult["value"].length; index++){
          try{
            const shareResult = await getFileWithShareID(dataResult["value"][index]["fields"]["FileId"], microsoftAccessToken.accessToken)
            newSportsPosts.push({
              caption: dataResult["value"][index]["fields"]["Caption"],
              fileID: shareResult.url,
              fileType: shareResult.contentType
            })
          } catch {

          }
        }
        setSportsPosts(newSportsPosts)
        setLoadingResult(loadingResultEnum.success)
      } else {
        setLoadingResult(loadingResultEnum.failure)
      }
    } else {
      if (result.status === 401){
        setLoadingResult(loadingResultEnum.unauthorized)
      } else {
        setLoadingResult(loadingResultEnum.failure)
      }
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
    <View style={{height: microsoftAccessToken.dimensions.window.height, width: microsoftAccessToken.dimensions.window.width, backgroundColor: "white", overflow: "hidden"}}>
      <View style={{height: microsoftAccessToken.dimensions.window.height * 0.075, width: microsoftAccessToken.dimensions.window.width, backgroundColor: '#444444', alignContent: "center", alignItems: "center", justifyContent: "center"}}>
        { (microsoftAccessToken.dimensions.window.width > 576) ?
          null:<Link to="/">
            <View style={{flexDirection: "row"}}>
              <ChevronLeft />
              <Text>Back</Text>
            </View>
          </Link>
        }
        <Text style={{fontFamily: "BukhariScript"}}>Sports</Text>
      </View>
      
      { (loadingResult === loadingResultEnum.loading) ?
        <View>
          <Text>Loading</Text>
        </View>:
        <View> 
          { (loadingResult === loadingResultEnum.success) ?
            <View>
              { sportsPosts.map((item) => (
                <View style={{marginTop: microsoftAccessToken.dimensions.window.height * 0.05}}>
                { (item.fileType === dataContentTypeOptions.image) ?
                  <Image style={{width: microsoftAccessToken.dimensions.window.width * 0.9, height: microsoftAccessToken.dimensions.window.height * 0.6, marginLeft: microsoftAccessToken.dimensions.window.width * 0.05}} source={{uri: item.fileID}}/>:null
                }
                { (item.fileType === dataContentTypeOptions.video) ?
                  <video src={item.fileID} style={{width: microsoftAccessToken.dimensions.window.width * 0.9, height: microsoftAccessToken.dimensions.window.height * 0.6}} controls/>:null
                }
                </View>
              ))
              }
            </View>:
            <View>
              { (loadingResult === loadingResultEnum.unauthorized) ? 
                <View>
                  <Text>Uh Oh something went wrong. It seams that you don't have access</Text>
                </View>:
                <View>
                  <Text>Something went wrong</Text>
                </View>
              }
            </View>
          }
        </View>
      }
    </View>
  )
}