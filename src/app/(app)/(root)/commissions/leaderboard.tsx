import { View, Text, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Colors, loadingStateEnum } from '@constants'
import ProgressView from '@components/ProgressView'
import { useSelector } from 'react-redux'
import store, { RootState } from '@redux/store'
import { safeAreaColorsSlice } from '@redux/reducers/safeAreaColorsReducer'
import BackButton from '@components/BackButton'
import { getLeaderboard } from '@redux/reducers/leaderboardReducer'
import { MedalIcon } from '@components/Icons'

export function LeaderboardBody({commissionId}:{commissionId?: string}) {
  const { height, width, currentBreakPoint } = useSelector(
    (state: RootState) => state.dimensions,
  );
  const { state, leaderboard } = useSelector(
    (state: RootState) => state.leaderboard,
  );
  const [topThree, setTopThree] = useState<leaderboardUserType[]>([])
  useEffect(() => {
    getLeaderboard(commissionId)
  }, [])

  useEffect(() => {
    let newTopThree = []
    if (leaderboard.length >= 1) {
      newTopThree.push(leaderboard[0])
    }
    if (leaderboard.length >= 2) {
      newTopThree.push(leaderboard[1])
    }
    if (leaderboard.length >= 3) {
      newTopThree.push(leaderboard[2])
    }
    setTopThree(newTopThree)
    console.log(leaderboard, (leaderboard.length < 3) ? leaderboard.length:3)
    console.log((leaderboard.length >= 4) ? [...leaderboard.slice(3, -1)]:[])
  }, [leaderboard])

  useEffect(() => {
    store.dispatch(
      safeAreaColorsSlice.actions.setSafeAreaColors({
        top: Colors.darkGray,
        bottom: Colors.white,
      }),
    );
  }, []);

  if (state === loadingStateEnum.success) {
    return (
      <View style={{width, height}}>
        <BackButton to={commissionId ? `/commissions/${commissionId}`:'/commissions'}/>
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
          data={(leaderboard.length >= 4) ? [...leaderboard.slice(3, -1)]:[]}
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
          ListHeaderComponent={() => (
            <View style={{flexDirection: 'row', height: height * 0.3}}>
              <View style={{height: height * 0.1, width: width * 0.2, backgroundColor: '#CD7F32', marginTop: 'auto', marginLeft: 'auto'}}>
                {topThree.length >= 3 ?
                  <>
                    <Text>{topThree[2].name}</Text>
                  </>:null
                }
              </View>
              <View style={{height: height * 0.3, width: width * 0.2, backgroundColor: '#FFD700', marginTop: 'auto'}}>
                {topThree.length >= 1 ?
                  <>
                    <Text>{topThree[0].name}</Text>  
                  </>:null
                }
              </View>
              <View style={{height: height * 0.2, width: width * 0.2, backgroundColor: '#C0C0C0', marginTop: 'auto', marginRight: 'auto'}}>
                {topThree.length >= 2 ?
                  <>
                    <Text>{topThree[1].name}</Text>  
                  </>:null
                }
              </View>
            </View>
          )}
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

export default function Leaderboard() {
  return (
    <LeaderboardBody />
  )
}