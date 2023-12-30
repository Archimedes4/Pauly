// Andrew Mainella
// June 19 2023
// Picker with animated black line

import { Colors } from '@src/constants';
import React, { ReactNode, useRef, useEffect, Children } from 'react';
import { View, Pressable } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
// import styles from './Picker.module.css'

interface PickerWrapperProps {
  selectedIndex: number;
  onSetSelectedIndex: (item: number) => void;
  children: ReactNode;
  width: number;
  height: number;
}

const PickerWrapper: React.FC<PickerWrapperProps> = ({
  selectedIndex,
  onSetSelectedIndex,
  children,
  width,
  height,
}) => {
  const compoentWidth = width / Children.count(children);
  const pan = useSharedValue(selectedIndex * compoentWidth);
  function fadeIn(id: number) {
    // Will change fadeAnim value to 1 in 5 seconds
    pan.value = withTiming(compoentWidth * id, {
      duration: 250,
      easing: Easing.linear,
    })
  }

  const animatedDefault = useAnimatedStyle(() => ({
    transform: [{ translateX: pan.value }],
  }));

  return (
    <View style={{ flexDirection: 'row', height: height * 0.8, width }}>
      {React.Children.map(children, (child, index) => (
        <View
          style={{
            position: 'absolute',
            transform: [{ translateX: index * compoentWidth }],
            width: compoentWidth,
          }}
        >
          <Pressable
            onPress={() => {
              onSetSelectedIndex(index);
              fadeIn(index);
            }}
          >
            {child}
          </Pressable>
        </View>
      ))}
      <Animated.View
        style={animatedDefault}
      >
        <View
          style={{
            height: height * 0.2,
            width: compoentWidth,
            backgroundColor: Colors.black,
            top: height * 0.6,
            borderRadius: 5,
            position: 'absolute',
          }}
        />
      </Animated.View>
    </View>
  );
};

export default PickerWrapper;
