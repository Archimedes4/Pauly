import { View, Text, Animated, Pressable } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Colors } from '../../types';

type PickerWrapperProps = {
  selectedIndex: number;
  setSelectedIndex: (item: number) => void;
  options: string[];
  width: number;
  height: number;
};

export default function SegmentedPicker({
  width,
  height,
  selectedIndex,
  setSelectedIndex,
  options,
}: PickerWrapperProps) {
  const pan = useRef(new Animated.Value(0)).current;
  const [compoentWidth, setComponentWidth] = useState(width / 3);
  function fadeIn(id: number) {
    // Will change fadeAnim value to 1 in 5 seconds
    Animated.timing(pan, {
      toValue: id * compoentWidth + compoentWidth * 0.005,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }

  useEffect(() => {
    pan.setValue(selectedIndex * compoentWidth + compoentWidth * 0.005);
  }, []);

  useEffect(() => {
    console.log(selectedIndex);
  }, [selectedIndex]);

  useEffect(() => {
    setComponentWidth(width / options.length);
    pan.setValue(selectedIndex * compoentWidth + compoentWidth * 0.005);
  }, [width]);

  return (
    <View
      style={{
        flexDirection: 'row',
        height,
        width,
        backgroundColor: '#7d7d7d',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 1,
      }}
    >
      {options.map((option, index) => (
        <Pressable
          onPress={() => {
            setSelectedIndex(index);
            fadeIn(index);
          }}
          style={{
            position: 'absolute',
            width: compoentWidth,
            height,
            alignItems: 'center',
            alignContent: 'center',
            justifyContent: 'center',
            transform: [{ translateX: index * compoentWidth }],
          }}
        >
          <Text
            adjustsFontSizeToFit
            style={{
              textAlignVertical: 'center',
              textAlign: 'center',
              width: compoentWidth,
            }}
          >
            {option}
          </Text>
        </Pressable>
      ))}
      <Animated.View style={{ transform: [{ translateX: pan }], zIndex: -1 }}>
        <View
          style={{
            height: height * 0.95,
            width: compoentWidth - compoentWidth * 0.01,
            backgroundColor: Colors.white,
            top: height * 0.025,
            borderRadius: 20,
            position: 'absolute',
            zIndex: -1,
            alignItems: 'center',
            alignContent: 'center',
            justifyContent: 'center',
          }}
        />
      </Animated.View>
    </View>
  );
}
