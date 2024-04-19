/*
  Pauly
  Andrew Mainella
  November 9 2023
  NavComponent.tsx
  renders svg given width and height for native devices. Uses react-native-svg
*/
import React, { ReactNode, useEffect, useState } from 'react';
import { Image, StyleSheet, View, Pressable, Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import store, { RootState } from '@redux/store';
import { expandedModeSlice } from '@redux/reducers/expandedModeReducer';
import { isShowingProfileBlockSlice } from '@redux/reducers/isShowingProfileBlockReducer';
import { Colors } from '@constants';
import {
  CalendarIcon,
  GovernmentIcon,
  HomeIcon,
  MedalIcon,
  PersonIcon,
} from './Icons';

function NavBarBlock({
  des,
  blockLength,
  children,
  text,
}: {
  des: string;
  blockLength: number;
  text: string;
  children: ReactNode;
}) {
  const { totalWidth } = useSelector((state: RootState) => state.dimensions);
  const [isHover, setIsHover] = useState<boolean>(false);
  const expandedMode = useSelector((state: RootState) => state.expandedMode);
  const dispatch = useDispatch();
  const router = useRouter();
  return (
    <Pressable
      style={{
        height: blockLength,
        width: expandedMode ? totalWidth * 0.25 : totalWidth * 0.1,
        backgroundColor: isHover ? Colors.darkGray : 'transparent',
        alignItems: expandedMode ? 'flex-start' : 'center',
        overflow: 'hidden',
        margin: 0,
        flexDirection: expandedMode ? 'row' : 'column',
      }}
      onHoverIn={() => {
        setIsHover(true);
        dispatch(expandedModeSlice.actions.setExpandedMode(true));
      }}
      onHoverOut={() => {
        setIsHover(false);
      }}
      onPress={() => {
        router.push(des);
      }}
    >
      <View
        style={[
          {
            height: blockLength,
            width: blockLength,
            position: 'relative',
            marginLeft: expandedMode
              ? (totalWidth * 0.1 - blockLength) / 2
              : undefined,
            alignItems: 'center',
            justifyContent: 'center',
          },
        ]}
      >
        <>{children}</>
      </View>
      {expandedMode ? (
        <Text
          style={{
            color: Colors.white,
            margin: 0,
            marginLeft: 8,
            fontFamily: 'Roboto',
            marginTop: 'auto',
            marginBottom: 'auto',
          }}
        >
          {text}
        </Text>
      ) : null}
    </Pressable>
  );
}

export default function NavBarComponent() {
  const { height, totalWidth } = useSelector(
    (state: RootState) => state.dimensions,
  );
  const { uri, displayName } = useSelector(
    (state: RootState) => state.microsoftProfileData,
  );
  const expandedMode = useSelector((state: RootState) => state.expandedMode);
  const [blockLength, setBlockLength] = useState<number>(0);
  const [iconLength, setIconLength] = useState<number>(0);
  const dispatch = useDispatch();
  const isGovernmentMode = useSelector(
    (state: RootState) => state.isGovernmentMode,
  );

  useEffect(() => {
    // checking to see if the width or the height is going to be the limiting factor.
    if (totalWidth * 0.06 > (height * 0.6) / 8) {
      setBlockLength((height * 0.6) / 8);
    } else {
      setBlockLength(totalWidth * 0.06);
    }
    if (totalWidth * 0.07 > (height * 0.7) / 8) {
      setIconLength((height * 0.6) / 8);
    } else {
      setIconLength(totalWidth * 0.05);
    }
  }, [totalWidth, height]);

  return (
    <Pressable
      id="Pressable"
      onHoverIn={() => {
        dispatch(expandedModeSlice.actions.setExpandedMode(true));
      }}
      onHoverOut={() => {
        dispatch(expandedModeSlice.actions.setExpandedMode(false));
      }}
    >
      <View
        id="Main"
        style={{
          backgroundColor: Colors.maroon,
          height,
          overflow: 'hidden',
          width: expandedMode ? totalWidth * 0.25 : totalWidth * 0.1,
          alignItems: 'center',
        }}
      >
        <Pressable
          style={[
            styles.LinkStyle,
            {
              height: blockLength,
              width: expandedMode ? totalWidth * 0.25 : totalWidth * 0.1,
              margin: 0,
              marginTop: blockLength * 0.4,
              marginBottom: blockLength * 0.4,
            },
          ]}
          onPress={() => {
            dispatch(expandedModeSlice.actions.setExpandedMode(!expandedMode));
          }}
          onHoverIn={() => {
            dispatch(expandedModeSlice.actions.setExpandedMode(true));
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              width: expandedMode ? blockLength * 0.25 : blockLength,
              height: blockLength,
              position: expandedMode ? 'absolute' : 'relative',
              left: expandedMode
                ? (totalWidth * 0.1 - blockLength) / 2
                : undefined,
            }}
            pointerEvents="none"
          >
            <View
              style={{
                position: expandedMode ? 'absolute' : 'relative',
                left: expandedMode ? 0 : undefined,
              }}
            >
              <Image
                source={require('../../assets/images/PaulyLogo.png')}
                resizeMode="contain"
                style={{ width: blockLength, height: blockLength }}
              />
            </View>
            {expandedMode ? (
              <>
                <Text
                  style={{
                    fontFamily: 'Gochi-Hand',
                    color: Colors.white,
                    position: 'absolute',
                    top: blockLength * 0.3,
                    left: blockLength * 0.65,
                    fontSize: blockLength * 0.75,

                    textShadowColor: 'rgba(0, 0, 0, 1)',
                    textShadowOffset: { width: 4, height: 2 },
                    textShadowRadius: 0,
                  }}
                  selectable={false}
                >
                  auly
                </Text>
                <View
                  style={{
                    backgroundColor: Colors.darkGray,
                    position: 'absolute',
                    top: blockLength * 0.9,
                    left: blockLength * 0.3,
                    borderRadius: 30,
                    zIndex: -10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: blockLength * 0.25,
                      margin: 5,
                      marginLeft: 15,
                      marginRight: 15,
                      color: Colors.white,
                    }}
                  >
                    Beta
                  </Text>
                </View>
              </>
            ) : null}
          </View>
        </Pressable>
        <NavBarBlock des="/" blockLength={blockLength + 10} text="Home">
          <HomeIcon width={iconLength} height={iconLength} />
        </NavBarBlock>
        <NavBarBlock
          des="/commissions"
          blockLength={blockLength + 10}
          text="Commissions"
        >
          <MedalIcon width={iconLength} height={iconLength} />
        </NavBarBlock>
        <NavBarBlock des="/calendar" blockLength={blockLength + 10} text="Calendar">
          <CalendarIcon width={iconLength} height={iconLength} />
        </NavBarBlock>
        {isGovernmentMode ? (
          <NavBarBlock
            des="/government"
            blockLength={blockLength + 10}
            text="Government"
          >
            <GovernmentIcon width={iconLength} height={iconLength} />
          </NavBarBlock>
        ) : null}
        <Pressable
          onHoverIn={() => {
            dispatch(expandedModeSlice.actions.setExpandedMode(true));
          }}
          onPress={() => {
            dispatch(
              isShowingProfileBlockSlice.actions.setIsShowingProfileBlock(
                !store.getState().isShowingProfileBlock,
              ),
            );
          }}
          style={[
            styles.LinkStyle,
            {
              height: blockLength,
              width: expandedMode ? totalWidth * 0.25 : totalWidth * 0.1,
              margin: 0,
              position: 'absolute',
              bottom: height * 0.05,
              flexDirection: 'row',
            },
          ]}
        >
          {uri !== '' ? (
            <View
              style={{
                width: blockLength,
                height: blockLength,
                marginLeft: expandedMode
                  ? (totalWidth * 0.1 - blockLength) / 2
                  : undefined,
              }}
            >
              <Image
                source={{ uri }}
                style={{
                  width: iconLength,
                  height: iconLength,
                  borderRadius: iconLength / 2,
                  overflow: 'hidden',
                }}
              />
            </View>
          ) : (
            <PersonIcon
              width={iconLength}
              height={iconLength}
              style={{
                width: blockLength,
                height: blockLength,
                marginLeft: expandedMode
                  ? (totalWidth * 0.1 - blockLength) / 2
                  : undefined,
              }}
            />
          )}
          {expandedMode ? (
            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={{
                color: Colors.white,
                marginLeft: 8,
                width: blockLength * 2.5,
                marginRight: 'auto',
              }}
              selectable={false}
            >
              {displayName}
            </Text>
          ) : null}
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  LinkStyle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
