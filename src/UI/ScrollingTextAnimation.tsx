import { View, Text, Animated, Easing } from 'react-native'
import React, { ReactNode, useEffect, useRef, useState } from 'react'

export default function ScrollingTextAnimation({children, width, height}:{children: ReactNode, width: number, height: number}) {
    const pan = useRef(new Animated.Value(0)).current
    const [childWidth, setChildWidth] = useState<number>(0)
    function mainLoop(childWidth: number) {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pan, {
                    toValue: -childWidth,
                    duration: 5000,
                    delay: 0,
                    easing: Easing.linear,
                    useNativeDriver: false
                }),
                Animated.timing(pan, {
                    toValue: 0,
                    duration: 0,
                    delay: 0,
                    useNativeDriver: false
                }),
            ])
        ).start()
    }
    useEffect(() => {
        if (childWidth !== 0){
            mainLoop(childWidth)
        }
    }, [childWidth])
    return (
        <View style={{width: width, height: height, overflow: "hidden"}}>
            { (childWidth !== 0) ? 
                <Animated.View style={{transform: [{translateX: pan}]}}>
                    <View style={{width: childWidth + childWidth * 0.01, height: height, overflow: "hidden", position: "absolute", left: childWidth + childWidth * 0.01}}>
                        {children}
                    </View>
                    <View style={{width: childWidth + childWidth * 0.01, height: height, position: "absolute", left: 0}}>
                        {children}
                    </View>
                </Animated.View>:
                <View onLayout={(e) => {setChildWidth(e.nativeEvent.layout.width); console.log("This is text with", e.nativeEvent.layout.width)}} style={{height: height, position: "absolute", left: 0}}>
                    {children}
                </View>
            }
        </View>
    )
}