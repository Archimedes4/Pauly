import { View, Text, Pressable, ViewStyle } from 'react-native';
import React from 'react';
import createUUID from '../Functions/ultility/createUUID';
import { Colors } from '../types';
import { useRouter } from 'expo-router';

export default function ListItem({
  to = undefined,
  title,
  width,
  caption = undefined,
  onPress = undefined,
  style = undefined,
}: {
  title: string;
  width: number;
  caption?: string | undefined;
  to?: string | undefined;
  onPress?: (() => void) | undefined;
  style?: ViewStyle | undefined;
}) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => {
        if (to !== undefined) {
          router.replace(to)
        }
        if (onPress !== undefined) {
          onPress();
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
          marginLeft: width * 0.03,
          marginRight: width * 0.03,
        },
        style,
      ]}
    >
      <View style={{ margin: 10 }}>
        <Text style={{ fontSize: 16 }}>{title}</Text>
        {caption !== undefined ? (
          <Text style={{ fontSize: 12 }}>{caption}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}
