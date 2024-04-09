/*
  Pauly
  Andrew Mainella
  8 April 2024
*/
import { View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { Link, usePathname } from 'expo-router'
import { ZeroFooterIcon } from './Icons'
import { useSelector } from 'react-redux';
import store, { RootState } from '@redux/store';
import { dimensionsSlice } from '@redux/reducers/dimensionsReducer';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Colors } from '@constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ZeroFooterComponent() {
  const { totalHeight, totalWidth } = useSelector(
    (state: RootState) => state.dimensions,
  );
  const [mounted, setMounted] = useState<boolean>(false)
  const pathname = usePathname()
  const insets = useSafeAreaInsets();
  const pan = useSharedValue(getLeft(0));
  const animatedDefault = useAnimatedStyle(() => ({
    transform: [{translateX: pan.value}],
  }));

  function getLeft(value: number) {
    return (value * totalWidth/4) + (((totalWidth/4) - (totalHeight * 0.05))/2)
  }

  const setPan = useCallback(
    (value: number) => {
      pan.value = withTiming(value);
    },
    [pan],
  );

  // Set pan on path change. This also set the pan on mount.
  useEffect(() => {
    if (pathname === "/commissions") {
      setPan(getLeft(1))
    } else if (pathname === "/calendar") {
      setPan(getLeft(2))
    } else if (pathname === "/settings") {
      setPan(getLeft(3))
    } else {
      setPan(getLeft(0))
    }
  }, [pathname])

  return (
    <View
      style={{
        flexDirection: 'row',
        height: totalHeight * 0.075,
        backgroundColor: Colors.black,
      }}
      onLayout={(e) => {store.dispatch(dimensionsSlice.actions.setZeroFooterHeight(e.nativeEvent.layout.height))}}
    >
      <Link href={"/"} style={{position: 'absolute', width: totalWidth/4, height: totalHeight * 0.075, zIndex: 100}}/>
      <Link href={"/commissions"} style={{position: 'absolute', width: totalWidth/4, left: totalWidth/4, height: totalHeight * 0.075, zIndex: 100}}/>
      <Link href={"/calendar"} style={{position: 'absolute', width: totalWidth/4, left: (totalWidth/4 * 2), height: totalHeight * 0.075, zIndex: 100}}/>
      <Link href={"/settings"} style={{position: 'absolute', width: totalWidth/4, left: (totalWidth/4 * 3), height: totalHeight * 0.075, zIndex: 100}} />
      <ZeroFooterIcon width={totalWidth + 10} height={totalHeight + 10} style={{position: 'absolute', left: -5}} color={Colors.maroon}/>
      <Animated.View style={[animatedDefault, {
        zIndex: -10
      }]}>
        <View style={{
          width: totalHeight * 0.05,
          height: totalHeight * 0.05,
          position: 'absolute',
          backgroundColor: Colors.white,
          top: totalHeight * 0.0109 + 1
        }}/> 
      </Animated.View >
    </View>
  )
}