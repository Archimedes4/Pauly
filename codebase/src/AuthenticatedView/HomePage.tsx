import { useEffect, useState, useContext } from 'react';
import { Dimensions, View, Text, Image, Pressable } from 'react-native';
import MonthView from './MonthView';
import { Link, Navigate, useNavigate } from 'react-router-native';
import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from '@azure/msal-react';
import { loginRequest } from '../authConfig';
import callMsGraph from '../Functions/microsoftAssets';
import { accessTokenContent } from '../../App';
import ScrollingTextAnimation from '../UI/ScrollingTextAnimation';

const windowDimensions = Dimensions.get('window');
const screenDimensions = Dimensions.get('screen');

declare global {
    type DateProperty = {
        Date: number
        ColorName?: string
        SchoolDay?: string
        Value?: number
    }
}

export default function HomePage() {
    const { instance, accounts } = useMsal();
    const navigate = useNavigate()
    const [messageText, setMessageText] = useState("")
    const [animationSpeed, setAnnimationSpeed] = useState(0)
    const microsoftAccessToken = useContext(accessTokenContent);
    const [dimensions, setDimensions] = useState({
        window: windowDimensions,
        screen: screenDimensions,
    });

    useEffect(() => {
        const subscription = Dimensions.addEventListener(
          'change',
          ({window, screen}) => {
            setDimensions({window, screen});
          },
        );
        return () => subscription?.remove();
    });

    async function getCurrentTextAndAnimationSpeed() {
        const result = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/sites/8td1tk.sharepoint.com,b2ef509e-4511-48c3-b607-a8c2cddc0e35,091feb8c-a978-4e3f-a60f-ecdc319b2304/lists/eb90cf62-9f67-4d08-b0ce-78846ae4fb52/items/1/fields")//TO DO fix list ids
        if (result.ok){
            const data: Record<string, any> = await result.json()
            console.log(data)
            if (data.hasOwnProperty("AnimationSpeed") && data.hasOwnProperty("Message")) {
                setAnnimationSpeed(data["AnimationSpeed"])
                setMessageText(data["Message"])
            } else {
                //TO DO handle error
            }
        } else {

        }
    }

    useEffect(() => {
        if (microsoftAccessToken.accessToken !== ""){
            getUser()
            getCurrentTextAndAnimationSpeed()
        }
    }, [microsoftAccessToken])

    async function getUser(){
        const result = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/me/")
        console.log(result)
    }
    useEffect(() => {
        if (dimensions.window.width > 576){
            navigate("/notifications")
        }
    }, [dimensions.window])
  return (
    <View style={{backgroundColor: "#793033", overflow: "hidden"}}>
        {/* <Link to="/notifications">
        </Link> */}
        <View style={{width: dimensions.window.width * 1.0, height: dimensions.window.height * 0.08}}>
            { (messageText !== "") ?
                <ScrollingTextAnimation width={dimensions.window.width * 1.0} height={dimensions.window.height * 0.08}>
                    <View>
                        <Text numberOfLines={1} style={{fontSize: dimensions.window.height * 0.07, height: dimensions.window.height * 0.07}}>{messageText}</Text>
                    </View>
                </ScrollingTextAnimation>:null
            }
        </View>
        <Pressable style={{width: dimensions.window.width * 0.999, height: dimensions.window.height * 0.42}} onPress={() => {//TO DO Naviate to Calendar
        }}>
            <View>
                <Text style={{margin: "auto", width: dimensions.window.width * 1.0, height: dimensions.window.height * 0.05}}>Calendar</Text>
                <MonthView width={dimensions.window.width * 1.0} height={dimensions.window.height * 0.37}/>
            </View>
        </Pressable>
        <View style={{flexDirection: 'row', width: dimensions.window.width * 1.0, height: dimensions.window.height * 0.25}}>
            <Link to={'/quiz'}>
                <View style={{borderColor: "black", borderWidth: 2}}>
                    <View style={{backgroundColor: "#793033", width: dimensions.window.width * 0.5, height: dimensions.window.height * 0.25, borderTopWidth: 1, borderTopColor: "black"}} />
                    <Image source={require("../../assets/images/QuizIcon.png")} resizeMode='contain' width={dimensions.window.width * 0.5} height={dimensions.window.height * 0.25} style={{zIndex: 2, height: dimensions.window.height * 0.25, width: dimensions.window.width * 0.5, position: "absolute", aspectRatio: "1/1"}} />
                </View>
            </Link>
            <Link to={'/sports'}>
                <View style={{borderColor: "black", borderWidth: 2}}>
                    <View style={{backgroundColor: "#793033", width: dimensions.window.width * 0.5, height: dimensions.window.height * 0.25, borderTopWidth: 1, borderTopColor: "black", zIndex: 1}} />
                    <Image source={require("../../assets/images/Football.png")} resizeMode='contain' width={dimensions.window.width * 0.3} height={dimensions.window.height * 0.25} style={{zIndex: 2, height: dimensions.window.height * 0.25, width: dimensions.window.width * 0.5, position: "absolute", aspectRatio: "1/1"}} />
                </View>
            </Link>
        </View>
        <View style={{flexDirection: 'row', width: dimensions.window.width * 1.0, height: dimensions.window.height * 0.25}}>
            <Link to={'/messaging'}>
                <View style={{borderColor: "black", borderWidth: 2}}>
                    <View style={{backgroundColor: "#793033", width: dimensions.window.width * 0.5, height: dimensions.window.height * 0.25, borderTopWidth: 1, borderTopColor: "black", zIndex: 1}} />
                    <Image source={require("../../assets/images/MessagingIcon.png")} resizeMode='contain' width={dimensions.window.width * 0.5} height={dimensions.window.height * 0.25} style={{zIndex: 2, height: dimensions.window.height * 0.25, width: dimensions.window.width * 0.5, position: "absolute", aspectRatio: "1/1"}} />
                </View>
            </Link >
            <Link to={'/profile'}>
                <View style={{borderColor: "black", borderWidth: 2}}>
                    <View style={{backgroundColor: "#793033", width: dimensions.window.width * 0.5, height: dimensions.window.height * 0.25, borderTopWidth: 1, borderTopColor: "black"}} />
                    <Image source={require("../../assets/images/Books.png")} resizeMode='contain' width={dimensions.window.width * 0.5} height={dimensions.window.height * 0.25} style={{zIndex: 2, height: dimensions.window.height * 0.25, width: dimensions.window.width * 0.5, position: "absolute", aspectRatio: "1/1"}} />
                </View>
            </Link>
        </View>
    </View>
  )
}

{/* //        if width.width == 0.0 {
            if ScrollText != ""{
                ScrollView(.horizontal){
                    <Text style={{fontSize: dimensions.window.height * 0.08, fontFamily: "Chalkboard SE", height: dimensions.window.height * 0.08}}>{ScrollText} </Text>
                }.frame(width: geometry.size.width * 1.0, height: geometry.size.height * 0.99)
                .padding(.bottom, 0.01)
            } else {
                ProgressView()
                    .frame(width: geometry.size.width * 1.0, height: geometry.size.height * 0.1)
            }
        } else {
            Button{
//                        WindowMode.SelectedWindowMode = .Announcment
            } label: {
                let size = geometry.size.width
                InfiniteScroller(contentWidth: width.width * 2, AnimationDuration: $AnimationDuration) {
                    HStack(spacing: 0) {
                        SildingTileView(size: size, text: ScrollText, Width: $width.width, Height: geometry.size.height)
                        SildingTileView(size: size, text: ScrollText, Width: $width.width, Height: geometry.size.height)
                    }
                }
            }.frame(width: geometry.size.width * 1.0, height: geometry.size.height * 0.1)
        } */}