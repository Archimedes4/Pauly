import React, { useContext, useEffect, useState } from 'react'
import {Link} from 'react-router-native'
//import {IoPersonCircleOutline} from "react-native-vector-icons/io5"
import {Image, StyleSheet, View, Dimensions, Pressable, Text } from "react-native"
import { Path, Svg, G } from 'react-native-svg'
import callMsGraph from '../Functions/microsoftAssets'
import { accessTokenContent } from '../../App'
import {BookIcon, CalendarIcon, MedalIcon} from './Icons/Icons'

export default function NavBarComponent({width, height, expandedMode, onSetExpandedMode}:{width: number, height: number, expandedMode: boolean, onSetExpandedMode: (item: boolean) => void}) {
    const microsoftAccessToken = useContext(accessTokenContent);
    const [length, setLength] = useState<number>(0)
    const [iconLength, setIconLength] = useState<number>(0)
    useEffect(() => {
        if ((width * 0.6) > ((height * 0.6)/8)){ //checking to see if the width or the height is going to 
            setLength((height * 0.6)/8)
        } else {
            setLength(width * 0.6)
        }
        if ((width * 0.7) > ((height * 0.7)/8)){
            setIconLength((height * 0.6)/8)
        } else {
            setIconLength(width * 0.5)
        }
    }, [width, height])
    useEffect(() => {console.log("Icon Length Changed", iconLength)}, [iconLength])
    useEffect(() => {console.log("Length Changed", length)}, [length])
    
  return (
    <View style={{backgroundColor: "#793033", height: height, overflow: "hidden", width: (expandedMode) ? (width * 2.5):width, flexDirection: "row"}}>
        <View style={{height: height, overflow: "hidden", width: width, alignItems: "center"}}>
            <Pressable style={[styles.LinkStyle, {height: length, width: length, margin: 0, marginTop: length * 0.4, marginBottom: length * 0.4}]} onPress={() => {onSetExpandedMode(!expandedMode)}}>
                <Image source={require("../../assets/images/PaulyLogo.png")} resizeMode='contain' style={{width: length, height:  length}} />
            </Pressable>
            <Link to="/notifications" style={[styles.LinkStyle, {height: length, width: length, margin: 0}]}>
                <View>
                    <View style={[{height: iconLength, width: iconLength}]}>
                        {/* <Image height={height/8} style={{height: height/8, width: width, position: "absolute", zIndex: 100, backgroundColor: "red", tintColor: "black"}} source={require("./assests/images/Books.png")}/> */}
                        <Svg style={{width: iconLength, height: iconLength}} viewBox="0 0 460.298 460.297">
                            <Path d="M230.149,120.939L65.986,256.274c0,0.191-0.048,0.472-0.144,0.855c-0.094,0.38-0.144,0.656-0.144,0.852v137.041
                            c0,4.948,1.809,9.236,5.426,12.847c3.616,3.613,7.898,5.431,12.847,5.431h109.63V303.664h73.097v109.64h109.629
                            c4.948,0,9.236-1.814,12.847-5.435c3.617-3.607,5.432-7.898,5.432-12.847V257.981c0-0.76-0.104-1.334-0.288-1.707L230.149,120.939
                            z"/>
                            <Path d="M457.122,225.438L394.6,173.476V56.989c0-2.663-0.856-4.853-2.574-6.567c-1.704-1.712-3.894-2.568-6.563-2.568h-54.816
                            c-2.666,0-4.855,0.856-6.57,2.568c-1.711,1.714-2.566,3.905-2.566,6.567v55.673l-69.662-58.245
                            c-6.084-4.949-13.318-7.423-21.694-7.423c-8.375,0-15.608,2.474-21.698,7.423L3.172,225.438c-1.903,1.52-2.946,3.566-3.14,6.136
                            c-0.193,2.568,0.472,4.811,1.997,6.713l17.701,21.128c1.525,1.712,3.521,2.759,5.996,3.142c2.285,0.192,4.57-0.476,6.855-1.998
                            L230.149,95.817l197.57,164.741c1.526,1.328,3.521,1.991,5.996,1.991h0.858c2.471-0.376,4.463-1.43,5.996-3.138l17.703-21.125
                            c1.522-1.906,2.189-4.145,1.991-6.716C460.068,229.007,459.021,226.961,457.122,225.438z"/>
                        </Svg>
                    </View>
                    { expandedMode ? 
                        <Text>Notifications</Text>:null
                    }
                </View>
            </Link>
            <Link to="/resources"  style={[styles.LinkStyle, {height: length, width: length, margin: 0}]}>
                {/* <Image source={require("../assests/images/MessagingIcon.png")} resizeMode='contain' style={{width: length, height:  length}} /> */}
                <BookIcon width={iconLength} height={iconLength}/>
            </Link>
            <Link to="/commissions"  style={[styles.LinkStyle, {margin: 0}]}>
                <MedalIcon width={iconLength} height={iconLength}/>
            </Link>
            <Link to="/calendar" style={[styles.LinkStyle, {margin: 0}]}>
                <CalendarIcon width={iconLength} height={iconLength}/>
            </Link>
            <Link to="/sports" style={[styles.LinkStyle, {height: length, width: length, margin: 0}]}>
                <Image source={require("../../assets/images/Football.png")} resizeMode='contain' style={{width: length, height:  length}}/>
            </Link>
            <Link to="/profile/government"  style={[styles.LinkStyle, {height: length, width: length, margin: 0}]}>
                <Svg style={{width: length, height: length}} viewBox="0 0 24 24" fill="black">
                    <Path fill-rule="evenodd" clip-rule="evenodd" d="M11.5528 1.10557C11.8343 0.964809 12.1657 0.964809 12.4472 1.10557L22.4472 6.10557C22.862 6.31298 23.0798 6.77838 22.9732 7.22975C22.8667 7.68112 22.4638 8 22 8H1.99998C1.5362 8 1.13328 7.68112 1.02673 7.22975C0.920172 6.77838 1.13795 6.31298 1.55276 6.10557L11.5528 1.10557ZM6.23604 6H17.7639L12 3.11803L6.23604 6ZM5.99998 9C6.55226 9 6.99998 9.44772 6.99998 10V15C6.99998 15.5523 6.55226 16 5.99998 16C5.44769 16 4.99998 15.5523 4.99998 15V10C4.99998 9.44772 5.44769 9 5.99998 9ZM9.99998 9C10.5523 9 11 9.44772 11 10V15C11 15.5523 10.5523 16 9.99998 16C9.44769 16 8.99998 15.5523 8.99998 15V10C8.99998 9.44772 9.44769 9 9.99998 9ZM14 9C14.5523 9 15 9.44772 15 10V15C15 15.5523 14.5523 16 14 16C13.4477 16 13 15.5523 13 15V10C13 9.44772 13.4477 9 14 9ZM18 9C18.5523 9 19 9.44772 19 10V15C19 15.5523 18.5523 16 18 16C17.4477 16 17 15.5523 17 15V10C17 9.44772 17.4477 9 18 9ZM2.99998 18C2.99998 17.4477 3.44769 17 3.99998 17H20C20.5523 17 21 17.4477 21 18C21 18.5523 20.5523 19 20 19H3.99998C3.44769 19 2.99998 18.5523 2.99998 18ZM0.999976 21C0.999976 20.4477 1.44769 20 1.99998 20H22C22.5523 20 23 20.4477 23 21C23 21.5523 22.5523 22 22 22H1.99998C1.44769 22 0.999976 21.5523 0.999976 21Z" fill="#000000"/>
                </Svg>
            </Link>
            <Link to="/profile"  style={[styles.LinkStyle, {height: length, width: length, overflow: "hidden", margin: 0, position: "absolute", bottom: height * 0.05}]}>
                <View style={{width: iconLength, height: iconLength}}>
                    { (microsoftAccessToken.uri !== "") ?
                        <Image source={{uri: microsoftAccessToken.uri}} style={{width: iconLength, height: iconLength, borderRadius: iconLength/2}}/>:
                        <Svg fill="#000000" height={iconLength} style={{width: iconLength, height: iconLength}} viewBox="0 0 512 512">
                            <Path d="M258.9,48C141.92,46.42,46.42,141.92,48,258.9,49.56,371.09,140.91,462.44,253.1,464c117,1.6,212.48-93.9,210.88-210.88C462.44,140.91,371.09,49.56,258.9,48ZM385.32,375.25a4,4,0,0,1-6.14-.32,124.27,124.27,0,0,0-32.35-29.59C321.37,329,289.11,320,256,320s-65.37,9-90.83,25.34a124.24,124.24,0,0,0-32.35,29.58,4,4,0,0,1-6.14.32A175.32,175.32,0,0,1,80,259C78.37,161.69,158.22,80.24,255.57,80S432,158.81,432,256A175.32,175.32,0,0,1,385.32,375.25Z"/>
                            <Path d="M256,144c-19.72,0-37.55,7.39-50.22,20.82s-19,32-17.57,51.93C191.11,256,221.52,288,256,288s64.83-32,67.79-71.24c1.48-19.74-4.8-38.14-17.68-51.82C293.39,151.44,275.59,144,256,144Z"/>
                        </Svg>
                    }        
                </View>
            </Link>
        </View>
        { expandedMode ?
            <View style={{width: width * 1.5, backgroundColor: "#793033", height: height}}>
                
            </View>:null
        }
    </View>
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
