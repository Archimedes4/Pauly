import { View, Text } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-native';
import SelectTimetable from '../../../../Calendar/SelectTimetable';
import { RootState } from '../../../../../Redux/store';
import { useSelector } from 'react-redux';

export default function GovernmentTimetable() {
  const {width, height} = useSelector((state: RootState) => state.dimentions)
  return (
    <View style={{width: width, height: height, backgroundColor: Colors.white}}>
      <View style={{height: height * 0.1}}>
        <Link to="/profile/government/calendar/">
          <Text>Back</Text>
        </Link>
        <Text>Timetables</Text>
      </View>
      <View style={{height: height * 0.85}}>
        <SelectTimetable governmentMode={true} />
      </View>
      <Link to="/profile/government/calendar/timetable/create">
        <Text>Create New</Text>
      </Link>
    </View>
  )
}