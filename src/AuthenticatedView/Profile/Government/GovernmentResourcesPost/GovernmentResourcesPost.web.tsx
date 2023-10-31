import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import ReactQuill from 'react-quill';
import TextEditorHeader from './TextEditorHeader';

export default function GovernmentResourcesPost() {
  const [postData, setPostData] = useState<string>("");
  return (
    <View>
      <Text>Government Resources Post</Text>
      <TextEditorHeader/>
      
    </View>
  )
}