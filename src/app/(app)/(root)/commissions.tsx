import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  Text,
  View,
  Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import CommissionsView from '@components/Commissions/CommissionsView';
import { commissionsSlice } from '@Redux/reducers/commissionsReducer';
import { RootState } from '@Redux/store';
import { safeAreaColorsSlice } from '@Redux/reducers/safeAreaColorsReducer';
import createUUID from '@Functions/ultility/createUUID';
import getPoints from '@Functions/commissions/getPoints';
import getCommissions from '@Functions/commissions/getCommissions';
import ProgressView from '@components/ProgressView';
import BackButton from '@components/BackButton';
import { Colors, loadingStateEnum } from '@src/types';

function PickerPiece({
  text,
  isHoverPicker,
  setIsHoverPicker,
  onPress,
}: {
  text: string;
  onPress: () => void;
  isHoverPicker: boolean;
  setIsHoverPicker: (item: boolean) => void;
}) {
  const { height, width, currentBreakPoint } = useSelector(
    (state: RootState) => state.dimentions,
  );
  const [isSelected, setIsSelected] = useState<boolean>(false);
  function getPickerWidth(isInner: boolean): number {
    if (isSelected && currentBreakPoint >= 2) {
      return isInner ? width * 0.28 : width * 0.3;
    }
    if (isSelected) {
      return isInner ? width * 0.46 : width * 0.6;
    }
    if (currentBreakPoint >= 2) {
      return isInner ? width * 0.18 : width * 0.2;
    }
    return isInner ? width * 0.36 : width * 0.4;
  }
  return (
    <Pressable
      onPress={() => {
        onPress();
      }}
      onHoverIn={() => {
        setIsHoverPicker(true);
        setIsSelected(true);
      }}
      onHoverOut={() => setIsSelected(false)}
      style={{
        height: isHoverPicker ? height * 0.1 : height * 0.05,
        width: getPickerWidth(false),
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          height: isHoverPicker ? height * 0.06 : height * 0.03,
          width: getPickerWidth(true),
          marginLeft: currentBreakPoint >= 2 ? width * 0.01 : width * 0.02,
          marginRight: currentBreakPoint >= 2 ? width * 0.01 : width * 0.02,
          backgroundColor: Colors.darkGray,
          borderRadius: 15,
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: Colors.white }}>{text}</Text>
      </View>
    </Pressable>
  );
}

function CommissionPoints() {
  const { points } = useSelector((state: RootState) => state.commissions);
  return (
    <View
      style={{
        flexDirection: 'row',
        margin: 10,
        backgroundColor: Colors.maroon,
        borderRadius: 15,
        shadowOffset: { width: 2, height: 3 },
      }}
    >
      <View style={{ margin: 10, flexDirection: 'row' }}>
        <Image
          source={require('assets/images/PaulyLogo.png')}
          resizeMode="contain"
          style={{ width: 50, height: 50 }}
        />
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={{
            fontSize: 45,
            color: Colors.white,
            fontFamily: 'BukhariScript',
            width: 100,
            paddingLeft: 10,
          }}
        >
          {points}
        </Text>
      </View>
    </View>
  );
}

