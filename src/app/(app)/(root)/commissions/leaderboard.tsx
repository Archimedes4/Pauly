import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { loadingStateEnum } from '@src/constants'
import ProgressView from '@components/ProgressView'
import { useSelector } from 'react-redux'
import { RootState } from '@redux/store'

export default function leaderboard() {
  const [leaderboard, setLeaderboard] = useState<leaderboardUserType[]>([])
  const [leaderboardState, setLeaderboardState] = useState<loadingStateEnum>(loadingStateEnum.notStarted)
  const { height, width } = useSelector(
    (state: RootState) => state.dimensions,
  );
  useEffect(() => {

  }, [])

  if (leaderboardState === loadingStateEnum.success) {
    return (
      <View style={{width, height, alignContent: 'center', alignItems: 'center', justifyContent: 'center'}}>
        <ProgressView width={14} height={14}/>
        <Text>Loading</Text>
      </View>
    )
  }

  if (leaderboardState === loadingStateEnum.loading) {
    return (
      <View>
        <ProgressView width={14} height={14}/>
        <Text>Loading</Text>
      </View>
    )
  }

  return (
    <View>
      <Text>leaderboard</Text>
      
    </View>
  )
}