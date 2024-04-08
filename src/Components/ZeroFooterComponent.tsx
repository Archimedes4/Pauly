import { View, Text, Easing } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { Link, usePathname } from 'expo-router'
import { ZeroFooterIcon } from './Icons'
import { useDispatch, useSelector } from 'react-redux';
import store, { RootState } from '@src/redux/store';
import { dimensionsSlice } from '@src/redux/reducers/dimensionsReducer';
import Animated, { runOnUI, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Colors } from '@src/constants';
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

  function animate(value: number) {
    // if (!mounted) {
    //   setMounted(true)
    //   if (pan.value !== value) {
    //     pan.value = value
    //   }
    //   return
    // }
   
    pan.value = withTiming(value, {
      duration: 250,
      easing: Easing.linear,
    });
   
  }

  const setPan = useCallback(
    (value: number) => {
      pan.value = withTiming(value);
    },
    [pan],
  );

  useEffect(() => {
    if (pathname === "/commissions") {
      // if (!mounted) {
      //   setMounted(true)
      //   pan.value = (1 * totalWidth/4) + (((totalWidth/4) - (totalHeight * 0.05))/2)
      //   return
      // }
      // let newVal = 1 * totalWidth/4 + (((totalWidth/4) - (totalHeight * 0.05))/2)
     
      // pan.value = withTiming(newVal, {
      //   duration: 250,
      //   easing: Easing.linear,
      // });
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