export default function Commissions() {
  const { height, width, currentBreakPoint } = useSelector(
    (state: RootState) => state.dimentions,
  );
  const { commissionNextLink } = useSelector(
    (state: RootState) => state.commissions,
  );
  const { currentCommissions, selectedCommission, commissionsState, points } =
    useSelector((state: RootState) => state.commissions);

  const [isHoverPicker, setIsHoverPicker] = useState<boolean>(false);

  const dispatch = useDispatch();

  // Loading States

  const loadData = useCallback(async () => {
    const pointResult = await getPoints();
    if (
      pointResult.result === loadingStateEnum.success &&
      pointResult.data !== undefined
    ) {
      dispatch(commissionsSlice.actions.setPoints(pointResult.data));
      const commissionsResult = await getCommissions();
      if (
        (commissionsResult.result === loadingStateEnum.success,
        commissionsResult.data !== undefined)
      ) {
        dispatch(
          commissionsSlice.actions.setCurrentCommissions(
            commissionsResult.data,
          ),
        );
      }
      dispatch(
        commissionsSlice.actions.setCommissionNextLink(
          commissionsResult.nextLink,
        ),
      );
      dispatch(
        commissionsSlice.actions.setCommissionsState(commissionsResult.result),
      );
    } else {
      dispatch(
        commissionsSlice.actions.setCommissionsState(pointResult.result),
      );
    }
    // TO DO pagination
  }, [dispatch]);

  async function loadCommissionData(
    startDate?: { date: Date; filter: 'ge' | 'le' },
    endDate?: { date: Date; filter: 'ge' | 'le' },
    claimed?: boolean,
    nextLink?: string,
  ) {
    dispatch(
      commissionsSlice.actions.setCommissionsState(loadingStateEnum.loading),
    );
    const result = await getCommissions(nextLink, startDate, endDate, claimed);
    if (
      result.result === loadingStateEnum.success &&
      result.data !== undefined
    ) {
      dispatch(commissionsSlice.actions.setCurrentCommissions(result.data));
    }
    dispatch(commissionsSlice.actions.setCommissionsState(result.result));
    dispatch(commissionsSlice.actions.setCommissionNextLink(result.nextLink));
  }

  useEffect(() => {
    dispatch(
      safeAreaColorsSlice.actions.setSafeAreaColors({
        top: Colors.darkGray,
        bottom: Colors.white,
      }),
    );
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const [fontsLoaded] = useFonts({
    // eslint-disable-next-line global-require
    BukhariScript: require('assets/fonts/BukhariScript.ttf'),
  });

  useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <View style={{ width, height, backgroundColor: Colors.white }}>
        <View
          style={{
            width,
            height: height * 0.1,
            backgroundColor: Colors.darkGray,
            alignContent: 'center',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {currentBreakPoint <= 0 ? <BackButton to="/home" /> : null}
          <Text
            style={{
              fontFamily: 'BukhariScript',
              fontSize: 25,
              color: Colors.white,
            }}
          >
            Commissions
          </Text>
        </View>
        <View style={{ height: isHoverPicker ? height * 0.8 : height * 0.85 }}>
          {commissionsState === loadingStateEnum.loading ? (
            <View
              style={{
                width,
                height: height * 0.9,
                alignContent: 'center',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ProgressView
                width={width < height ? width * 0.1 : height * 0.1}
                height={width < height ? width * 0.1 : height * 0.1}
              />
              <Text>Loading</Text>
            </View>
          ) : (
            <View>
              {commissionsState === loadingStateEnum.success ? (
                <FlatList
                  style={{ height: height * 0.9 }}
                  data={currentCommissions}
                  renderItem={({ item }) => (
                    <Pressable
                      onPress={() => {
                        dispatch(
                          commissionsSlice.actions.setSelectedCommission(
                            item.commissionId,
                          ),
                        );
                      }}
                      key={`Link_${item.commissionId}`}
                      style={{ backgroundColor: 'transparent' }}
                    >
                      <View
                        key={item.commissionId}
                        style={{
                          borderRadius: 15,
                          marginLeft: width * 0.025,
                          elevation: 2,
                          marginRight: width * 0.025,
                          marginTop: height * 0.02,
                          backgroundColor: Colors.white,
                          shadowColor: 'black',
                          shadowOffset: { width: 1, height: 1 },
                          shadowOpacity: 1,
                          shadowRadius: 5,
                        }}
                      >
                        <View style={{ margin: 10 }}>
                          <Text>{item.title}</Text>
                          {item.timed && item.startDate !== undefined ? (
                            <Text>
                              {new Date('en-US').toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                minute: 'numeric',
                              })}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                    </Pressable>
                  )}
                  keyExtractor={item => `${item?.commissionId}_${createUUID()}`}
                  onEndReachedThreshold={1}
                  onEndReached={() => {
                    if (commissionNextLink !== undefined) {
                      loadCommissionData(
                        undefined,
                        undefined,
                        undefined,
                        commissionNextLink,
                      );
                    }
                  }}
                  initialNumToRender={currentCommissions.length}
                  ListHeaderComponent={() => <CommissionPoints />}
                />
              ) : (
                <View>
                  <Text>Failed</Text>
                </View>
              )}
            </View>
          )}
        </View>
        <Pressable
          style={{ height: isHoverPicker ? height * 0.1 : height * 0.05 }}
          onHoverIn={() => {
            setIsHoverPicker(true);
          }}
          onHoverOut={() => {
            setIsHoverPicker(false);
          }}
        >
          <ScrollView
            horizontal
            style={{
              height: isHoverPicker ? height * 0.1 : height * 0.05,
              width,
              backgroundColor: Colors.white,
            }}
            showsHorizontalScrollIndicator={false}
          >
            <PickerPiece
              text="All"
              onPress={() => {
                loadCommissionData();
              }}
              isHoverPicker={isHoverPicker}
              setIsHoverPicker={setIsHoverPicker}
            />
            <PickerPiece
              text="Current"
              onPress={() => {
                loadCommissionData(
                  { date: new Date(), filter: 'ge' },
                  { date: new Date(), filter: 'le' },
                );
              }}
              isHoverPicker={isHoverPicker}
              setIsHoverPicker={setIsHoverPicker}
            />
            <PickerPiece
              text="Past"
              onPress={() => {
                loadCommissionData(
                  { date: new Date(), filter: 'le' },
                  { date: new Date(), filter: 'le' },
                );
              }}
              isHoverPicker={isHoverPicker}
              setIsHoverPicker={setIsHoverPicker}
            />
            <PickerPiece
              text="Claimed"
              onPress={() => {
                loadCommissionData(undefined, undefined, true);
              }}
              isHoverPicker={isHoverPicker}
              setIsHoverPicker={setIsHoverPicker}
            />
            <PickerPiece
              text="Future"
              onPress={() => {
                loadCommissionData(undefined, {
                  date: new Date(),
                  filter: 'ge',
                });
              }}
              isHoverPicker={isHoverPicker}
              setIsHoverPicker={setIsHoverPicker}
            />
          </ScrollView>
        </Pressable>
      </View>
      <View
        style={{
          position: 'absolute',
          zIndex: 2,
          top: height * 0.1,
          left: width * 0.05,
        }}
      >
        {selectedCommission !== '' ? (
          <CommissionsView
            id={selectedCommission}
            onClose={() =>
              dispatch(commissionsSlice.actions.setSelectedCommission(''))
            }
          />
        ) : null}
      </View>
    </>
  );
}
