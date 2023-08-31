import { View, Text, Pressable, Image } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useSelector } from 'react-redux';
import { RootState } from './Redux/store';

export default function Login({onGetAuthToken, width}:{onGetAuthToken: () => void, width: number}) {
  const {height} = useSelector((state: RootState) => state.dimentions)
  const [isBottonHover, setIsButtonHover] = useState<boolean>(false)
  const [fontSize, setFontSize] = useState<number>(0)
  useEffect(() => {
    const heightIsGreater: boolean = width < height
    const newWidth = heightIsGreater ? width:height
    if (heightIsGreater) {
      setFontSize(width/4)
    } else {
      setFontSize(height/3)
    }
    
  }, [height, width])
  // Font
  const [fontsLoaded] = useFonts({
    'BukhariScript': require('../assets/fonts/BukhariScript.ttf'),
    'Gochi Hand': require('../assets/fonts/GochiHand-Regular.ttf')
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
    <View style={{backgroundColor: "#793033", alignContent: "center", alignItems: "center", justifyContent: "center", height: height, width: width, overflow: "hidden"}}>
      <View id='Content_Area' style={{width: (width < height) ? width:height, height: (width < height) ? width:height, alignItems: "center", justifyContent: "center", alignContent: "center"}}>
        <View style={{width: fontSize * 1.65, height: fontSize, flexDirection: "row"}} id='Text_Container'>
          <Image source={require("../assets/images/PaulyLogo.png")} resizeMode='contain' style={{width: fontSize, height: fontSize, position: "absolute", left: -fontSize * 0.2}} />
          <Text style={{position: "absolute", left: fontSize * 0.5, top: (fontSize * 0.22),  fontFamily: "Gochi Hand", fontSize: fontSize - (fontSize/3), textShadowColor: 'rgba(0, 0, 0, 1)', textShadowOffset: {width: 4, height: 5}, textShadowRadius: 0, color: "white", pointerEvents: "none"}}>auly</Text>
        </View>
        <Pressable onPress={async () => {onGetAuthToken()}} onHoverIn={() => {setIsButtonHover(true)}} onHoverOut={() => {setIsButtonHover(false)}} style={{height: height * 0.09, width: width * 0.5, borderRadius: 50, backgroundColor: isBottonHover ? "#444444":"white", alignContent: "center", alignItems: "center", justifyContent: "center", shadowColor: isBottonHover ? "white":"black", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.8, shadowRadius: 10, marginTop: (width < height) ? width * 0.1:height * 0.1}}>
          <Text style={{textAlign: "center", color: isBottonHover ? "white":"black", fontWeight: "bold"}}>LOGIN</Text>
        </Pressable>
      </View>
    </View>
  )
}
