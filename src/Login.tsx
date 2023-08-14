// import React, {useCallback, useEffect, useState} from 'react'
// import { useMsal } from "@azure/msal-react";
// import {View, Pressable, Text, Dimensions} from "react-native"
// import { useFonts } from 'expo-font';
// import * as SplashScreen from 'expo-splash-screen';

// const windowDimensions = Dimensions.get('window');
// const screenDimensions = Dimensions.get('screen');

// export default function Login() {
//     const { instance } = useMsal();
//     const [dimensions, setDimensions] = useState({
//         window: windowDimensions,
//         screen: screenDimensions,
//     });
    
//     useEffect(() => {
//         const subscription = Dimensions.addEventListener(
//         'change',
//         ({window, screen}) => {
//             setDimensions({window, screen});
//         },
//         );
//         return () => subscription?.remove();
//     });

//     useEffect(() => {
//         setDimensions({
//             window: Dimensions.get('window'),
//             screen: Dimensions.get('screen'),
//         });
//     }, [])

//     const [fontsLoaded] = useFonts({
//         'BukhariScript': require('../assets/fonts/BukhariScript.ttf'),
//       });
    
//       const onLayoutRootView = useCallback(async () => {
//         if (fontsLoaded) {
//           await SplashScreen.hideAsync();
//         }
//       }, [fontsLoaded]);

//     if (!fontsLoaded) {
//         return null;
//     }

//     return (
//         <View style={{backgroundColor: "#793033", alignContent: "center", alignItems: "center", justifyContent: "center", height: dimensions.window.height, width: dimensions.window.width}}>
//             <Text style={{fontFamily: "BukhariScript", fontSize: 150, textShadowColor: "white", textShadowRadius: 10}}>Pauly</Text>
//             <Pressable onPress={async () => {
//                 promptAsync().then((codeResponse) => {
//                     if (request && codeResponse?.type === 'success' && discovery) {
//                       exchangeCodeAsync(
//                         {
//                           clientId,
//                           code: codeResponse.params.code,
//                           extraParams: request.codeVerifier
//                             ? { code_verifier: request.codeVerifier }
//                             : undefined,
//                           redirectUri,
//                         },
//                         discovery,
//                       ).then((res) => {
//                         setToken(res.accessToken);
//                       });
//                     }
//                   });
//             }} style={{height: dimensions.window.height * 0.2, width: dimensions.window.width * 0.5, borderRadius: 25, backgroundColor: "white", alignContent: "center", alignItems: "center", justifyContent: "center", shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.8, shadowRadius: 10}}>
//                 <Text style={{textAlign: "center"}}>LOGIN</Text>
//             </Pressable>
//         </View>
//     )
// }
