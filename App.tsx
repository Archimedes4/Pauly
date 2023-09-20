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
  const statusBarColor = useSelector((state: RootState) => state.statusBarColor)
  const [dimensions, setDimensions] = useState({window: windowDimensions, screen: screenDimensions});
  const [expandedMode, setExpandedMode] = useState<boolean>(false)

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
    const width = dimensions.window.width
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
    const width = dimensions.window.width
    if (oldWidth !== width) {
      var oldCurrentBreakPointMode: breakPointMode = store.getState().dimentions.currentBreakPoint
      var currentBreakPoint: breakPointMode = breakPointMode.xSmall
      if (dimensions.window.width >= 1200) {
        //extraLarge ≥1200px
        currentBreakPoint = breakPointMode.xLarge
      } else if (dimensions.window.width  >= 992) {
        //large, ≥992px
        currentBreakPoint = breakPointMode.large
      } else if (dimensions.window.width  >= 768) {
        //medium, ≥768px
        currentBreakPoint = breakPointMode.medium
      } else if (dimensions.window.width  >= 576) {
        //small, ≥576px
        currentBreakPoint = breakPointMode.small
      } else if (dimensions.window.width  < 576) {
        //xSmall,	<576px
        currentBreakPoint = breakPointMode.xSmall
      }
      if (oldCurrentBreakPointMode !== currentBreakPoint){
        if (width >= 576){
          if (expandedMode){
            store.dispatch(dimentionsSlice.actions.setDimentionsWidthCurrentBreakPoint({width: width * 0.75, currentBreakPoint: currentBreakPoint}))
          } else {
            store.dispatch(dimentionsSlice.actions.setDimentionsWidthCurrentBreakPoint({width: width * 0.9, currentBreakPoint: currentBreakPoint}))
          }
        } else {
          store.dispatch(dimentionsSlice.actions.setDimentionsWidthCurrentBreakPoint({width: width , currentBreakPoint: currentBreakPoint}))
        }
      } else {
        if (width >= 576){
          if (expandedMode){
            store.dispatch(dimentionsSlice.actions.setDimentionsWidth(width * 0.75))
          } else {
            store.dispatch(dimentionsSlice.actions.setDimentionsWidth(width * 0.9))
          }
        } else {
          store.dispatch(dimentionsSlice.actions.setDimentionsWidth(width))
        }
      }
    }
    if (height !== dimensions.window.height) {
      console.log("height changed")
      store.dispatch(dimentionsSlice.actions.setDimentionsHeight(dimensions.window.height))
    }
  }, [dimensions])

  return (
    <View style={{backgroundColor: statusBarColor}}>
      {
        <View style={{height: dimensions.window.height, width: (expandedMode) ? dimensions.window.width * 0.25:dimensions.window.width * 0.1, backgroundColor: "#793033"}}/>
      }
      <AppMain expandedMode={false} setExpandedMode={setExpandedMode} dimensions={dimensions} />
    </View>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppCore />
    </Provider>
  )
}

export default App;
