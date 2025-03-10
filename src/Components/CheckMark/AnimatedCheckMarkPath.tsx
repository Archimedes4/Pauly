/*
  Pauly
  Andrew Mainella
  16 January 2024
*/
import React from 'react';
import Animated, {
  SharedValue,
  useAnimatedProps,
} from 'react-native-reanimated';
import { Path } from 'react-native-svg';

export default function AnimatedCheckMarkPath({
  progress,
  checkMarkColor,
}: {
  progress: SharedValue<number>;
  checkMarkColor: animatedCheckMarkColor;
  checked: boolean;
}) {
  // creating path and progress value
  const AnimatedPath = Animated.createAnimatedComponent(Path);
  const checkMarkAnimation = useAnimatedProps(() => {
    const strokeDashoffset = 1000 * progress.value;
    return { strokeDashoffset };
  });
  return (
    <AnimatedPath
      animatedProps={checkMarkAnimation}
      d="M14.1 27.2l7.1 7.2 16.7-16.8"
      stroke={checkMarkColor}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      strokeWidth={5}
      strokeDasharray={1000}
      strokeMiterlimit={10}
    />
  );
}
