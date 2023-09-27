/**
 * Pauly React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { useEffect, useState } from 'react';
import { Dimensions, View } from 'react-native';
import { Provider, useSelector } from 'react-redux'

import store, { RootState } from './src/Redux/store';
import { dimentionsSlice } from './src/Redux/reducers/dimentionsReducer';
import AppMain from './AppMain/AppMain';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const windowDimensions = Dimensions.get('window');
const screenDimensions = Dimensions.get('screen');

//From https://getbootstrap.com/docs/5.0/layout/breakpoints/
enum breakPointMode {
  xSmall,	  //<576px  ->0
  small,    //≥576px  ->1
  medium,   //≥768px  ->2
  large,    //≥992px  ->3
  xLarge    //≥1200px ->4
}

function AppCore() {
  //Dimentions
  const safeAreaColors = useSelector((state: RootState) => state.safeAreaColors)
  const expandedMode = useSelector((state: RootState) => state.expandedMode)
  const {currentBreakPoint} = useSelector((state: RootState) => state.dimentions)
  const [dimensions, setDimensions] = useState({window: windowDimensions, screen: screenDimensions});
  const insets = useSafeAreaInsets();
  
  useEffect(() => {
    const subscription = Dimensions.addEventListener(
      'change',
      ({window, screen}) => {
        setDimensions({window, screen});
      },
    );
    return () => subscription?.remove();
  });

  useEffect(() => {
    const width = dimensions.window.width - insets.left -insets.right
    if (width >= 576){
      if (expandedMode){
        store.dispatch(dimentionsSlice.actions.setDimentionsWidth(width * 0.75))
      } else {
        store.dispatch(dimentionsSlice.actions.setDimentionsWidth(width * 0.9))
      }
    }
  }, [expandedMode])

  useEffect(() => {
    const oldWidth = store.getState().dimentions.width
    const height = store.getState().dimentions.height
    const newWidth = dimensions.window.width - insets.left - insets.right
    const newHeight = dimensions.window.height - insets.bottom - insets.top
    if (oldWidth !== newWidth) {
      var oldCurrentBreakPointMode: breakPointMode = store.getState().dimentions.currentBreakPoint
      var currentBreakPoint: breakPointMode = breakPointMode.xSmall
      if (newWidth >= 1200) {
        //extraLarge ≥1200px
        currentBreakPoint = breakPointMode.xLarge
      } else if (newWidth  >= 992) {
        //large, ≥992px
        currentBreakPoint = breakPointMode.large
      } else if (newWidth  >= 768) {
        //medium, ≥768px
        currentBreakPoint = breakPointMode.medium
      } else if (newWidth  >= 576) {
        //small, ≥576px
        currentBreakPoint = breakPointMode.small
      } else if (newWidth  < 576) {
        //xSmall,	<576px
        currentBreakPoint = breakPointMode.xSmall
      }
      if (oldCurrentBreakPointMode !== currentBreakPoint){
        if (newWidth >= 576){
          if (expandedMode){
            store.dispatch(dimentionsSlice.actions.setDimentionsWidthCurrentBreakPoint({width: newWidth * 0.75, currentBreakPoint: currentBreakPoint}))
          } else {
            store.dispatch(dimentionsSlice.actions.setDimentionsWidthCurrentBreakPoint({width: newWidth * 0.9, currentBreakPoint: currentBreakPoint}))
          }
        } else {
          store.dispatch(dimentionsSlice.actions.setDimentionsWidthCurrentBreakPoint({width: newWidth , currentBreakPoint: currentBreakPoint}))
        }
      } else {
        if (newWidth >= 576){
          if (expandedMode){
            store.dispatch(dimentionsSlice.actions.setDimentionsWidth(newWidth * 0.75))
          } else {
            store.dispatch(dimentionsSlice.actions.setDimentionsWidth(newWidth * 0.9))
          }
        } else {
          store.dispatch(dimentionsSlice.actions.setDimentionsWidth(newWidth))
        }
      }
    }
    if (height !== newHeight) {
      console.log(newHeight)
      console.log(dimensions.window.height)
      store.dispatch(dimentionsSlice.actions.setDimentionsHeight(newHeight))
    }
  }, [dimensions])

  return (
    <>
      <View style={{width: dimensions.window.width, height: insets.top, backgroundColor: safeAreaColors.top}}/>
      <SafeAreaView style={{backgroundColor: safeAreaColors.bottom, width: dimensions.window.width, height: (dimensions.window.height - (insets.top + insets.bottom)), zIndex: 10, top: insets.top, position: "absolute", overflow: "hidden"}}>
        <AppMain dimensions={dimensions} />
      </SafeAreaView>
      <View style={{width: dimensions.window.width, height: insets.bottom, backgroundColor: safeAreaColors.bottom, position: "absolute", bottom: 0}}/>
      { (currentBreakPoint >= 1) ?
        <View style={{height: dimensions.window.height, width: (expandedMode) ? dimensions.window.width * 0.25:dimensions.window.width * 0.1, backgroundColor: "#793033", position: "absolute", top: 0, left: 0}}/>:null
      }
    </>
  );
}

function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
         <AppCore />
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </Provider>
  )
}

export default App;
