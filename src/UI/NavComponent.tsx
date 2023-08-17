import React, { ReactNode, useContext, useEffect, useState } from 'react'
import {Link} from 'react-router-native'
//import {IoPersonCircleOutline} from "react-native-vector-icons/io5"
import {Image, StyleSheet, View, Dimensions, Pressable, Text } from "react-native"
import { Path, Svg, G } from 'react-native-svg'
import {BookIcon, CalendarIcon, GovernmentIcon, HomeIcon, MedalIcon} from './Icons/Icons'
import { RootState } from '../Redux/store'
import { useSelector } from 'react-redux'

function NavBarBlock({des, expandedMode, iconLength, blockLength, children, text, width}:{des: string, expandedMode: boolean, blockLength: number, iconLength: number, text: string, children: ReactNode, width: number}) {
    return (
        <Link to={des} style={[styles.LinkStyle, {height: blockLength, width: (expandedMode) ? blockLength * 2.5:blockLength, margin: 0}]}>
            <View id='ViewHigh' style={{width: (expandedMode) ? blockLength * 2.5:blockLength, flexDirection: "row", margin: "auto", padding: 0, alignItems: "center", alignContent: "center", justifyContent: "center"}}>
                <View style={[{height: blockLength, width: blockLength, position: expandedMode ? "absolute":"relative", left: expandedMode ? 0:undefined}]}>
                    <React.Fragment>
                        {children}
                    </React.Fragment>
                </View>
                { expandedMode ? 
                    <Text style={{position: "absolute", left: blockLength, color: "white"}}>{text}</Text>:null
                }
            </View>
        </Link>
    )
}

export default function NavBarComponent({width, height, expandedMode, onSetExpandedMode}:{width: number, height: number, expandedMode: boolean, onSetExpandedMode: (item: boolean) => void}) {
    const {uri, displayName} = useSelector((state: RootState) => state.microsoftProfileData)
    const [blockLength, setBlockLength] = useState<number>(0)
    const [iconLength, setIconLength] = useState<number>(0)
    useEffect(() => {
        console.log("Changed")
        if ((width * 0.6) > ((height * 0.6)/8)){ //checking to see if the width or the height is going to 
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
    
  return (
    <Pressable onHoverIn={() => {onSetExpandedMode(true)}} onHoverOut={() => {onSetExpandedMode(false)}}>
        <View style={{backgroundColor: "#793033", height: height, overflow: "hidden", width: (expandedMode) ? (width * 2.5):width, alignItems: "center"}}>
            <View style={{height: height, overflow: "hidden", width: (expandedMode) ? blockLength * 2.5:blockLength, alignItems: "center", position: expandedMode ? "absolute":"relative", left: expandedMode ? (width - blockLength)/2:undefined}}>
                <Pressable style={[styles.LinkStyle, {height: blockLength, width: expandedMode ? blockLength * 2.5:blockLength, margin: 0, marginTop: blockLength * 0.4, marginBottom: blockLength * 0.4}]} onPress={() => {onSetExpandedMode(!expandedMode)}}>
                    <View style={{position: expandedMode ? "absolute":"relative", left: expandedMode ? 0:undefined}}>
                        <Image source={require("../../assets/images/PaulyLogo.png")} resizeMode='contain' style={{width: blockLength, height:  blockLength,}} />
                    </View>
                    { expandedMode ?
                        <Text>auly</Text>:null
                    }
                </Pressable>
                <NavBarBlock des='/notifications' expandedMode={expandedMode} blockLength={blockLength} iconLength={iconLength} text={'Notifications'} width={width}>
                    <HomeIcon width={iconLength} height={iconLength}/>
                </NavBarBlock>
                <NavBarBlock des='/resources' expandedMode={expandedMode} blockLength={blockLength} iconLength={iconLength} text={'Resources'} width={width}>
                    <BookIcon width={iconLength} height={iconLength}/>
                </NavBarBlock>
                <NavBarBlock des='/commissions' expandedMode={expandedMode} blockLength={blockLength} iconLength={iconLength} text={'Commissions'} width={width}>
                    <MedalIcon width={iconLength} height={iconLength}/>
                </NavBarBlock>
                <NavBarBlock des='/calendar' expandedMode={expandedMode} blockLength={blockLength} iconLength={iconLength} text={'Calendar'} width={width}>
                    <CalendarIcon width={iconLength} height={iconLength}/>
                </NavBarBlock>
                <NavBarBlock des='/sports' expandedMode={expandedMode} blockLength={blockLength} iconLength={iconLength} text={'Sports'} width={width}>
                    <Image source={require("../../assets/images/Football.png")} resizeMode='contain' style={{width: iconLength, height: iconLength}}/>
                </NavBarBlock>
                <NavBarBlock des='/profile/government' expandedMode={expandedMode} blockLength={blockLength} iconLength={iconLength} text={'Government'} width={width}>
                    <GovernmentIcon width={iconLength} height={iconLength} />
                </NavBarBlock>
                <Link to="/profile"  style={[styles.LinkStyle, {height: blockLength, width: (expandedMode) ? blockLength * 2.5:blockLength, overflow: "hidden", margin: 0, position: "absolute", bottom: height * 0.05}]}>
                    <View style={{width: (expandedMode) ? blockLength * 2.5:blockLength, height: iconLength, position: expandedMode ? "absolute":"relative", left: expandedMode ? 0:undefined, flexDirection: "row"}}>
                        { (uri !== "") ?
                            <Image source={{uri: uri}} style={{width: iconLength, height: iconLength, borderRadius: iconLength/2}}/>:
                            <Svg fill="#000000" height={iconLength} style={{width: iconLength, height: iconLength}} viewBox="0 0 512 512">
                                <Path d="M258.9,48C141.92,46.42,46.42,141.92,48,258.9,49.56,371.09,140.91,462.44,253.1,464c117,1.6,212.48-93.9,210.88-210.88C462.44,140.91,371.09,49.56,258.9,48ZM385.32,375.25a4,4,0,0,1-6.14-.32,124.27,124.27,0,0,0-32.35-29.59C321.37,329,289.11,320,256,320s-65.37,9-90.83,25.34a124.24,124.24,0,0,0-32.35,29.58,4,4,0,0,1-6.14.32A175.32,175.32,0,0,1,80,259C78.37,161.69,158.22,80.24,255.57,80S432,158.81,432,256A175.32,175.32,0,0,1,385.32,375.25Z"/>
                                <Path d="M256,144c-19.72,0-37.55,7.39-50.22,20.82s-19,32-17.57,51.93C191.11,256,221.52,288,256,288s64.83-32,67.79-71.24c1.48-19.74-4.8-38.14-17.68-51.82C293.39,151.44,275.59,144,256,144Z"/>
                            </Svg>
                        }
                        { expandedMode ?
                            <Text>{displayName}</Text>:null
                        }     
                    </View>
                </Link>
            </View>
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
