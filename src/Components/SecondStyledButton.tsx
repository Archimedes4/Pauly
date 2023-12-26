/*
  Pauly
  Andrew Mainella
*/
import { View, Text, Pressable, ViewStyle } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import createUUID from '../Functions/ultility/createUUID';
import { Colors } from '../types';

export default function StyledButton({
  to,
  text,
  width,
  caption,
  onPress,
  style,
}: {
  text: string;
  width: number;
  caption?: string | undefined;
  to?: string | undefined;
  onPress?: (() => void) | undefined;
  style?: ViewStyle | undefined;
}) {
  const router = useRouter();
  const [isSecond, setIsSecond] = useState<boolean>(false);
  return (
    <Pressable
      onHoverIn={() => setIsSecond(true)}
      onHoverOut={() => setIsSecond(false)}
      onPressIn={() => setIsSecond(true)}
      onPressOut={() => setIsSecond(false)}
      onPress={() => {
        if (onPress !== undefined) {
          onPress();
        }
        if (to !== undefined) {
          router.replace(to);
        }
      }}
      style={[
        {
          backgroundColor: isSecond ? Colors.lightGray:Colors.darkGray,
          shadowColor: Colors.black,
          shadowOffset: { width: 2, height: 2 },
          shadowOpacity: 0.8,
          shadowRadius: 10,
          borderRadius: 15,
          padding: 10,
          height: 36
        },
        style,
      ]}
    >
      <Text style={{ fontSize: 16, color: isSecond ? Colors.black:Colors.white, fontFamily: 'Roboto' }}>{text}</Text>
      {caption !== undefined ? (
        <Text style={{ fontSize: 12 }}>{caption}</Text>
      ) : null}
    </Pressable>
  );
}
