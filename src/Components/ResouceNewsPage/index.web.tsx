import { View, Text, ScrollView, Pressable } from 'react-native';
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@Redux/store';
import { Colors } from '@src/types';
import WebViewCross from '../WebViewCross';
import { CloseIcon } from '../Icons';

export default function ResourceNewsPage({
  selectedPost,
  setSelectedPost,
}: {
  selectedPost: newsPost;
  setSelectedPost: (item: undefined) => void;
}) {
  const { width, height } = useSelector((state: RootState) => state.dimentions);
  return (
    <ScrollView
      style={{
        width,
        height: height * 0.85,
        backgroundColor: Colors.lightGray,
      }}
    >
      <Pressable
        onPress={() => {
          setSelectedPost(undefined);
        }}
      >
        <CloseIcon width={14} height={14} />
      </Pressable>
      <Text>{selectedPost.title}</Text>
      <iframe
        srcDoc={`
        <!DOCTYPE html>
        <html>
        <head>
          <link crossorigin="anonymous" rel="stylesheet" id="all-css-8-1" href="https://s0.wp.com/wp-content/themes/pub/baskerville-2/style.css?m=1645133114i&amp;cssminify=yes" type="text/css" media="all">
          <meta name="viewport" content="width=${width - 20}px"/>
          <style>
            body {font-weight: normal; font-family: Arial; width: 100%}
            div {font-weight: normal; font-family: Arial; width: 100%; padding: 0; margin: 0; font-size: 15px}
            .main {
              padding: 0;
              margin: 0;
              position: absolute;
            }
          </style>
        </head>
        <body>
          <div id="pauly-main" class="main">
            ${selectedPost.content}
          </div>
        </body>
        </html>`}
        width={width * 0.9}
        height={height * 0.85}
      />
    </ScrollView>
  );
}
