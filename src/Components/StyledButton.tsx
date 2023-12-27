/*
  Pauly
  Andrew Mainella
*/
import { View, Text, Pressable, ViewStyle } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import createUUID from '../utils/ultility/createUUID';
import { Colors } from '../constants';

export default function StyledButton({
  to,
  text,
  caption,
  onPress,
  style,
}: {
  text: string;
  caption?: string | undefined;
  to?: string | undefined;
  onPress?: (() => void) | undefined;
  style?: ViewStyle | undefined;
}) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => {
        if (onPress !== undefined) {
          onPress();
        }
        if (to !== undefined) {
          router.replace(to);
        }
      }}
      key={createUUID()}
      style={[
        {
          shadowColor: Colors.black,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.8,
          shadowRadius: 10,
          borderRadius: 15,
        },
        style,
      ]}
    >
      <View style={{ margin: 10 }}>
        <Text style={{ fontSize: 16 }}>{text}</Text>
        {caption !== undefined ? (
          <Text style={{ fontSize: 12 }}>{caption}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}
