/*
  Pauly
  Andrew Mainella
  November 9 2023
  ScrollingTextAnimation.tsx
  Used in Home view for current break point = 0
*/
import { View, Text, Platform } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { Colors } from '@constants';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

export default function ScrollingTextAnimation({
  text,
  width,
  height,
}: {
  text: string;
  width: number;
  height: number;
}) {
  const pan = useSharedValue(0);
  const [childWidth, setChildWidth] = useState<number>(0);
  const mainLoop = (childWidthLoop: number) => {
    pan.value = withRepeat(
      withTiming(childWidthLoop, {
        duration: 5000,
        easing: Easing.linear,
      }),
      -1,
    );
  };
  const textContainerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -pan.value }],
  }));

  useEffect(() => {
    if (childWidth !== 0) {
      mainLoop(childWidth);
    }
  }, [childWidth, mainLoop]);

  return (
    <View style={{ width, height, overflow: 'hidden' }}>
      {childWidth !== 0 ? (
        <Animated.View
          style={[
            textContainerStyle,
            {
              width: childWidth,
              height,
            },
          ]}
        >
          <View
            style={{
              width: childWidth,
              height,
              position: 'absolute',
              left: 0,
            }}
          >
            <Text
              style={{
                fontFamily: 'Gochi-Hand',
                color: Colors.white,
                fontSize: height,
                height,
                position: 'absolute',
              }}
            >
              {text}
            </Text>
          </View>
          <View
            style={{
              width: childWidth,
              height,
              overflow: 'hidden',
              position: 'absolute',
              left: childWidth,
            }}
          >
            <Text
              style={{
                fontFamily: 'Gochi-Hand',
                color: Colors.white,
                fontSize: height,
                height,
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
              if (e.nativeEvent.layout.width < width) {
                setChildWidth(width);
              } else {
                setChildWidth(
                  e.nativeEvent.layout.width + e.nativeEvent.layout.width * 0.2,
                );
              }
            }}
            adjustsFontSizeToFit={!(Platform.OS === 'ios')}
            style={{
              fontFamily: 'Gochi-Hand',
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
