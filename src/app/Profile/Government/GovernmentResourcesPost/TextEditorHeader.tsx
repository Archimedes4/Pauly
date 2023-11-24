import { View, Text } from 'react-native';
import React from 'react';
import {
  BoldIcon,
  CenterAlignmentIcon,
  ItalicIcon,
  LeftAlignmentIcon,
  RightAlignmentIcon,
  StrikeThroughIcon,
  UnderlineIcon,
} from '../../../../components/Icons/Icons';

export default function TextEditorHeader() {
  return (
    <View style={{ flexDirection: 'row' }}>
      <BoldIcon width={14} height={14} style={{ margin: 5 }} />
      <ItalicIcon width={14} height={14} style={{ margin: 5 }} />
      <UnderlineIcon width={14} height={14} style={{ margin: 5 }} />
      <StrikeThroughIcon width={14} height={14} style={{ margin: 5 }} />
      <LeftAlignmentIcon width={14} height={14} style={{ margin: 5 }} />
      <CenterAlignmentIcon width={14} height={14} style={{ margin: 5 }} />
      <RightAlignmentIcon width={14} height={14} style={{ margin: 5 }} />
    </View>
  );
}
