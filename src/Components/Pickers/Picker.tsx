// Andrew Mainella
// June 19 2023
// Picker with animated black line

import { Colors } from '@constants';
import createUUID from '@utils/ultility/createUUID';
import React, { ReactNode, useEffect, Children, useState } from 'react';
import { View, Pressable } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

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
  const [componentWidth, setCompoentWidth] = useState<number>(0);
  const [newChildren, setNewChildren] = useState<
    {
      child: Exclude<ReactNode, boolean | null | undefined>;
      id: string;
    }[]
  >([]);
  const pan = useSharedValue(0);
  function fadeIn(id: number) {
    // Will change fadeAnim value to 1 in 5 seconds
    pan.value = withTiming(componentWidth * id, {
      duration: 250,
      easing: Easing.linear,
    });
  }

  const animatedDefault = useAnimatedStyle(() => ({
    transform: [{ translateX: pan.value }],
  }));

  // count compoents and set componet width
  useEffect(() => {
    let count = 0;
    const oldChildren = Children.toArray(children);
    const newChildren = [
      ...oldChildren
        .filter(e => {
          count += 1;
          return e !== null;
        })
        .map(e => {
          return {
            child: e,
            id: createUUID(),
          };
        }),
    ];
    setNewChildren(newChildren);
    setCompoentWidth(width / count);
    pan.value = selectedIndex * (width / count);
  }, []);

  return (
    <View style={{ flexDirection: 'row', height: height * 0.8, width }}>
      {newChildren.map((child, index) => (
        <View
          key={child.id}
          style={{
            position: 'absolute',
            transform: [{ translateX: index * componentWidth }],
            width: componentWidth,
          }}
        >
          <Pressable
            onPress={() => {
              onSetSelectedIndex(index);
              fadeIn(index);
            }}
          >
            {child.child}
          </Pressable>
        </View>
      ))}
      <Animated.View style={animatedDefault}>
        <View
          style={{
            height: height * 0.2,
            width: componentWidth,
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
