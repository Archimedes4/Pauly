import { View, Text } from 'react-native';
import React, { useEffect, useState } from 'react';
import TextEditorHeader from './TextEditorHeader';

export default function GovernmentResourcePost() {
  const [postData, setPostData] = useState<string>('');
  return (
    <View>
      <Text>Government Resources Post</Text>
      <TextEditorHeader />
    </View>
  );
}
