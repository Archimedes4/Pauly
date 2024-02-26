import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { loadingStateEnum } from '@src/constants'

export default function leaderboard() {
  const [leaderboard, setLeaderboard] = useState<leaderboardUserType[]>([])
  const [leaderboardState, setLeaderboardState] = useState<loadingStateEnum>(loadingStateEnum.notStarted)
  useEffect(() => {

  }, [])

  if (leaderboardState === loadingStateEnum.success) {
    return (
      <View>
        
      </View>
    )
  }

  return (
    <View>
      <Text>leaderboard</Text>
      
    </View>
  )
}