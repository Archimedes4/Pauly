// Andrew Mainella
// June 19 2023
// Picker with animated black line

import React, { ReactNode, useRef, useEffect, Children } from 'react';
import { View, Pressable, Animated } from 'react-native';
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
  const pan = useRef(new Animated.Value(0)).current;
  const compoentWidth = width / Children.count(children);
  function fadeIn(id: number) {
    // Will change fadeAnim value to 1 in 5 seconds
    Animated.timing(pan, {
      toValue: id * compoentWidth,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }

  useEffect(() => {
    pan.setValue(selectedIndex * compoentWidth);
  }, []);

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
        style={{
          transform: [{ translateX: pan }],
        }}
      >
        <View
          style={{
            height: height * 0.2,
            width: compoentWidth,
            backgroundColor: 'black',
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
