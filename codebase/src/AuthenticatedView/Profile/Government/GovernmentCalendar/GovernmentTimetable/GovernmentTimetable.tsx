import { View, Text } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { accessTokenContent } from '../../../../../../App';
import { siteID } from '../../../../../PaulyConfig';
import callMsGraph from '../../../../../Functions/microsoftAssets';
import { Link } from 'react-router-native';
import SelectTimetable from '../../../../Calendar/SelectTimetable';

enum loadingStateEnum {
  loading,
  success,
  failed
}

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