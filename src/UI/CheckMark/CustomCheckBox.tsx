//Original Code from https://github.com/Rakha112/react-native-custom-checkbox/blob/main/src/components/CustomCheckBox.js

import React, {memo} from 'react';
import Svg from 'react-native-svg';
import {Easing, useDerivedValue, withTiming} from 'react-native-reanimated';
import AnimatedCheckMarkPath from './AnimatedCheckMarkPath';
import AnimatedColor from './AnimatedColor';
import { View } from 'react-native';

export default function CustomCheckBox({checked, checkMarkColor, height, width}:{
  checked: boolean,
  checkMarkColor: string,
  checkedBorderColor: string,
  unCheckedBorderColor: string,
  checkedBackgroundColor: string,
  unCheckedBackgroundColor: string,
  height: number,
  width: number
}) {
  const progress = useDerivedValue(() => {
    return withTiming(checked ? 0:1, {
      duration: 1500,
      easing: Easing.inOut(Easing.bezierFn(0.5, -0.02, 0.92, 0.37))
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
      </Svg>
    </View>
  );
}