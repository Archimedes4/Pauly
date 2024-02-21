import { Text, ScrollView, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { Colors } from '@constants';
import WebViewCross from '../WebViewCross';
import { CloseIcon } from '../Icons';
import usePaulyApi from '@hooks/usePaulyApi';

export default function ResourceNewsPage({
  selectedPost,
  setSelectedPost,
}: {
  selectedPost: newsPost;
  setSelectedPost: (item: undefined) => void;
}) {
  const { width, height } = useSelector((state: RootState) => state.dimensions);
  const [headers, setHeaders] = useState<string>('');
  const accessToken = usePaulyApi();
  async function getHeaders() {
    console.log(selectedPost.url);
    if (typeof accessToken !== 'string') {
      return
    }
    const result = await fetch(
      'http://localhost:9000/api/getNewsHead',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    const data = await result.text();
    setHeaders(data)
  }
  useEffect(() => {
    if (typeof accessToken === 'string') {
      getHeaders();
    }
  }, [accessToken]);
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
      <WebViewCross
        rawHtml={`
        <!DOCTYPE html>
        <html>
        <head>
          ${headers}
          <meta name="viewport" content="width=${width - 20}px"/>
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
