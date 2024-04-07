import { View, Text, Easing } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Link, usePathname } from 'expo-router'
import { ZeroFooterIcon } from './Icons'
import { useDispatch, useSelector } from 'react-redux';
import store, { RootState } from '@src/redux/store';
import { dimensionsSlice } from '@src/redux/reducers/dimensionsReducer';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Colors } from '@src/constants';

export default function ZeroFooterComponent() {
  const { totalHeight, width } = useSelector(
    (state: RootState) => state.dimensions,
  );
  const [selectedButton, setSelectedButton] = useState<number>(0);
  const [mounted, setMounted] = useState<boolean>(false)
  const pathname = usePathname()
  const pan = useSharedValue(0);
  const animatedDefault = useAnimatedStyle(() => ({
    left: pan.value,
  }));

  function animate(value: number) {
    if (!mounted) {
      console.log(mounted)
      setMounted(true)
      pan.value = (value * width/4) + (((width/4) - (totalHeight * 0.05))/2)
      return
    }
    pan.value = withTiming(value * width/4 + (((width/4) - (totalHeight * 0.05))/2), {
      duration: 250,
      easing: Easing.linear,
    });
  }

  useEffect(() => {
    if (pathname === "/commissions") {
      setSelectedButton(1)
      animate(1)
    } else if (pathname === "/calendar") {
      setSelectedButton(2)
      animate(2)
    } else if (pathname === "/settings") {
      setSelectedButton(3)
      animate(3)
    } else {
      setSelectedButton(0)
      animate(0)
    }
  }, [pathname])

  return (
    <View style={{flexDirection: 'row', height: totalHeight * 0.075, backgroundColor: Colors.black}} onLayout={(e) => {store.dispatch(dimensionsSlice.actions.setZeroFooterHeight(e.nativeEvent.layout.height))}}>
      <Link href={"/"}  style={{position: 'absolute', width: width/4, height: totalHeight * 0.075, zIndex: 100}}/>
      <Link href={"/commissions"} style={{position: 'absolute', width: width/4, left: width/4, height: totalHeight * 0.075, zIndex: 100}}/>
      <Link href={"/calendar"} style={{position: 'absolute', width: width/4, left: (width/4 * 2), height: totalHeight * 0.075, zIndex: 100}}/>
      <Link href={"/settings"} style={{position: 'absolute', width: width/4, left: (width/4 * 3), height: totalHeight * 0.075, zIndex: 100}} />
      <ZeroFooterIcon width={width} height={totalHeight} style={{position: 'absolute'}} color={Colors.maroon}/>
      <Animated.View style={[animatedDefault, {
        width: totalHeight * 0.05,
        height: totalHeight * 0.05,
        position: 'absolute',
        backgroundColor: 'white',
        zIndex: -10,
        top: totalHeight * 0.0109 + 1
      }]}/>
    </View>
  )
}