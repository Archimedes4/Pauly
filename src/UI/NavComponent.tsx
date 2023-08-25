import React, { ReactNode, useContext, useEffect, useState } from 'react'
import {Link} from 'react-router-native'
//import {IoPersonCircleOutline} from "react-native-vector-icons/io5"
import {Image, StyleSheet, View, Dimensions, Pressable, Text } from "react-native"
import { Path, Svg, G } from 'react-native-svg'
import {BookIcon, CalendarIcon, GovernmentIcon, HomeIcon, MedalIcon, PersonIcon} from './Icons/Icons'
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
                            <PersonIcon width={iconLength} height={iconLength}/>
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
