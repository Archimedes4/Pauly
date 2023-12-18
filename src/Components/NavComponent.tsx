/*
  Pauly
  Andrew Mainella
  November 9 2023
  NavComponent.tsx
  renders svg given width and height for native devices. Uses react-native-svg
*/
import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import { Image, StyleSheet, View, Pressable, Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import store, { RootState } from '../Redux/store';
import {
  BookIcon,
  CalendarIcon,
  GovernmentIcon,
  HomeIcon,
  MedalIcon,
  PersonIcon,
  StudentSearchIcon,
} from './Icons';
import { expandedModeSlice } from '../Redux/reducers/expandedModeReducer';
import { isShowingProfileBlockSlice } from '../Redux/reducers/isShowingProfileBlockReducer';
import { Colors } from '../types';
import { Link } from 'expo-router';

function NavBarBlock({
  des,
  expandedMode,
  blockLength,
  children,
  text,
  width,
  setIsExpandedMode,
}: {
  des: string;
  expandedMode: boolean;
  blockLength: number;
  text: string;
  children: ReactNode;
  width: number;
  setIsExpandedMode: () => void;
}) {
  const [isHover, setIsHover] = useState<boolean>(false);
  return (
    <Link href={des}>
      <Pressable
        style={{
          height: blockLength,
          width: expandedMode ? width * 2.5 : width,
          backgroundColor: isHover ? Colors.darkGray : 'transparent',
          alignItems: 'center',
        }}
        onHoverIn={() => {
          setIsHover(true);
          setIsExpandedMode();
        }}
        onHoverOut={() => {
          setIsHover(false);
        }}
      >
        <View
          style={[
            styles.LinkStyle,
            {
              height: blockLength,
              width: expandedMode ? blockLength * 2.5 : blockLength,
              margin: 0,
              position: expandedMode ? 'absolute' : 'relative',
              left: expandedMode ? (width - blockLength) / 2 : undefined,
              alignItems: 'center',
            },
          ]}
        >
          <View
            id="ViewHigh"
            style={{
              width: expandedMode ? blockLength * 2.5 : blockLength,
              flexDirection: 'row',
              margin: 'auto',
              padding: 0,
              alignItems: 'center',
              alignContent: 'center',
              justifyContent: 'center',
            }}
          >
            <View
              style={[
                {
                  height: blockLength,
                  width: blockLength,
                  position: expandedMode ? 'absolute' : 'relative',
                  left: expandedMode ? 0 : undefined,
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
                  position: 'absolute',
                  left: blockLength,
                  color: Colors.white,
                  marginLeft: 8,
                }}
              >
                {text}
              </Text>
            ) : null}
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

export default function NavBarComponent({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
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
    if (width * 0.6 > (height * 0.6) / 8) {
      setBlockLength((height * 0.6) / 8);
    } else {
      setBlockLength(width * 0.6);
    }
    if (width * 0.7 > (height * 0.7) / 8) {
      setIconLength((height * 0.6) / 8);
    } else {
      setIconLength(width * 0.5);
    }
  }, [width, height]);

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
          width: expandedMode ? width * 2.5 : width,
          alignItems: 'center',
        }}
      >
        <Pressable
          style={[
            styles.LinkStyle,
            {
              height: blockLength,
              width: expandedMode ? width * 2.5 : width,
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
              width: expandedMode ? blockLength * 2.5 : blockLength,
              height: blockLength,
              position: expandedMode ? 'absolute' : 'relative',
              left: expandedMode ? (width - blockLength) / 2 : undefined,
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
              <Text
                style={{
                  fontFamily: 'Gochi-Hand',
                  color: Colors.white,
                  position: 'absolute',
                  top: blockLength * 0.3,
                  left: blockLength * 0.65,
                  fontSize: blockLength * 0.7,
                  textShadowColor: 'rgba(0, 0, 0, 1)',
                  textShadowOffset: { width: 4, height: 2 },
                  textShadowRadius: 0,
                }}
                selectable={false}
              >
                auly
              </Text>
            ) : null}
          </View>
        </Pressable>
        <NavBarBlock
          des="/notifications"
          expandedMode={expandedMode}
          blockLength={blockLength}
          text="Notifications"
          width={width}
          setIsExpandedMode={() => {
            dispatch(expandedModeSlice.actions.setExpandedMode(true));
          }}
        >
          <HomeIcon width={iconLength} height={iconLength} />
        </NavBarBlock>
        <NavBarBlock
          des="/resources"
          expandedMode={expandedMode}
          blockLength={blockLength}
          text="Resources"
          width={width}
          setIsExpandedMode={() => {
            dispatch(expandedModeSlice.actions.setExpandedMode(true));
          }}
        >
          <BookIcon width={iconLength} height={iconLength} />
        </NavBarBlock>
        <NavBarBlock
          des="/commissions"
          expandedMode={expandedMode}
          blockLength={blockLength}
          text="Commissions"
          width={width}
          setIsExpandedMode={() => {
            dispatch(expandedModeSlice.actions.setExpandedMode(true));
          }}
        >
          <MedalIcon width={iconLength} height={iconLength} />
        </NavBarBlock>
        <NavBarBlock
          des="/calendar"
          expandedMode={expandedMode}
          blockLength={blockLength}
          text="Calendar"
          width={width}
          setIsExpandedMode={() => {
            dispatch(expandedModeSlice.actions.setExpandedMode(true));
          }}
        >
          <CalendarIcon width={iconLength} height={iconLength} />
        </NavBarBlock>
        <NavBarBlock
          des="/sports"
          expandedMode={expandedMode}
          blockLength={blockLength}
          text="Sports"
          width={width}
          setIsExpandedMode={() => {
            dispatch(expandedModeSlice.actions.setExpandedMode(true));
          }}
        >
          <Image
            source={require('../../assets/images/Football.png')}
            resizeMode="contain"
            style={{ width: iconLength, height: iconLength }}
          />
        </NavBarBlock>
        <NavBarBlock
          des="/students"
          expandedMode={expandedMode}
          blockLength={blockLength}
          text="Students"
          width={width}
          setIsExpandedMode={() => {
            dispatch(expandedModeSlice.actions.setExpandedMode(true));
          }}
        >
          <StudentSearchIcon width={iconLength} height={iconLength} />
        </NavBarBlock>
        {isGovernmentMode ? (
          <NavBarBlock
            des="/government"
            expandedMode={expandedMode}
            blockLength={blockLength}
            text="Government"
            width={width}
            setIsExpandedMode={() => {
              dispatch(expandedModeSlice.actions.setExpandedMode(true));
            }}
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
              width: expandedMode ? blockLength * 2.5 : blockLength,
              margin: 0,
              position: 'absolute',
              left: expandedMode ? (width - blockLength) / 2 : undefined,
              bottom: height * 0.05,
            },
          ]}
        >
          <View
            style={{
              width: expandedMode ? blockLength * 2.5 : blockLength,
              height: iconLength,
              position: expandedMode ? 'absolute' : 'relative',
              left: expandedMode ? 0 : undefined,
              flexDirection: 'row',
            }}
          >
            {uri !== '' ? (
              <Image
                source={{ uri }}
                style={{
                  width: iconLength,
                  height: iconLength,
                  borderRadius: iconLength / 2,
                }}
              />
            ) : (
              <PersonIcon width={iconLength} height={iconLength} />
            )}
            <View
              style={{
                height: iconLength,
                alignContent: 'center',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: blockLength - iconLength,
              }}
            >
              {expandedMode ? (
                <Text
                  adjustsFontSizeToFit
                  numberOfLines={1}
                  style={{
                    color: Colors.white,
                    marginLeft: 8,
                    width: blockLength * 2.5,
                  }}
                  selectable={false}
                >
                  {displayName}
                </Text>
              ) : null}
            </View>
          </View>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  LinkStyle: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 'auto',
  },
});
