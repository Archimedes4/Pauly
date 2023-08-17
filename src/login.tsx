import { View, Text, Pressable, Image } from 'react-native'
import React, { useCallback, useState } from 'react'
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useSelector } from 'react-redux';
import { RootState } from './Redux/store';

export default function Login({onGetAuthToken, width}:{onGetAuthToken: () => void, width: number}) {
    const {height} = useSelector((state: RootState) => state.dimentions)
    const [isBottonHover, setIsButtonHover] = useState<boolean>(false)
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
      <View style={{height: (100 * width/230), width: (100 * width/360) * 2.2, flexDirection: "row"}} id='text outlinewr'>
        <Image source={require("../assets/images/PaulyLogo.png")} resizeMode='contain' style={{width: (100 * width/360), height: (100 * width/360)}} />
        <Text style={{position: "absolute", left: (100 * width/600), top: (30 * width/600),  fontFamily: "Gochi Hand", fontSize: (80 * width/360), textShadowColor: 'rgba(0, 0, 0, 1)', textShadowOffset: {width: 1, height: 1}, textShadowRadius: 10, color: "white", pointerEvents: "none"}}>auly</Text>
      </View>
      <Pressable onPress={async () => {onGetAuthToken()}} onHoverIn={() => {setIsButtonHover(true)}} onHoverOut={() => {setIsButtonHover(false)}} style={{height: height * 0.1, width: width * 0.5, borderRadius: 50, backgroundColor: isBottonHover ? "#444444":"white", alignContent: "center", alignItems: "center", justifyContent: "center", shadowColor: isBottonHover ? "white":"black", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.8, shadowRadius: 10}}>
        <Text style={{textAlign: "center", color: isBottonHover ? "white":"black"}}>LOGIN</Text>
      </Pressable>
    </View>
  )
}
