import React, { useContext, useEffect, useState } from 'react'
import {Link} from 'react-router-native'
//import {IoPersonCircleOutline} from "react-native-vector-icons/io5"
import {Image, StyleSheet, View, Dimensions, Pressable } from "react-native"
import { Path, Svg, G } from 'react-native-svg'
import callMsGraph from '../Functions/microsoftAssets'
import { accessTokenContent } from '../../App'

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
                <Image source={require("../assests/images/PaulyLogo.png")} resizeMode='contain' style={{width: length, height:  length}} />
            </Pressable>
            <Link to="/notifications" style={[styles.LinkStyle, {height: length, width: length, margin: 0}]}>
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
            </Link>
            <Link to="/messaging"  style={[styles.LinkStyle, {height: length, width: length, margin: 0}]}>
                {/* <Image source={require("../assests/images/MessagingIcon.png")} resizeMode='contain' style={{width: length, height:  length}} /> */}
                <MessagingIcon />
            </Link>
            <Link to="/quiz"  style={[styles.LinkStyle, {margin: 0}]}><Image source={require("../assests/images/QuizIcon.png")}  resizeMode='contain' style={{width: length, height:  length}} /></Link>
            <Link to="/calendar" style={[styles.LinkStyle, {margin: 0}]}>
                <Svg style={{width: iconLength, height: iconLength}} viewBox="0 0 24 24" fill="none">
                    <Path d="M7.75 2.5C7.75 2.08579 7.41421 1.75 7 1.75C6.58579 1.75 6.25 2.08579 6.25 2.5V4.07926C4.81067 4.19451 3.86577 4.47737 3.17157 5.17157C2.47737 5.86577 2.19451 6.81067 2.07926 8.25H21.9207C21.8055 6.81067 21.5226 5.86577 20.8284 5.17157C20.1342 4.47737 19.1893 4.19451 17.75 4.07926V2.5C17.75 2.08579 17.4142 1.75 17 1.75C16.5858 1.75 16.25 2.08579 16.25 2.5V4.0129C15.5847 4 14.839 4 14 4H10C9.16097 4 8.41527 4 7.75 4.0129V2.5Z" fill="#000000"/>
                    <Path fill-rule="evenodd" clip-rule="evenodd" d="M2 12C2 11.161 2 10.4153 2.0129 9.75H21.9871C22 10.4153 22 11.161 22 12V14C22 17.7712 22 19.6569 20.8284 20.8284C19.6569 22 17.7712 22 14 22H10C6.22876 22 4.34315 22 3.17157 20.8284C2 19.6569 2 17.7712 2 14V12ZM17 14C17.5523 14 18 13.5523 18 13C18 12.4477 17.5523 12 17 12C16.4477 12 16 12.4477 16 13C16 13.5523 16.4477 14 17 14ZM17 18C17.5523 18 18 17.5523 18 17C18 16.4477 17.5523 16 17 16C16.4477 16 16 16.4477 16 17C16 17.5523 16.4477 18 17 18ZM13 13C13 13.5523 12.5523 14 12 14C11.4477 14 11 13.5523 11 13C11 12.4477 11.4477 12 12 12C12.5523 12 13 12.4477 13 13ZM13 17C13 17.5523 12.5523 18 12 18C11.4477 18 11 17.5523 11 17C11 16.4477 11.4477 16 12 16C12.5523 16 13 16.4477 13 17ZM7 14C7.55228 14 8 13.5523 8 13C8 12.4477 7.55228 12 7 12C6.44772 12 6 12.4477 6 13C6 13.5523 6.44772 14 7 14ZM7 18C7.55228 18 8 17.5523 8 17C8 16.4477 7.55228 16 7 16C6.44772 16 6 16.4477 6 17C6 17.5523 6.44772 18 7 18Z" fill="#000000"/>
                </Svg>
            </Link>
            <Link to="/sports" style={[styles.LinkStyle, {height: length, width: length, margin: 0}]}>
                <Image source={require("../assests/images/Football.png")} resizeMode='contain' style={{width: length, height:  length}}/>
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

function MessagingIcon() {
    return (
        <Svg  viewBox="0 0 498.000000 268.000000"preserveAspectRatio="xMidYMid meet">
            <G transform="translate(0.000000,268.000000) scale(0.100000,-0.100000)" fill="#000000" stroke="none">
                <Path d="M1140 2481 c-50 -16 -89 -41 -128 -86 -74 -84 -72 -67 -72 -730 l0
                -591 -30 -45 c-16 -24 -54 -73 -84 -109 -64 -75 -116 -196 -116 -266 0 -104
                50 -147 187 -160 95 -9 158 8 246 66 115 76 187 148 232 234 l40 76 438 0 437
                0 0 -95 c0 -150 47 -241 154 -298 41 -22 45 -22 791 -27 l750 -5 100 -69 c55
                -37 108 -75 117 -83 25 -22 144 -53 205 -53 47 0 58 4 92 36 44 39 66 91 57
                130 -8 29 -67 124 -89 143 -9 7 -30 35 -48 63 l-32 50 2 466 c2 537 2 540 -76
                623 -82 87 -92 89 -533 89 l-380 0 0 210 c0 250 -9 289 -89 363 -87 81 -23 77
                -1150 76 -548 0 -1007 -4 -1021 -8z m2051 -164 c18 -12 39 -34 46 -47 18 -36
                18 -1144 0 -1180 -7 -13 -28 -35 -46 -47 l-34 -23 -857 0 -857 0 -63 -32 c-34
                -18 -70 -44 -78 -58 -59 -96 -89 -134 -150 -191 -73 -70 -158 -119 -204 -119
                -40 0 -94 25 -107 48 -17 31 -13 81 8 116 11 17 55 63 98 102 55 50 87 89 108
                130 l30 59 5 596 c5 651 2 612 65 651 29 17 77 18 1016 18 l986 0 34 -23z
                m986 -647 c64 -38 63 -33 63 -527 0 -518 -11 -463 118 -598 63 -65 72 -80 72
                -112 0 -50 -32 -83 -79 -83 -45 0 -104 38 -161 105 -59 69 -104 102 -164 122
                -46 16 -125 18 -782 23 -714 5 -732 5 -754 25 -39 36 -50 69 -50 160 l0 86 62
                -3 61 -3 1 -55 1 -55 738 -3 737 -2 0 75 0 75 -390 0 -389 0 49 46 c85 80 90
                103 90 449 l0 295 373 0 c351 0 374 -1 404 -20z"/>
                <Path d="M1470 1945 l0 -75 715 0 715 0 0 75 0 75 -715 0 -715 0 0 -75z"/>
                <Path d="M1460 1605 l0 -75 430 0 430 0 0 75 0 75 -430 0 -430 0 0 -75z"/>
                <Path d="M2580 1605 l0 -75 160 0 160 0 0 75 0 75 -160 0 -160 0 0 -75z"/>
                <Path d="M1720 1285 l0 -75 650 0 650 0 0 75 0 75 -650 0 -650 0 0 -75z"/>
                <Path d="M3460 1495 l0 -75 290 0 290 0 0 75 0 75 -290 0 -290 0 0 -75z"/>
                <Path d="M3510 1155 l0 -75 155 0 155 0 0 75 0 75 -155 0 -155 0 0 -75z"/>
                <Path d="M3900 1155 l0 -75 65 0 65 0 0 75 0 75 -65 0 -65 0 0 -75z"/>
            </G>
        </Svg>
    )
}