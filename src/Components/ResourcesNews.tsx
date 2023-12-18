/*
  Pauly
  Andrew Mainella
  November 9 2023
  ResourcesNews.tsx
  Resource News Post
*/
import { View, Text, FlatList, Pressable } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Colors, loadingStateEnum } from '../types';
import ProgressView from '../components/ProgressView';
import WebViewCross from '../components/WebViewCross';
import { RootState } from '../Redux/store';
import { getNewsPosts } from '../Functions/getResources';
import ResourceNewsPage from './ResouceNewsPage/index.native';

export default function ResourcesNews() {
  const [posts, setPosts] = useState<newsPost[]>([]);
  const [postState, setPostState] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );
  const [selectedPost, setSelectedPost] = useState<newsPost | undefined>(
    undefined,
  );
  const { width, height } = useSelector((state: RootState) => state.dimentions);
  const [nextLink, setNextLink] = useState<undefined | string>(undefined);

  const loadArticles = useCallback(async () => {
    const result = await getNewsPosts(nextLink);
    if (result.result === loadingStateEnum.success) {
      setPosts([...posts, ...result.data]);
      setNextLink(result.nextLink);
      setPostState(loadingStateEnum.success);
    } else {
      setPostState(loadingStateEnum.failed);
    }
  }, [nextLink, posts]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  if (selectedPost !== undefined) {
    return (
      <ResourceNewsPage
        selectedPost={selectedPost}
        setSelectedPost={setSelectedPost}
      />
    );
  }

  if (postState === loadingStateEnum.loading) {
    return (
      <View
        style={{
          width,
          height: height * 0.85,
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
          height: height * 0.8,
          backgroundColor: Colors.lightGray,
        }}
      />
    );
  }

  return (
    <View
      style={{
        width,
        height: height * 0.85,
        backgroundColor: Colors.lightGray,
      }}
    >
      <Text>Failed to load</Text>
    </View>
  );
}
