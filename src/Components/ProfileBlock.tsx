/*
  Pauly
  Andrew Mainella
  November 10 2023
  ProfileBlock.tsx
  Logout for when current breakpoint is not 0 (greater than 576)
*/
import React, { useState } from 'react';
import { Text, Pressable, View } from 'react-native';
import { Colors } from '@constants';
import { useSignOut } from '@hooks/authentication';
import { RootState } from '@src/redux/store';
import { useSelector } from 'react-redux';
import PaulySettingsComponent from './PaulySettingsComponent';

export default function ProfileBlock() {
  const signOut = useSignOut();
  const [buttonHeight, setButtonHeight] = useState<number>(0)
  const height = useSelector(
    (state: RootState) => state.dimensions.height,
  );
  return (
    <View
      style={{
        position: 'absolute',
        top: height - buttonHeight,
        backgroundColor: Colors.white,
        shadowColor: Colors.black,
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 5,
        margin: 5,
        borderRadius: 15,
      }}
      onLayout={(e) => {
        setButtonHeight(e.nativeEvent.layout.height + 10)
      }}
    >
      <PaulySettingsComponent margin={15} textColor={Colors.black}/>
      <Pressable
        onPress={() => signOut()}
        style={{
          shadowColor: Colors.black,
          shadowOffset: { width: 1, height: 1 },
          shadowOpacity: 1,
          shadowRadius: 5,
          margin: 5,
          borderRadius: 15,
          zIndex: 10,
          marginTop: 10,
          backgroundColor: Colors.white
        }}
      >
        <Text numberOfLines={1} style={{ fontSize: 20, margin: 10 }}>
          Sign Out
        </Text>
      </Pressable>
    </View>
  );
}
