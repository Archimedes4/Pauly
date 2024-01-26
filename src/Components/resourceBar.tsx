/*
  Pauly
  Andrew Mainella
  23 January 2024
  ResourceBar.tsx
  Selection bar in resource menu.
*/
import { View, Text, Pressable } from 'react-native';
import React, { ReactNode, useEffect, useState } from 'react';
import { Colors, resourceMode } from '@constants';
import { resourcesSlice } from '@redux/reducers/resourcesReducer';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  CalendarIcon,
  DocumentIcon,
  DownIcon,
  GraduationHatIcon,
  GymIcon,
  HomeIcon,
  Megaphone,
  NewsIcon,
  SportsIcon,
  UpIcon,
} from './Icons';

function BarPiece({
  children,
  mode,
}: {
  children: ReactNode;
  mode: resourceMode;
}) {
  const dispatch = useDispatch();
  return (
    <Pressable
      onPress={() => {
        dispatch(resourcesSlice.actions.setSelectedResourceMode(mode));
      }}
      style={{
        padding: 10,
      }}
    >
      {children}
    </Pressable>
  );
}

function OpenPiece({
  children,
  mode,
  text,
  onPress,
}: {
  children: ReactNode;
  mode?: resourceMode;
  text: string;
  onPress: () => void;
}) {
  const [isHover, setIsHover] = useState(false);
  const dispatch = useDispatch();
  return (
    <Pressable
      onPress={() => {
        if (mode !== undefined) {
          dispatch(resourcesSlice.actions.setSelectedResourceMode(mode));
        }
        onPress();
      }}
      style={({ pressed }) => [
        {
          padding: 10,
          flexDirection: 'row',
          backgroundColor: pressed ? Colors.lightGray : Colors.white,
        },
      ]}
      onHoverIn={() => setIsHover(true)}
      onHoverOut={() => setIsHover(false)}
    >
      {children}
      <Text style={{ top: 'auto', bottom: 'auto', paddingLeft: 10 }}>
        {text}
      </Text>
    </Pressable>
  );
}

function OpenBar({
  onClose,
  barWidth,
}: {
  onClose: () => void;
  barWidth: number;
}) {
  const { width, height } = useSelector((state: RootState) => state.dimentions);
  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: (width - barWidth) / 2,
        backgroundColor: Colors.white,
        height: height * 0.85,
        width: barWidth,
        borderRadius: 30,
        paddingTop: 20,
      }}
    >
      <OpenPiece mode={resourceMode.home} text="Home" onPress={() => onClose()}>
        <HomeIcon width={25} height={25} />
      </OpenPiece>
      <OpenPiece
        mode={resourceMode.sports}
        text="Sports"
        onPress={() => onClose()}
      >
        <SportsIcon width={25} height={25} />
      </OpenPiece>
      <OpenPiece
        mode={resourceMode.schoolEvents}
        text="Title"
        onPress={() => onClose()}
      >
        <CalendarIcon width={25} height={25} />
      </OpenPiece>
      <OpenPiece
        mode={resourceMode.annoucments}
        text="Announcements"
        onPress={() => onClose()}
      >
        <Megaphone width={25} height={25} />
      </OpenPiece>
      <OpenPiece
        mode={resourceMode.fitness}
        text="Fitness"
        onPress={() => onClose()}
      >
        <GymIcon width={25} height={25} />
      </OpenPiece>
      <OpenPiece
        mode={resourceMode.files}
        text="Files"
        onPress={() => onClose()}
      >
        <DocumentIcon width={25} height={25} />
      </OpenPiece>
      <OpenPiece
        mode={resourceMode.news}
        text="Crusader News"
        onPress={() => onClose()}
      >
        <NewsIcon width={25} height={25} />
      </OpenPiece>
      <OpenPiece
        mode={resourceMode.scholarships}
        text="Scholarships"
        onPress={() => onClose()}
      >
        <GraduationHatIcon width={25} height={25} />
      </OpenPiece>
      <OpenPiece text="Close" onPress={() => onClose()}>
        <DownIcon width={25} height={25} />
      </OpenPiece>
    </View>
  );
}

export default function resourceBar() {
  const [barWidth, setBarWidth] = useState(0);
  const { width } = useSelector((state: RootState) => state.dimentions);
  const [isOpen, setIsOpen] = useState(false);
  const selectedResourceMode = useSelector(
    (state: RootState) => state.resources.selectedResourceMode,
  );

  const pan = useSharedValue(selectedResourceMode * 45);

  const animatedDefault = useAnimatedStyle(() => ({
    transform: [{ translateX: pan.value }],
  }));

  useEffect(() => {
    pan.value = withTiming(selectedResourceMode * 45, {
      duration: 150,
      easing: Easing.linear,
    });
  }, [selectedResourceMode]);

  if (isOpen) {
    return <OpenBar onClose={() => setIsOpen(false)} barWidth={barWidth} />;
  }

  return (
    <Pressable
      onLayout={e => setBarWidth(e.nativeEvent.layout.width)}
      style={{
        flexDirection: 'row',
        backgroundColor: Colors.white,
        position: 'absolute',
        bottom: 10,
        left: (width - barWidth) / 2,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: Colors.black,
      }}
    >
      <Animated.View
        style={[
          animatedDefault,
          {
            position: 'absolute',
            borderRadius: 30,
            width: 45,
            height: 45,
            backgroundColor: Colors.lightGray,
          },
        ]}
      />
      <BarPiece mode={resourceMode.home}>
        <HomeIcon width={25} height={25} />
      </BarPiece>
      <BarPiece mode={resourceMode.sports}>
        <SportsIcon width={25} height={25} />
      </BarPiece>
      <BarPiece mode={resourceMode.schoolEvents}>
        <CalendarIcon width={25} height={25} />
      </BarPiece>
      <BarPiece mode={resourceMode.annoucments}>
        <Megaphone width={25} height={25} />
      </BarPiece>
      <BarPiece mode={resourceMode.fitness}>
        <GymIcon width={25} height={25} />
      </BarPiece>
      <BarPiece mode={resourceMode.files}>
        <DocumentIcon width={25} height={25} />
      </BarPiece>
      <BarPiece mode={resourceMode.news}>
        <NewsIcon width={25} height={25} />
      </BarPiece>
      <BarPiece mode={resourceMode.scholarships}>
        <GraduationHatIcon width={25} height={25} />
      </BarPiece>
      <Pressable
        onPress={() => {
          setIsOpen(true);
        }}
        style={{ padding: 10 }}
      >
        <UpIcon width={25} height={25} />
      </Pressable>
    </Pressable>
  );
}
