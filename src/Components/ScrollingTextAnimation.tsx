/*
  Pauly
  Andrew Mainella
  November 9 2023
  ScrollingTextAnimation.tsx
  Used in Home view for current break point = 0
*/
import { View, Text, Animated, Easing, Platform } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { Colors } from '@constants';

export default function ScrollingTextAnimation({
  text,
  width,
  height,
}: {
  text: string;
  width: number;
  height: number;
}) {
  const pan = useRef(new Animated.Value(0)).current;
  const [childWidth, setChildWidth] = useState<number>(0);
  const mainLoop = (childWidthLoop: number) => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pan, {
          toValue: -childWidthLoop,
          duration: 5000,
          delay: 0,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
        Animated.timing(pan, {
          toValue: 0,
          duration: 0,
          delay: 0,
          useNativeDriver: false,
        }),
      ]),
    ).start();
  };

  useEffect(() => {
    if (childWidth !== 0) {
      mainLoop(childWidth);
    }
  }, [childWidth, mainLoop]);

  return (
    <View style={{ width, height, overflow: 'hidden' }}>
      {childWidth !== 0 ? (
        <Animated.View style={{ transform: [{ translateX: pan }] }}>
          <View
            style={{
              width: childWidth + childWidth * 0.01,
              height,
              overflow: 'hidden',
              position: 'absolute',
              left: childWidth + childWidth * 0.01,
            }}
          >
            <Text
              style={{
                fontFamily: 'GochiHand',
                color: Colors.white,
                fontSize: height,
                height,
              }}
            >
              {text}
            </Text>
          </View>
          <View
            style={{
              width: childWidth + childWidth * 0.01,
              height,
              position: 'absolute',
              left: 0,
            }}
          >
            <Text
              style={{
                fontFamily: 'GochiHand',
                color: Colors.white,
                fontSize: height,
                height,
                position: 'absolute',
              }}
            >
              {text}
            </Text>
          </View>
        </Animated.View>
      ) : (
        <ScrollView style={{ width: 99999999 }} horizontal>
          <Text
            numberOfLines={1}
            onLayout={e => {
              setChildWidth(e.nativeEvent.layout.width);
            }}
            adjustsFontSizeToFit={!(Platform.OS === 'ios')}
            style={{
              fontFamily: 'GochiHand',
              color: Colors.white,
              fontSize: height,
              height,
            }}
          >
            {text}
          </Text>
        </ScrollView>
      )}
    </View>
  );
}
