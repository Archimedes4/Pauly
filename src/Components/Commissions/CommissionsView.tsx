import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import store, { RootState } from '@redux/store';
import CommissionClaim from '@components/Commissions/CommissionClaim';
import callMsGraph from '@utils/ultility/microsoftAssests';
import ProgressView from '@components/ProgressView';
import { CloseIcon } from '@components/Icons';
import WebViewCross from '@components/WebViewCross';
import { Colors, commissionTypeEnum, loadingStateEnum } from '@constants';
import { Link, router } from 'expo-router';
import calculateFontSize from '@utils/ultility/calculateFontSize';
import { getCommission } from '@redux/reducers/commissionsReducer';
import CommissionImageComponent from './CommissionImageComponent';
import CommissionsViewSubmissions from './CommissionsViewSubmissions';
import { safeAreaColorsSlice } from '@src/redux/reducers/safeAreaColorsReducer';

export default function CommissionsView({ id }: { id: string }) {
  const { width, totalHeight } = useSelector((state: RootState) => state.dimensions);
  const [commissionData, setCommissionData] = useState<
    commissionType | undefined
  >(undefined);
  const [commissionState, setCommissionState] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );
  const [messageState, setMessageState] = useState<loadingStateEnum>(
    loadingStateEnum.notStarted,
  );
  const [messageData, setMessageData] = useState<string>('');
  const [imageUri, setImageUri] = useState<string>('');
  const [isOverflowing, setIsOverflowing] = useState<boolean>(false);
  const [evaluatedOverflow, setEvaluatedOverflow] = useState<boolean>(false);

  const [topCompHeight, setTopCompHeight] = useState<number>(0);

  async function getPost(teamId: string, channelId: string, messageId: string) {
    setMessageState(loadingStateEnum.loading);
    const result = await callMsGraph(
      `https://graph.microsoft.com/v1.0/teams/${teamId}/channels/${channelId}/messages/${messageId}`,
    );
    if (result.ok) {
      const data = await result.json();
      setMessageData(data.body.content);
      setMessageState(loadingStateEnum.success);
    } else {
      setMessageState(loadingStateEnum.failed);
    }
  }

  const getCommissionInformation = useCallback(async () => {
    const result = await getCommission(id, store);
    if (result.result === loadingStateEnum.success) {
      setCommissionData(result.data);
      if (result.data?.postData !== undefined) {
        getPost(
          result.data.postData.teamId,
          result.data.postData.channelId,
          result.data.postData.postId,
        );
      }
    }
    setCommissionState(result.result);
  }, [id]);

  useEffect(() => {
    getCommissionInformation();
  }, [getCommissionInformation]);

  useEffect(() => {
    console.log("MARK")
    store.dispatch(safeAreaColorsSlice.actions.setSafeArea({
      top: Colors.darkGray,
      bottom: Colors.maroon,
      isTopTransparent: false,
      isBottomTransparent: false,
      overflowHidden: false
    }))
  }, [])

  if (commissionState === loadingStateEnum.loading) {
    return (
      <View
        style={{
          height: totalHeight * 0.8,
          width: width * 0.9,
          alignItems: 'center',
          justifyContent: 'center',
          alignContent: 'center',
          backgroundColor: Colors.white,
          shadowColor: Colors.black,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.8,
          shadowRadius: 10,
          borderRadius: 15,
          zIndex: 10
        }}
      >
        <ProgressView
          width={width * 0.8 < totalHeight * 0.7 ? width * 0.4 : totalHeight * 0.35}
          height={width * 0.8 < totalHeight * 0.7 ? width * 0.4 : totalHeight * 0.35}
        />
        <Text>Loading</Text>
      </View>
    );
  }

  if (
    commissionState === loadingStateEnum.success &&
    commissionData !== undefined
  ) {
    return (
      <View
        style={{
          height: totalHeight * 0.8,
          width: width * 0.9,
          alignItems: 'center',
          justifyContent: 'center',
          alignContent: 'center',
          backgroundColor: Colors.white,
          shadowColor: Colors.black,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.8,
          shadowRadius: 10,
          borderRadius: 15,
          zIndex: 10
        }}
      >
        <View
          onLayout={e => {
            setTopCompHeight(e.nativeEvent.layout.height);
          }}
        >
          <Pressable
            onPress={() => router.push('/commissions')}
            style={{ marginTop: 10, marginLeft: 0 }}
          >
            <CloseIcon
              width={width < totalHeight ? width * 0.05 : totalHeight * 0.05}
              height={width < totalHeight ? width * 0.05 : totalHeight * 0.05}
            />
          </Pressable>
          <Text
            style={{
              fontSize: calculateFontSize(
                width * 0.8,
                totalHeight * 0.047,
                commissionData.title,
              ),
              fontFamily: 'Comfortaa-Regular',
              marginTop: totalHeight * 0.01,
            }}
          >
            {commissionData.title}
          </Text>
        </View>
        <ScrollView
          style={{
            height: isOverflowing
              ? totalHeight * 0.8 - topCompHeight
              : totalHeight * 0.9 - topCompHeight,
            width: width * 0.9,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View
            onLayout={e => {
              if (e.nativeEvent.layout.height >= totalHeight * 0.6) {
                setIsOverflowing(true);
                setEvaluatedOverflow(true);
              } else if (!evaluatedOverflow) {
                setIsOverflowing(false);
              }
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                margin: 10,
                backgroundColor: Colors.maroon,
                borderRadius: 15,
                shadowOffset: { width: 2, height: 3 },
                width: width * 0.7,
                marginHorizontal: width * 0.1,
              }}
            >
              <View style={{ margin: 10, flexDirection: 'row' }}>
                <Image
                  source={require('../../../assets/images/PaulyLogo.png')}
                  resizeMode="contain"
                  style={{ width: 50, height: 50 }}
                />
                <Text
                  style={{
                    fontSize: 45,
                    color: Colors.white,
                    fontFamily: 'BukhariScript',
                    width: 100,
                    paddingLeft: 10,
                  }}
                >
                  {commissionData.points}
                </Text>
              </View>
            </View>
            <View style={{ marginLeft: width * 0.05 }}>
              <WebViewCross html={messageData} width={width * 0.7} />
            </View>
            {commissionData.value === commissionTypeEnum.Image ||
            commissionData.value === commissionTypeEnum.ImageLocation ? (
              <CommissionImageComponent
                imageUri={imageUri}
                setImageUri={setImageUri}
              />
            ) : null}
            <Link
              href={`/commissions/${id}/leaderboard`}
              style={{
                marginLeft: 'auto',
                marginRight: 'auto',
                backgroundColor: '#ededed',
                width: width * 0.7,
                borderRadius: 15,
                alignItems: 'center',
                alignContent: 'center',
                justifyContent: 'center',
                padding: 10,
                fontFamily: 'Roboto-Bold',
                overflow: 'hidden',
                marginTop: 10,
              }}
            >
              Leaderboard
            </Link>
            <View style={{ width: width * 0.7, marginHorizontal: width * 0.1 }}>
              <Text
                style={{
                  marginTop: 10,
                  marginBottom: 2,
                  fontFamily: 'Roboto-Bold',
                }}
              >
                Your Submissions
              </Text>
              <CommissionsViewSubmissions
                commissionId={commissionData.commissionId}
              />
            </View>
            {isOverflowing ? null : (
              <View style={{ marginTop: 10, marginBottom: 10 }}>
                <CommissionClaim
                  commission={commissionData}
                  imageData={imageUri !== '' ? imageUri : undefined}
                />
              </View>
            )}
          </View>
        </ScrollView>
        {isOverflowing ? (
          <View
            style={{
              height: totalHeight * 0.1,
              alignContent: 'center',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CommissionClaim
              commission={commissionData}
              imageData={imageUri !== '' ? imageUri : undefined}
            />
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <View
      style={{
        width: width * 0.9,
        height: totalHeight * 0.8,
        backgroundColor: Colors.white,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        borderRadius: 15,
      }}
    >
      <Text>Something Went Wrong</Text>
    </View>
  );
}
