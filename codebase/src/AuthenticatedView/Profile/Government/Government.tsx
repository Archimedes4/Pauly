import { View, Text, Dimensions, Image, ImageSourcePropType } from 'react-native'
import React, { ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-native'
import NavBarComponent from '../../../UI/NavComponent'
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { accessTokenContent } from '../../../../App';
import { CalendarIcon, MedalIcon } from '../../../UI/Icons/Icons';

function Block({height, width, text, imageSource, children}:{height: number, width: number, text: string, imageSource?: ImageSourcePropType, children?: ReactNode}) {
  return (
    <View style={{height: height, width: width, alignContent: "center", alignItems: "center", justifyContent: "center", backgroundColor: "#444444", borderRadius: 5}}>
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
  if (!fontsLoaded) {
    return null
  }
  return (
    <View>
      <View style={{height: pageData.dimensions.window.height * 0.2, width: pageData.dimensions.window.width, alignContent: "center", justifyContent: "center", alignItems: "center"}}>
        <Text style={{fontFamily: "BukhariScript", fontSize: 100}}>Government</Text>
      </View>
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
      <Link to="/profile/government/president">
        <Block width={100} height={100} text="President" />
        <Text>President</Text>
      </Link>
      <Link to="/profile/government/calendar">
        <Block width={100} height={100} text='Calendar'>
          <CalendarIcon width={50} height={50} />
        </Block>
      </Link>
      <Link to="/profile/government/classes">
        <Text>Classes</Text>
      </Link>
    </View>
  )
}