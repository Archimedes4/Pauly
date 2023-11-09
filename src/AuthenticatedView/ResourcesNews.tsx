/*
  Pauly
  Andrew Mainella
  November 9 2023
  ResourcesNews.tsx
  Resource News Post
*/
import { View, Text, FlatList, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ScrollView } from 'react-native-gesture-handler';
import { Colors, loadingStateEnum } from '../types';
import ProgressView from '../UI/ProgressView';
import WebViewCross from '../UI/WebViewCross';
import { RootState } from '../Redux/store';
import { CloseIcon } from '../UI/Icons/Icons';
import { getNewsPosts } from '../Functions/getResources';

export default function ResourcesNews({
  isHoverPicker,
}: {
  isHoverPicker: boolean;
}) {
  const [posts, setPosts] = useState<newsPost[]>([]);
  const [postState, setPostState] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );
  const [selectedPost, setSelectedPost] = useState<newsPost | undefined>(
    undefined,
  );
  const { width, height } = useSelector((state: RootState) => state.dimentions);
  const [nextLink, setNextLink] = useState<undefined | string>(undefined);

  async function loadArticles() {
    const result = await getNewsPosts(nextLink);
    if (result.result === loadingStateEnum.success) {
      setPosts([...posts, ...result.data]);
      setNextLink(result.nextLink);
      setPostState(loadingStateEnum.success);
    } else {
      setPostState(loadingStateEnum.failed);
    }
  }

  useEffect(() => {
    loadArticles();
  }, []);

  if (selectedPost !== undefined) {
    return (
      <ScrollView
        style={{
          width,
          height: isHoverPicker ? height * 0.75 : height * 0.8,
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
          height={isHoverPicker ? height * 0.75 : height * 0.8}
        />
      </ScrollView>
    );
  }

  if (postState === loadingStateEnum.loading) {
    return (
      <View
        style={{
          width,
          height: isHoverPicker ? height * 0.75 : height * 0.8,
          alignItems: 'center',
          alignContent: 'center',
          justifyContent: 'center',
          backgroundColor: Colors.lightGray,
        }}
      >
        <ProgressView width={14} height={14} />
        <Text>Loading</Text>
      </View>
    );
  }

  if (postState === loadingStateEnum.success) {
    return (
      <FlatList
        data={posts}
        renderItem={post => (
          <Pressable
            onPress={() => {
              setSelectedPost(post.item);
            }}
            style={{
              backgroundColor: Colors.white,
              borderRadius: 15,
              marginLeft: 10,
              marginRight: 10,
              margin: 5,
            }}
          >
            <Text style={{ marginLeft: 10, marginTop: 5 }}>
              {post.item.title}
            </Text>
            <WebViewCross
              style={{ marginTop: 2 }}
              width={width * 0.6}
              html={post.item.excerpt}
            />
          </Pressable>
        )}
        onEndReached={() => {
          if (nextLink !== undefined) {
            loadArticles();
          }
        }}
        style={{
          width,
          height: isHoverPicker ? height * 0.75 : height * 0.8,
          backgroundColor: Colors.lightGray,
        }}
      />
    );
  }

  return (
    <View
      style={{
        width,
        height: isHoverPicker ? height * 0.75 : height * 0.8,
        backgroundColor: Colors.lightGray,
      }}
    >
      <Text>Failed to load</Text>
    </View>
  );
}
