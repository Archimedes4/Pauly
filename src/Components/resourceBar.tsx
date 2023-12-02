import { View, Text, Pressable } from 'react-native'
import React from 'react'
import createUUID from '@src/Functions/ultility/createUUID';
import { CalendarIcon, DocumentIcon, GraduationHatIcon, GymIcon, HomeIcon, Megaphone, NewsIcon, SportsIcon, UpIcon } from './Icons';
import { Colors, resourceMode } from '@src/types';
import { resourcesSlice } from '@src/Redux/reducers/resourcesReducer';
import { useDispatch } from 'react-redux';

export default function resourceBar() {
  const dispatch = useDispatch();
  return (
    <Pressable style={{flexDirection: 'row', backgroundColor: Colors.white, position: 'absolute', bottom: 0}}>
      <Pressable
        onPress={() => {
          dispatch(resourcesSlice.actions.setSelectedResourceMode(resourceMode.home));
        }}
      >
        <HomeIcon width={14} height={14}/>
      </Pressable>
      <Pressable
        onPress={() => {
          dispatch(resourcesSlice.actions.setSelectedResourceMode(resourceMode.home));
        }}
      >
        <SportsIcon width={14} height={14}/>
      </Pressable>
      <Pressable
        onPress={() => {
          dispatch(resourcesSlice.actions.setSelectedResourceMode(resourceMode.home));
        }}
      >
        <CalendarIcon width={14} height={14}/>
      </Pressable>
      <Pressable
        onPress={() => {
          dispatch(resourcesSlice.actions.setSelectedResourceMode(resourceMode.home));
        }}
      >
        <Megaphone width={14} height={14} />
      </Pressable>
      <Pressable
        onPress={() => {
          dispatch(resourcesSlice.actions.setSelectedResourceMode(resourceMode.home));
        }}
      >
        <GymIcon width={14} height={14}/>
      </Pressable>
      <Pressable
        onPress={() => {
          dispatch(resourcesSlice.actions.setSelectedResourceMode(resourceMode.home));
        }}
      >
        <DocumentIcon width={14} height={14}/>
      </Pressable>
      <Pressable
        onPress={() => {
          dispatch(resourcesSlice.actions.setSelectedResourceMode(resourceMode.home));
        }}
      >
        <NewsIcon width={14} height={14}/>
      </Pressable>
      <Pressable
        onPress={() => {
          dispatch(resourcesSlice.actions.setSelectedResourceMode(resourceMode.home));
        }}
      >
        <GraduationHatIcon width={14} height={14}/>
      </Pressable>
      <Pressable
        onPress={() => {
          dispatch(resourcesSlice.actions.setSelectedResourceMode(resourceMode.home));
        }}
      >
        <UpIcon width={14} height={14}/>
      </Pressable>
    </Pressable>
  )
}