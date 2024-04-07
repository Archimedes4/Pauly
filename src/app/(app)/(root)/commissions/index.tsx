/*
  Pauly
  Andrew Mainella
  17 December 2023
  commissions.tsx
  Holds the main commission view. To learn about what commissions are see README
*/
import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View,
  Image,
  FlatList,
  StatusBar,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import CommissionsView from '@components/Commissions/CommissionsView';
import {
  commissionsSlice,
  getCommissions,
} from '@redux/reducers/commissionsReducer';
import store, { RootState } from '@redux/store';
import { safeAreaColorsSlice } from '@redux/reducers/safeAreaColorsReducer';
import getPoints from '@utils/commissions/getPoints';
import ProgressView from '@components/ProgressView';
import BackButton from '@components/BackButton';
import { Colors, loadingStateEnum } from '@constants';
import {
  CurrentIcon,
  FutureIcon,
  MoreIcon,
  PastIcon,
  PiggyBankIcon,
} from '@components/Icons';
import { Link } from 'expo-router';
import StyledButton from '@components/StyledButton';

function PickerPiece({
  text,
  isHoverPicker,
  setIsHoverPicker,
  onPress,
  children,
}: {
  text: string;
  onPress: () => void;
  isHoverPicker: boolean;
  setIsHoverPicker: (item: boolean) => void;
  children: ReactNode;
}) {
  const { height, width, currentBreakPoint } = useSelector(
    (state: RootState) => state.dimensions,
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
          flexDirection: 'row',
        }}
      >
        <>{children}</>
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

function CommissionsBody() {
  const { currentCommissions, commissionsState, commissionNextLink } =
    useSelector((state: RootState) => state.commissions);

  const { height, width } = useSelector((state: RootState) => state.dimensions);

  function getItemCaption(item: commissionType) {
    if (item.timed && item.startDate !== undefined) {
      return new Date('en-US').toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        minute: 'numeric',
      });
    }
    return undefined;
  }

  if (commissionsState === loadingStateEnum.loading) {
    return (
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
    );
  }
  if (commissionsState === loadingStateEnum.success) {
    return (
      <FlatList
        style={{ height: height * 0.9 }}
        data={currentCommissions}
        renderItem={({ item }) => (
          <StyledButton
            key={`Link_${item.commissionId}`}
            to={`/commissions/${item.commissionId}`}
            text={item.title}
            caption={getItemCaption(item)}
            style={{ margin: 10 }}
            mainColor={Colors.white}
          />
        )}
        onEndReachedThreshold={1}
        onEndReached={() => {
          if (commissionNextLink !== undefined) {
            getCommissions({
              nextLink: commissionNextLink,
              store,
            });
          }
        }}
        initialNumToRender={currentCommissions.length}
        ListHeaderComponent={() => (
          <>
            <CommissionPoints />
            <Link
              href="/commissions/leaderboard"
              style={{
                padding: 10,
                backgroundColor: Colors.white,
                margin: 10,
                borderRadius: 15,
                overflow: 'hidden',
              }}
            >
              <Text>Leaderboard</Text>
            </Link>
          </>
        )}
      />
    );
  }
  return (
    <View>
      <Text>Failed</Text>
    </View>
  );
}

export function CommissionsMain({ commissionId }: { commissionId?: string }) {
  const { height, width, currentBreakPoint } = useSelector(
    (state: RootState) => state.dimensions,
  );

  const [isHoverPicker, setIsHoverPicker] = useState<boolean>(false);

  const dispatch = useDispatch();

  // Loading States

  const loadData = useCallback(async () => {
    const pointResult = await getPoints();
    if (pointResult.result === loadingStateEnum.success) {
      dispatch(commissionsSlice.actions.setPoints(pointResult.data));
      getCommissions({ store });
    } else {
      dispatch(
        commissionsSlice.actions.setCommissionsState(pointResult.result),
      );
    }
    // TO DO pagination
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      safeAreaColorsSlice.actions.setSafeAreaColors({
        top: Colors.darkGray,
        bottom: Colors.lightGray,
      }),
    );
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <>
      <StatusBar barStyle="light-content" />
      <View style={{ width, height, backgroundColor: Colors.lightGray }}>
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
          <CommissionsBody />
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
              backgroundColor: Colors.lightGray,
            }}
            showsHorizontalScrollIndicator={false}
          >
            <PickerPiece
              text="All"
              onPress={() => {
                getCommissions({ store });
              }}
              isHoverPicker={isHoverPicker}
              setIsHoverPicker={setIsHoverPicker}
            >
              <MoreIcon
                width={14}
                height={14}
                color={Colors.white}
                style={{ marginRight: 3 }}
              />
            </PickerPiece>
            <PickerPiece
              text="Current"
              onPress={() => {
                getCommissions({
                  store,
                  startDate: { date: new Date(), filter: 'ge' },
                  endDate: { date: new Date(), filter: 'le' },
                });
              }}
              isHoverPicker={isHoverPicker}
              setIsHoverPicker={setIsHoverPicker}
            >
              <CurrentIcon
                width={14}
                height={14}
                color={Colors.white}
                style={{ marginRight: 3 }}
              />
            </PickerPiece>
            <PickerPiece
              text="Past"
              onPress={() => {
                getCommissions({
                  startDate: { date: new Date(), filter: 'le' },
                  endDate: { date: new Date(), filter: 'le' },
                  store,
                });
              }}
              isHoverPicker={isHoverPicker}
              setIsHoverPicker={setIsHoverPicker}
            >
              <PastIcon
                width={14}
                height={14}
                color={Colors.white}
                style={{ marginRight: 3 }}
              />
            </PickerPiece>
            <PickerPiece
              text="Claimed"
              onPress={() => {
                getCommissions({
                  claimed: true,
                  store,
                });
              }}
              isHoverPicker={isHoverPicker}
              setIsHoverPicker={setIsHoverPicker}
            >
              <PiggyBankIcon
                width={14}
                height={14}
                color={Colors.white}
                style={{ marginRight: 3 }}
              />
            </PickerPiece>
            <PickerPiece
              text="Future"
              onPress={() => {
                getCommissions({
                  startDate: {
                    date: new Date(),
                    filter: 'ge',
                  },
                  store,
                });
              }}
              isHoverPicker={isHoverPicker}
              setIsHoverPicker={setIsHoverPicker}
            >
              <FutureIcon
                width={14}
                height={14}
                color={Colors.white}
                style={{ marginRight: 3 }}
              />
            </PickerPiece>
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
        {commissionId !== undefined ? (
          <CommissionsView id={commissionId} />
        ) : null}
      </View>
    </>
  );
}

export default function Commissions() {
  return <CommissionsMain />;
}
