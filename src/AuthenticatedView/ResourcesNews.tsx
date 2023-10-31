import { View, Text, FlatList, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Colors, loadingStateEnum } from '../types'
import { getNewsPosts } from '../Functions/getNewsPosts';
import ProgressView from '../UI/ProgressView';
import WebViewCross from '../UI/WebViewCross';
import { useSelector } from 'react-redux';
import { RootState } from '../Redux/store';
import { CloseIcon } from '../UI/Icons/Icons';
import { ScrollView } from 'react-native-gesture-handler';

export default function ResourcesNews() {
  const [posts, setPosts] = useState<newsPost[]>([]);
  const [postState, setPostState] = useState<loadingStateEnum>(loadingStateEnum.loading);
  const [selectedPost, setSelectedPost] = useState<newsPost|undefined>(undefined);
  const { width, height } = useSelector(
    (state: RootState) => state.dimentions,
  );

  async function loadArticles() {
    const result = await getNewsPosts();
    if (result.result === loadingStateEnum.success) {
      setPosts(result.data)
      console.log(result.data)
      setPostState(loadingStateEnum.success);
    } else {
      setPostState(loadingStateEnum.failed);
    };
  };

  useEffect(() => {
    loadArticles();
  }, []);

  return (
    <>
      { (selectedPost !== undefined) ?
        <ScrollView style={{width: width, height: height * 0.75, backgroundColor: Colors.lightGray}}>
          <Pressable onPress={() => {setSelectedPost(undefined)}}>
            <CloseIcon width={14} height={14}/>
          </Pressable>
          <Text>{selectedPost.title}</Text>
          <WebViewCross html={selectedPost.content} width={width* 0.9}/>
        </ScrollView>:
        <>
          { (postState === loadingStateEnum.loading) ?
            <View style={{width: width, height: height * 0.75, alignItems: 'center', alignContent: 'center', justifyContent: 'center', backgroundColor: Colors.lightGray}}>
              <ProgressView width={14} height={14}/>
              <Text>Loading</Text>
            </View>:
            <>
              { (postState === loadingStateEnum.success) ?
                <FlatList 
                  data={posts}
                  renderItem={(post) => (
                    <Pressable onPress={() => {setSelectedPost(post.item)}}>
                      <Text>{post.item.title}</Text>
                      <WebViewCross width={width * 0.6} html={post.item.excerpt}/>
                    </Pressable>
                  )}
                  style={{width: width, height: height * 0.75, backgroundColor: Colors.lightGray}}
                />:
                <View style={{width: width, height: height * 0.75, backgroundColor: Colors.lightGray}}>
                  <Text>Failed to load</Text>
                </View>
              }
            </>
          }
        </>
      }
    </>
  )
}