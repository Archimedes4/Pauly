import { View, Text, FlatList, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Colors, loadingStateEnum } from '@constants'
import ProgressView from '@components/ProgressView'
import { useSelector } from 'react-redux'
import store, { RootState } from '@redux/store'
import { safeAreaColorsSlice } from '@redux/reducers/safeAreaColorsReducer'
import BackButton from '@components/BackButton'
import { getLeaderboard } from '@redux/reducers/leaderboardReducer'
import callMsGraph from '@src/utils/ultility/microsoftAssests'
import { PersonIcon } from '@components/Icons'

function UserImage({id}:{id: string}) {
  const { height, width } = useSelector(
    (state: RootState) => state.dimensions,
  );
  const [state, setState] = useState<loadingStateEnum>(loadingStateEnum.loading)
  const [uri, setUri] = useState<string>("")

  function getLength(srcWidth: number, srcHeight: number) {
    if ((srcWidth * 0.3) < (srcHeight * 0.1 - 10)) {
      return srcWidth * 0.3
    }
    return srcHeight * 0.1 - 10
  }

  async function getProfilePicture() {
    const result = await callMsGraph(
      `https://graph.microsoft.com/v1.0/users/${id}/photo/$value`,
      'GET',
    );
    // Checking if success
    if (result.ok) {
      const dataBlob = await result.blob();
      const urlOut = URL.createObjectURL(dataBlob);
      setUri(urlOut)
      setState(loadingStateEnum.success)
    } else {
      setState(loadingStateEnum.failed)
    }
  }

  useEffect(() => {
    getProfilePicture()
  }, [])

  if (state === loadingStateEnum.loading) {
    return (
      <View style={{ paddingTop: 5, paddingBottom: 5, marginTop: 'auto'}}>
        <ProgressView width={14} height={14} style={{margin: 'auto', width: getLength(width, height), height: getLength(width, height)}}/>
      </View>
    )
  }

  if (state === loadingStateEnum.success) {
    return (
      <View style={{paddingTop: 5, paddingBottom: 5}}>
        <Image source={{uri}} style={{width: getLength(width, height), height: getLength(width, height), margin: 'auto', borderRadius: getLength(width, height)/2}}/>
      </View>
    )
  }
  return (
    // This view actually makes a difference not just about the margin
    <View style={{paddingTop: 5, paddingBottom: 5, marginTop: 'auto'}}>
      <PersonIcon width={100} height={100} style={{width: getLength(width, height), height: getLength(width, height), margin: 'auto'}}/>
    </View>
  )
}

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
              <Text style={{marginRight: 3, fontFamily: 'Roboto'}}>#{user.index + 1} {user.item.name}</Text>
              <Text style={{fontFamily: 'Roboto-Bold'}}>{user.item.points}</Text>
            </View>
          )}
          style={{width, backgroundColor: Colors.lightGray}}
          ListHeaderComponent={() => (
            <>
              <View style={{flexDirection: 'row', height: height * 0.3, marginTop: height * 0.025}}>
                <View style={{width: width * 0.2, height: height * 0.3, marginLeft: 'auto'}}>
                  {topThree.length >= 3 ?
                    <>
                      <UserImage id={topThree[2].id}/>
                    </>:null
                  }
                  <View style={{height: height * 0.1, width: width * 0.2, backgroundColor: '#CD7F32', marginTop: topThree.length >= 3 ? 0:'auto'}}>
                    {topThree.length >= 3 ?
                      <>
                        <Text style={{marginLeft: 'auto', marginRight: 'auto', fontFamily: 'Roboto-Bold', textAlign: 'center'}}>{topThree[2].name}</Text>
                      </>:null
                    }
                  </View>
                </View>
                <View style={{width: width * 0.2, height: height * 0.3}}>
                  {topThree.length >= 1 ?
                    <>
                      <UserImage id={topThree[0].id}/>
                    </>:null
                  }
                  <View style={{height: height * 0.2, width: width * 0.2, backgroundColor: '#FFD700', marginLeft: 'auto', marginTop: topThree.length >= 1 ? 0:'auto'}}>
                    {topThree.length >= 1 ?
                      <>
                        <Text style={{marginLeft: 'auto', marginRight: 'auto', fontFamily: 'Roboto-Bold', textAlign: 'center'}}>{topThree[0].name}</Text>
                      </>:null
                    }
                  </View>
                </View>
                <View style={{width: width * 0.2, height: height * 0.3, marginRight: 'auto', paddingTop: ((height * 0.1) - 110)}}>
                  {topThree.length >= 2 ?
                    <>
                      <UserImage id={topThree[1].id}/>
                    </>:null
                  }
                  <View style={{height: height * 0.15, width: width * 0.2, backgroundColor: '#C0C0C0', marginLeft: 'auto', marginTop: topThree.length >= 2 ? 0:'auto'}}>
                    {topThree.length >= 2 ?
                      <>
                        <Text style={{marginLeft: 'auto', marginRight: 'auto', fontFamily: 'Roboto-Bold', textAlign: 'center'}}>{topThree[1].name}</Text>
                      </>:null
                    }
                  </View>
                </View>
              </View>
              <View style={{width: width * 0.7, height: 4, borderRadius: 15, backgroundColor: Colors.black, marginLeft: 'auto', marginRight: 'auto'}}/>
            </>
          )}
        />
      </View>
    )
  }

  if (state === loadingStateEnum.loading) {
    return (
      <View style={{width, height, alignContent: 'center', alignItems: 'center', justifyContent: 'center'}}>
        { currentBreakPoint === 0 ?
          <BackButton to={'/commissions'} />:null
        }
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