import { Text, Pressable, ViewStyle } from 'react-native';
import React from 'react';
import { useNavigate } from 'react-router-native';
import { ChevronLeft } from './Icons/Icons';

export default function BackButton({
  to,
  style,
}: {
  to: string;
  // eslint-disable-next-line react/require-default-props
  style?: ViewStyle | undefined;
}) {
  const navigate = useNavigate();
  return (
    <Pressable
      style={[
        {
          position: 'absolute',
          flexDirection: 'row',
          top: 0,
          left: 5,
          zIndex: 100,
        },
        style,
      ]}
      onPress={() => navigate(to)}
    >
      <ChevronLeft width={14} height={14} />
      <Text>Back</Text>
    </Pressable>
  );
}
