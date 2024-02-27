import { View, Text, FlatList } from 'react-native'
import React, { useEffect } from 'react'
import { Colors, loadingStateEnum } from '@constants'
import ProgressView from '@components/ProgressView'
import { useSelector } from 'react-redux'
import store, { RootState } from '@redux/store'
import { safeAreaColorsSlice } from '@redux/reducers/safeAreaColorsReducer'
import BackButton from '@components/BackButton'
import { getLeaderboard } from '@redux/reducers/leaderboardReducer'
import { MedalIcon } from '@src/components/Icons'

export default function Leaderboard() {
  const { height, width, currentBreakPoint } = useSelector(
    (state: RootState) => state.dimensions,
  );
  const { state, leaderboard } = useSelector(
    (state: RootState) => state.leaderboard,
  );
  useEffect(() => {
    getLeaderboard()
  }, [])

  useEffect(() => {
    store.dispatch(
      safeAreaColorsSlice.actions.setSafeAreaColors({
        top: Colors.darkGray,
        bottom: Colors.white,
      }),
    );
  }, []);

  useEffect(() => {
    console.log(leaderboard)
  }, [])

  if (state === loadingStateEnum.success) {
    return (
      <View style={{width, height}}>
        <BackButton to='/commissions'/>
        <View style={{
          width,
          height: height * 0.1,
          backgroundColor: Colors.darkGray,
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Text
            style={{
              fontFamily: 'BukhariScript',
              fontSize: 25,
              color: Colors.white,
            }}
          >
            Leaderboard
          </Text>
        </View>
        <FlatList
          data={leaderboard}
          renderItem={(user) => (
            <View style={{backgroundColor: Colors.white, flexDirection: 'row', padding: 10, margin: 10, borderRadius: 15}}>
              {user.index < 3 ?
                <MedalIcon width={14} height={14} color='#FFD700' style={{marginTop: 'auto', marginBottom: 'auto', marginRight: 2}}/>:null
              }
              <Text style={{marginRight: 3, fontFamily: 'Roboto'}}>#{user.index + 1} {user.item.name}</Text>
              <Text style={{fontFamily: 'Roboto-Bold'}}>{user.item.points}</Text>
            </View>
          )}
          style={{width, backgroundColor: Colors.lightGray}}
        />
      </View>
    )
  }

  if (state === loadingStateEnum.loading) {
    return (
      <View>
        <ProgressView width={14} height={14}/>
        <Text>Loading</Text>
      </View>
    )
  }

  return (
    <View>
      <Text>Something has gone wrong</Text>
    </View>
  )
}