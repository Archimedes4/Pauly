/*
  Pauly
  Andrew Mainella
  16 January 2024
  Original Code from https://github.com/Rakha112/react-native-custom-checkbox/blob/main/src/components/CustomCheckBox.js
*/
import React from 'react';
import Svg, { Circle } from 'react-native-svg';
import { Easing, useDerivedValue, withTiming } from 'react-native-reanimated';
import { View } from 'react-native';
import { Colors } from '@constants';
import AnimatedCheckMarkPath from './AnimatedCheckMarkPath';

export default function CustomCheckBox({
  checked,
  checkMarkColor,
  height,
  width,
  strokeDasharray,
}: {
  checked: boolean;
  checkMarkColor: animatedCheckMarkColor;
  height: number;
  width: number;
  strokeDasharray?: number;
}) {
  const progress = useDerivedValue(() => {
    return withTiming(checked ? 0 : 1, {
      duration: 1500,
      easing: Easing.inOut(Easing.bezierFn(0.5, -0.02, 0.92, 0.37)),
    });
  });

  return (
    <View>
      <Svg width={width} height={height} viewBox="0 0 52 52">
        <AnimatedCheckMarkPath
          progress={progress}
          checkMarkColor={checkMarkColor}
          checked={checked}
        />
        <Circle
          cx="26"
          cy="26"
          r="20"
          stroke={Colors.black}
          strokeDasharray={strokeDasharray}
          strokeWidth="2"
          fill="none"
        />
      </Svg>
    </View>
  );
}
