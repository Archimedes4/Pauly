/*
  Pauly
  Andrew Mainella
  November 10 2023
  PDFView.tsx
  Used to stop type errors never compiled.
*/
import { View, Text } from 'react-native';
import React from 'react';

// eslint-disable-next-line no-empty-pattern, react/no-unused-prop-types
export default function PDFView({}: { width: number }) {
  return (
    <View>
      <Text>Something Went Wrong</Text>
    </View>
  );
}
