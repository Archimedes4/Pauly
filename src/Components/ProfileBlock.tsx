/*
  Pauly
  Andrew Mainella
  November 10 2023
  ProfileBlock.tsx
  Logout for when current breakpoint is not 0 (greater than 576)
*/
import React from 'react';
import { Text, Pressable } from 'react-native';
import { Colors } from '@constants';
import { useSignOut } from '@hooks/authentication';

export default function ProfileBlock() {
  //const signOut = useSignOut();
  return (
    <Pressable
      onPress={() => 
        //signOut()
        {
          
        }
      }
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        backgroundColor: Colors.white,
        shadowColor: Colors.black,
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 5,
        margin: 5,
        borderRadius: 15,
      }}
    >
      <Text numberOfLines={1} style={{ fontSize: 20, margin: 10 }}>
        Sign Out
      </Text>
    </Pressable>
  );
}
