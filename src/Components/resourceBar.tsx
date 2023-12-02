import { View, Text, Pressable } from 'react-native'
import React from 'react'
import createUUID from '@src/Functions/ultility/createUUID';
import { CalendarIcon, DocumentIcon, GraduationHatIcon, GymIcon, HomeIcon, Megaphone, NewsIcon, SportsIcon, UpIcon } from './Icons';

export default function resourceBar() {
  return (
    <Pressable style={{flexDirection: 'row'}}>
      <HomeIcon width={14} height={14}/>
      <SportsIcon width={14} height={14}/>
      <CalendarIcon width={14} height={14}/>
      <Megaphone width={14} height={14} />
      <GymIcon width={14} height={14}/>
      <DocumentIcon width={14} height={14}/>
      <NewsIcon width={14} height={14}/>
      <GraduationHatIcon width={14} height={14}/>
      <UpIcon width={14} height={14}/>
    </Pressable>
  )
}