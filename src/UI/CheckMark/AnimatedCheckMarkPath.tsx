import React, {useRef, useState, memo} from 'react';
import Animated, {SharedValue, useAnimatedProps} from 'react-native-reanimated';
import {Path} from 'react-native-svg';

export default function AnimatedCheckMarkPath({progress, checkMarkColor, checked}:{progress: SharedValue<number>, checkMarkColor, checked: boolean}) {
  const AnimatedPath = Animated.createAnimatedComponent(Path);
  const checkMarkAnimation = useAnimatedProps(() => {
    const strokeDashoffset = 1000 * progress.value;
    return {strokeDashoffset: strokeDashoffset};
  });
  return (
    <AnimatedPath
      animatedProps={checkMarkAnimation}
      d="M14.1 27.2l7.1 7.2 16.7-16.8"
      stroke={checkMarkColor}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={"none"}
      strokeWidth={5}
      strokeDasharray={1000}
      strokeMiterlimit={10}
    />
  );
}
{/* <svg width="200px" height="200px" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" preserveAspectRatio="xMidYMid meet" fill="#000000">
  <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
  <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
  <g id="SVGRepo_iconCarrier">
    <path fill="#31373D" d="M34.459 1.375a2.999 2.999 0 0 0-4.149.884L13.5 28.17l-8.198-7.58a2.999 2.999 0 1 0-4.073 4.405l10.764 9.952s.309.266.452.359a2.999 2.999 0 0 0 4.15-.884L35.343 5.524a2.999 2.999 0 0 0-.884-4.149z"></path>
    </g></svg> */}