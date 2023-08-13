import { View, Text, Dimensions, Image, ImageSourcePropType } from 'react-native'
import React, { ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-native'
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { accessTokenContent } from '../../../../App';
import { CalendarIcon, MedalIcon } from '../../../UI/Icons/Icons';
import { RootState } from '../../../Redux/store';
import { useSelector } from 'react-redux';

function Block({height, width, text, imageSource, children}:{height: number, width: number, text: string, imageSource?: ImageSourcePropType, children?: ReactNode}) {
  return (
    <View style={{height: height, width: width, alignContent: "center", alignItems: "center", justifyContent: "center", backgroundColor: "#444444", borderRadius: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.8, shadowRadius: 5}}>
      { (imageSource !== undefined) && <Image source={imageSource} style={{width: width * 0.5, height: height * 0.5}}/>}
      { (imageSource === undefined && children !== undefined) && <View style={{width: width * 0.5, height: height * 0.5}}><React.Fragment>{children}</React.Fragment></View> }
      <Text>{text}</Text>
    </View>
  )
}

export default function Government() {
  const [fontsLoaded] = useFonts({
    'BukhariScript': require('../../../../assets/fonts/BukhariScript.ttf'),
  });
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);
  const pageData = useContext(accessTokenContent);
  const [mainWidth, setMainWidth] = useState<number>(0)
  useEffect(() => {
    const fivePercent = pageData.dimensions.window.width * 0.05
    const remainder = pageData.dimensions.window.width * 0.8%(100 + fivePercent)
    setMainWidth((pageData.dimensions.window.width * 0.8) - remainder - fivePercent)
  }, [pageData.dimensions.window.width])
  if (!fontsLoaded) {
    return null
  }
  return (
    <View>
      <View style={{height: pageData.dimensions.window.height * 0.2, width: pageData.dimensions.window.width, alignContent: "center", justifyContent: "center", alignItems: "center"}}>
        <Text style={{fontFamily: "BukhariScript", fontSize: 100}}>Government</Text>
      </View>
      <View style={{height: pageData.dimensions.window.height * 0.75, width: pageData.dimensions.window.width, alignContent: "center", justifyContent: "center", alignItems: "center", marginTop: pageData.dimensions.window.height * 0.05}}>
        <View style={{height: pageData.dimensions.window.height * 0.75, width: mainWidth, flexDirection: "row", alignContent: "flex-start",  flexWrap: "wrap", rowGap: (pageData.dimensions.window.height) * 0.05, columnGap: (pageData.dimensions.window.width) * 0.05}}>
          <Link to="/profile/government/graph">
            <Block width={100} height={100} text='Graph' imageSource={require('../../../../assets/images/GraphAPILogo.png')} />
          </Link>
          <Link to="/profile/government/commissions">
            <Block width={100} height={100} text='Commissions'>
              <MedalIcon width={50} height={50} />
            </Block>
          </Link>
          <Link to="/profile/government/sports">
            <Block width={100} height={100} text='Sports' imageSource={require('../../../../assets/images/Football.png')} />
          </Link>
          <Link to="/profile/government/homepage">
            <Block width={100} height={100} text="Homepage" />
          </Link>
          <Link to="/profile/government/calendar">
            <Block width={100} height={100} text='Calendar'>
              <CalendarIcon width={50} height={50} />
            </Block>
          </Link>
          <Link to="/profile/government/classes">
            <Block width={100} height={100} text="Classes" />
          </Link>
          <Link to="/profile/government/admin">
            <Block width={100} height={100} text="Admin" />
          </Link>
        </View>
      </View>
    </View>
  )
}