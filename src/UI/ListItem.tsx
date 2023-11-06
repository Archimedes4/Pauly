import { View, Text, Pressable, ViewStyle } from 'react-native';
import React from 'react';
import { useNavigate } from 'react-router-native';
import createUUID from '../Functions/ultility/createUUID';
import { Colors } from '../types';

export default function ListItem({
  to,
  title,
  width,
  caption,
  onPress,
  style,
}: {
  title: string;
  width: number;
  caption?: string | undefined;
  to?: string | undefined;
  onPress?: () => void | undefined;
  style?: ViewStyle | undefined;
}) {
  const navigate = useNavigate();
  return (
    <Pressable
      onPress={() => {
        if (to !== undefined) {
          navigate(to);
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
