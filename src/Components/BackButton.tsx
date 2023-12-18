/*
  Pauly
  Andrew Mainella
  November 9 2023
  BackButton.tsx
  Default back button for all of Pauly to keep same style and cut down on redudant code. Manly used when the current break point is 0.
*/
import { Text, Pressable, ViewStyle } from 'react-native';
import React from 'react';
import { Link } from 'expo-router';
import { RootState } from '@src/Redux/store';
import { useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from './Icons';

export default function BackButton({
  to,
  style,
}: {
  to: string;
  // eslint-disable-next-line react/require-default-props
  style?: ViewStyle | undefined;
}) {
  const isTopTransparent = useSelector(
    (state: RootState) => state.safeAreaColors.isTopTransparent,
  );
  const insets = useSafeAreaInsets();
  return (
    <Link
      href={to}
      style={[
        {
          position: 'absolute',
          flexDirection: 'row',
          top: isTopTransparent ? insets.top : 0,
          left: 5,
          zIndex: 100,
        },
        style,
      ]}
    >
      <ChevronLeft width={14} height={14} />
      <Text>Back</Text>
    </Link>
  );
}
