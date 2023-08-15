import { View, Text } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-native';
import SelectTimetable from '../../../../Calendar/SelectTimetable';

export default function GovernmentTimetable() {
  return (
    <View>
      <Link to="/profile/government/calendar/">
        <Text>Back</Text>
      </Link>
      <SelectTimetable governmentMode={true} />
      <Link to="/profile/government/calendar/timetable/create">
        <Text>Create New</Text>
      </Link>
    </View>
  )
}