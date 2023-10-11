import React, { ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import {Link, useNavigate} from 'react-router-native'
//import {IoPersonCircleOutline} from "react-native-vector-icons/io5"
import {Image, StyleSheet, View, Dimensions, Pressable, Text } from "react-native"
import { Path, Svg, G } from 'react-native-svg'
import {BookIcon, CalendarIcon, GovernmentIcon, HomeIcon, MedalIcon, PersonIcon} from './Icons/Icons'
import store, { RootState } from '../Redux/store'
import { useDispatch, useSelector } from 'react-redux'
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { expandedModeSlice } from '../Redux/reducers/expandedModeReducer'
import { isShowingProfileBlockSlice } from '../Redux/reducers/isShowingProfileBlockReducer'

function NavBarBlock({des, expandedMode, blockLength, children, text, width, setIsExpandedMode}:{des: string, expandedMode: boolean, blockLength: number, iconLength: number, text: string, children: ReactNode, width: number, setIsExpandedMode: () => void}) {
  const [isHover, setIsHover] = useState<boolean>(false)
  const navigation = useNavigate()
  return (
    <Pressable style={{height: blockLength, width: (expandedMode) ? (width * 2.5):width, backgroundColor: isHover ? '#444444':'transparent', alignItems: "center"}} onPress={() => {navigation(des)}} onHoverIn={() => {setIsHover(true); setIsExpandedMode()}} onHoverOut={() => {setIsHover(false)}}>
      <View style={[styles.LinkStyle, {height: blockLength, width: (expandedMode) ? blockLength * 2.5:blockLength, margin: 0, position: expandedMode ? "absolute":"relative", left: expandedMode ? (width - blockLength)/2:undefined, alignItems: "center"}]}>
        <View id='ViewHigh' style={{width: (expandedMode) ? blockLength * 2.5:blockLength, flexDirection: "row", margin: "auto", padding: 0, alignItems: "center", alignContent: "center", justifyContent: "center"}}>
          <View style={[{height: blockLength, width: blockLength, position: expandedMode ? "absolute":"relative", left: expandedMode ? 0:undefined, alignItems: "center", justifyContent: "center"}]}>
            <React.Fragment>
              {children}
            </React.Fragment>
          </View>
          { expandedMode ? 
            <Text style={{position: "absolute", left: blockLength, color: "white", marginLeft: 8}}>{text}</Text>:null
          }
        </View>
      </View>
    </Pressable>
  )
}

export default function NavBarComponent({width, height}:{width: number, height: number}) {
  const {uri, displayName} = useSelector((state: RootState) => state.microsoftProfileData)
  const expandedMode = useSelector((state: RootState) => state.expandedMode)
  const [blockLength, setBlockLength] = useState<number>(0)
  const [iconLength, setIconLength] = useState<number>(0)
  const navigation = useNavigate()
  const dispatch = useDispatch()
  const isGovernmentMode = useSelector((state: RootState) => state.isGovernmentMode)

  useEffect(() => {
    //checking to see if the width or the height is going to be the limiting factor.
    if ((width * 0.6) > ((height * 0.6)/8)){ 
      setBlockLength((height * 0.6)/8)
    } else {
      setBlockLength(width * 0.6)
    }
    if ((width * 0.7) > ((height * 0.7)/8)){
      setIconLength((height * 0.6)/8)
    } else {
      setIconLength(width * 0.5)
    }
  }, [width, height])

  const [fontsLoaded] = useFonts({
    'Gochi Hand': require('../../assets/fonts/GochiHand-Regular.ttf')
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
    <Pressable id={"Pressable"} onHoverIn={() => {dispatch(expandedModeSlice.actions.setExpandedMode(true))}} onHoverOut={() => {dispatch(expandedModeSlice.actions.setExpandedMode(false))}}>
      <View id="Main" style={{backgroundColor: "#793033", height: height, overflow: "hidden", width: (expandedMode) ? (width * 2.5):width, alignItems: "center"}}>
        <Pressable style={[styles.LinkStyle, {height: blockLength, width: (expandedMode) ? (width * 2.5):width, margin: 0, marginTop: blockLength * 0.4, marginBottom: blockLength * 0.4}]} onPress={() => {dispatch(expandedModeSlice.actions.setExpandedMode(!expandedMode))}} onHoverIn={() => {dispatch(expandedModeSlice.actions.setExpandedMode(true))}}>
          <View style={{flexDirection: "row", width: expandedMode ? blockLength * 2.5:blockLength, height: blockLength, position: expandedMode ? "absolute":"relative", left: expandedMode ? (width - blockLength)/2:undefined}} pointerEvents={'none'}>
            <View style={{position: expandedMode ? "absolute":"relative", left: expandedMode ? 0:undefined}}>
              <Image source={require("../../assets/images/PaulyLogo.png")} resizeMode='contain' style={{width: blockLength, height:  blockLength}} />
            </View>
            { expandedMode ?
              <Text style={{fontFamily: "Gochi Hand", color: "white", position: "absolute", top: blockLength * 0.3, left: blockLength * 0.65, fontSize: blockLength * 0.7, textShadowColor: 'rgba(0, 0, 0, 1)', textShadowOffset: {width: 4, height: 2}, textShadowRadius: 0}} selectable={false}>auly</Text>:null
            }
          </View>
        </Pressable>
        <NavBarBlock des='/notifications' expandedMode={expandedMode} blockLength={blockLength} iconLength={iconLength} text={'Notifications'} width={width} setIsExpandedMode={() => {dispatch(expandedModeSlice.actions.setExpandedMode(true))}}>
          <HomeIcon width={iconLength} height={iconLength}/>
        </NavBarBlock>
        <NavBarBlock des='/resources' expandedMode={expandedMode} blockLength={blockLength} iconLength={iconLength} text={'Resources'} width={width} setIsExpandedMode={() => {dispatch(expandedModeSlice.actions.setExpandedMode(true))}}>
          <BookIcon width={iconLength} height={iconLength}/>
        </NavBarBlock>
        <NavBarBlock des='/commissions' expandedMode={expandedMode} blockLength={blockLength} iconLength={iconLength} text={'Commissions'} width={width} setIsExpandedMode={() => {dispatch(expandedModeSlice.actions.setExpandedMode(true))}}>
          <MedalIcon width={iconLength} height={iconLength}/>
        </NavBarBlock>
        <NavBarBlock des='/calendar' expandedMode={expandedMode} blockLength={blockLength} iconLength={iconLength} text={'Calendar'} width={width} setIsExpandedMode={() => {dispatch(expandedModeSlice.actions.setExpandedMode(true))}}>
          <CalendarIcon width={iconLength} height={iconLength}/>
        </NavBarBlock>
        <NavBarBlock des='/sports' expandedMode={expandedMode} blockLength={blockLength} iconLength={iconLength} text={'Sports'} width={width} setIsExpandedMode={() => {dispatch(expandedModeSlice.actions.setExpandedMode(true))}}>
          <Image source={require("../../assets/images/Football.png")} resizeMode='contain' style={{width: iconLength, height: iconLength}}/>
        </NavBarBlock>
        { isGovernmentMode ?
          <NavBarBlock des='/profile/government' expandedMode={expandedMode} blockLength={blockLength} iconLength={iconLength} text={'Government'} width={width} setIsExpandedMode={() => {dispatch(expandedModeSlice.actions.setExpandedMode(true))}}>
            <GovernmentIcon width={iconLength} height={iconLength} />
          </NavBarBlock>:null
        }
        <Pressable onHoverIn={() => {dispatch(expandedModeSlice.actions.setExpandedMode(true))}} onPress={() => {dispatch(isShowingProfileBlockSlice.actions.setIsShowingProfileBlock(!store.getState().isShowingProfileBlock))}}  style={[styles.LinkStyle, {height: blockLength, width: (expandedMode) ? blockLength * 2.5:blockLength, margin: 0, position: "absolute", left: expandedMode ? (width - blockLength)/2:undefined, bottom: height * 0.05}]}>
          <View style={{width: (expandedMode) ? blockLength * 2.5:blockLength, height: iconLength, position: expandedMode ? "absolute":"relative", left: expandedMode ? 0:undefined, flexDirection: "row"}}>
            { (uri !== "") ?
              <Image source={{uri: uri}} style={{width: iconLength, height: iconLength, borderRadius: iconLength/2}}/>:
              <PersonIcon width={iconLength} height={iconLength}/>
            }
            <View style={{height: iconLength, alignContent: "center", alignItems: "center", justifyContent: "center", marginLeft: blockLength - iconLength}}>
              { expandedMode ?
                <Text adjustsFontSizeToFit={true} numberOfLines={1} style={{color: "white", marginLeft: 8, width: blockLength * 2.5}} selectable={false}>{displayName}</Text>:null
              }  
            </View>   
          </View>
        </Pressable>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  LinkStyle:{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "auto"
  }
})
