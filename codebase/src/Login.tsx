import React, {useEffect, useState} from 'react'
import { useMsal } from "@azure/msal-react";
import {View, Pressable, Text, Dimensions} from "react-native"
import { loginRequest } from "./authConfig";

const windowDimensions = Dimensions.get('window');
const screenDimensions = Dimensions.get('screen');

export default function Login() {
    const { instance } = useMsal();
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

    useEffect(() => {
        setDimensions({
            window: Dimensions.get('window'),
            screen: Dimensions.get('screen'),
        });
    }, [])

    return (
        <View style={{backgroundColor: "#793033", alignContent: "center", alignItems: "center", justifyContent: "center", height: dimensions.window.height, width: dimensions.window.width}}>
            <Pressable onPress={async () => {
                instance.loginRedirect(loginRequest).catch((e) => {
                    console.log(e);
                })
            }}>
                <View style={{height: dimensions.window.height * 0.2, width: dimensions.window.width * 0.5, borderRadius: 25, backgroundColor: "white", alignContent: "center", alignItems: "center", justifyContent: "center"}}>
                    <Text style={{textAlign: "center", textAlignVertical: "center"}}>Login</Text>
                </View>
            </Pressable>
        </View>
    )
}
