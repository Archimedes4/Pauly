import { View, Text, Dimensions, Image, ImageSourcePropType } from 'react-native'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-native'
import NavBarComponent from '../../../UI/NavComponent'
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { accessTokenContent } from '../../../../App';

function Block({height, width, text, imageSource}:{height: number, width: number, text: string, imageSource?: ImageSourcePropType}) {
  return (
    <View style={{height: height, width: width, alignContent: "center", alignItems: "center", justifyContent: "center"}}>
      { (imageSource !== undefined) && <Image source={imageSource} style={{width: width * 0.5, height: height * 0.5}}/>}
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
  if (!fontsLoaded) {
    return null
  }
  return (
    <View>
      <View style={{height: pageData.dimensions.window.height * 0.2, width: pageData.dimensions.window.width, alignContent: "center", justifyContent: "center", alignItems: "center", backgroundColor: "#444444"}}>
        <Text style={{fontFamily: "BukhariScript", fontSize: 100}}>Government</Text>
      </View>
      <Link to="/profile/government/graph">
        <Text>Microsoft Graph</Text>
      </Link>
      <Link to="/profile/government/commissions">
        <Text>Commissions</Text>
      </Link>
      <Link to="/profile/government/sports">
        <Block width={100} height={100} text='Sports' imageSource={require('../../../../assets/images/Football.png')} />
      </Link>
      <Link to="/profile/government/president">
        <Text>President</Text>
      </Link>
      <Link to="/profile/government/calendar">
        <Text>Calendar</Text>
      </Link>
      <Link to="/profile/government/classes">
        <Text>Classes</Text>
      </Link>
    </View>
  )
}