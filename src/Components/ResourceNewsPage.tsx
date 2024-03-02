import { Text, ScrollView, Pressable, View, Platform } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { Colors, loadingStateEnum, styles } from '@constants';
import usePaulyApi from '@hooks/usePaulyApi';
import WebViewCross from './WebViewCross';
import { CloseIcon } from './Icons';
import ProgressView from './ProgressView';

function ResourceNewsPageBody({
  width,
  height,
  headers,
  content,
}: {
  width: number;
  height: number;
  headers: string;
  content: string;
}) {
  if (Platform.OS === 'web') {
    return (
      <iframe
        srcDoc={`
        <!DOCTYPE html>
        <html>
        <head>
          ${headers}
          <meta name="viewport" content="width=${width - 20}px"/>
        </script>
        </head>
        <body>
          <div id="pauly-main" class="main">
            ${content}
          </div>
        </body>
        </html>`}
        width={width * 0.9}
        height={height}
        style={{
          marginLeft: 'auto',
          marginRight: 'auto',
          padding: 0,
          border: 0,
          paddingBlock: 60,
          overflow: 'hidden',
        }}
      />
    );
  }
  return (
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
          ${content}
        </div>
      </body>
      </html>`}
      width={width * 0.9}
      height={height * 0.85}
    />
  );
}

export default function ResourceNewsPage({
  selectedPost,
  setSelectedPost,
}: {
  selectedPost: newsPost;
  setSelectedPost: (item: undefined) => void;
}) {
  const { width, height } = useSelector((state: RootState) => state.dimensions);
  const [headers, setHeaders] = useState<string>('');
  const [loadingState, setLoadingState] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );
  const accessToken = usePaulyApi();
  async function getHeaders() {
    if (typeof accessToken !== 'string') {
      setLoadingState(loadingStateEnum.failed);
      return;
    }
    const result = await fetch(
      `${process.env.EXPO_PUBLIC_PAULY_FUNCTION_ENDPOINT}/api/getNewsHead`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    if (result.ok) {
      const data = await result.text();
      setHeaders(data);
      setLoadingState(loadingStateEnum.success);
    } else {
      setLoadingState(loadingStateEnum.failed);
    }
  }
  useEffect(() => {
    if (typeof accessToken === 'string') {
      getHeaders();
    }
  }, [accessToken]);

  if (loadingState === loadingStateEnum.loading) {
    return (
      <View
        style={{
          width,
          height: height * 0.85,
          backgroundColor: Colors.lightGray,
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Pressable
          onPress={() => {
            setSelectedPost(undefined);
          }}
          style={{ position: 'absolute', left: 10, top: 10 }}
        >
          <CloseIcon width={14} height={14} />
        </Pressable>
        <ProgressView width={14} height={14} />
        <Text>Loading</Text>
      </View>
    );
  }

  if (loadingState === loadingStateEnum.success) {
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
        <Text style={styles.headerText}>{selectedPost.title}</Text>
        <ResourceNewsPageBody
          width={width}
          height={height}
          headers={headers}
          content={selectedPost.content}
        />
      </ScrollView>
    );
  }

  return (
    <View>
      <Pressable
        onPress={() => {
          setSelectedPost(undefined);
        }}
      >
        <CloseIcon width={14} height={14} />
      </Pressable>
      <Text>Failed</Text>
    </View>
  );
}
