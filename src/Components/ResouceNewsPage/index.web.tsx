import { Text, ScrollView, Pressable, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { Colors } from '@constants';
import { CloseIcon } from '../Icons';

export default function ResourceNewsPage({
  selectedPost,
  setSelectedPost,
}: {
  selectedPost: newsPost;
  setSelectedPost: (item: undefined) => void;
}) {
  const { width, height } = useSelector((state: RootState) => state.dimensions);
  const [headers, setHeaders] = useState<string>('');
  async function getHeaders() {
    console.log(selectedPost.url);
    const result = await fetch(
      'https://thecrusadernews.ca/2023/12/20/throne-speech-marks-time-of-optimism-in-manitoba/',
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      },
    );
    const data = await result.text();
    console.log(`Result${data}`);
    result.headers.forEach(function (val: string, key: string) {
      console.log(`${key} -> ${val}`);
    });
  }
  useEffect(() => {
    console.log('headers');
    getHeaders();
  }, []);
  return (
    <View
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
          <link crossorigin="anonymous" rel="stylesheet" id="all-css-0-1" href="https://s0.wp.com/_static/??-eJzTLy/QTc7PK0nNK9HPLdUtyClNz8wr1s9KLSlITM6G8vVz8/NBREppTmqxflFqTmJJaopuQX5xCRpPL7m4WEcfu5E5mdmpCIPBPJBy+1xbQ3MDUxNjcwNzyywAYHY02w==&amp;cssminify=yes" type="text/css" media="all">
          <link crossorigin="anonymous" rel="stylesheet" id="all-css-2-1" href="https://s0.wp.com/wp-content/plugins/gutenberg-core/v17.6.0/build/block-library/style.css?m=1706747918i&amp;cssminify=yes" type="text/css" media="all">

          <meta name="viewport" content="width=${width - 20}px"/>
          <style>
            body {font-weight: normal; font-family: Arial; width: 100%}
            div {font-weight: normal; font-family: Arial; width: 100%; padding: 0; margin: 0; font-size: 15px}
            .main {
              padding: 0;
              margin: 0;
              paddingBottom: 100;
              position: absolute;
            }
          </style>
          <script>
            $(function(){ $("head").load("https://thecrusadernews.ca/2023/12/20/throne-speech-marks-time-of-optimism-in-manitoba/") });
        </script>
        </head>
        <body>
          <div id="pauly-main" class="main">
            ${selectedPost.content}
          </div>
        </body>
        </html>`}
        width={width * 0.9}
        height={height * 0.85}
        style={{
          marginLeft: 'auto',
          marginRight: 'auto',
          padding: 0,
          border: 0,
        }}
      />
    </View>
  );
}
