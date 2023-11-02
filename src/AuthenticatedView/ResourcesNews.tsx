import { View, Text, FlatList, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Colors, loadingStateEnum } from '../types'
import ProgressView from '../UI/ProgressView';
import WebViewCross from '../UI/WebViewCross';
import { useSelector } from 'react-redux';
import { RootState } from '../Redux/store';
import { CloseIcon } from '../UI/Icons/Icons';
import { ScrollView } from 'react-native-gesture-handler';
import { getNewsPosts } from '../Functions/getResources';

export default function ResourcesNews({isHoverPicker}:{isHoverPicker: boolean}) {
  const [posts, setPosts] = useState<newsPost[]>([]);
  const [postState, setPostState] = useState<loadingStateEnum>(loadingStateEnum.loading);
  const [selectedPost, setSelectedPost] = useState<newsPost|undefined>(undefined);
  const { width, height } = useSelector(
    (state: RootState) => state.dimentions,
  );
  const [nextLink, setNextLink] = useState<undefined | string>(undefined)

  async function loadArticles() {
    const result = await getNewsPosts(nextLink);
    if (result.result === loadingStateEnum.success) {
      setPosts([...posts, ...result.data])
      setNextLink(result.nextLink)
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
        <ScrollView style={{width: width, height: isHoverPicker ? height * 0.75 : height * 0.8, backgroundColor: Colors.lightGray}}>
          <Pressable onPress={() => {setSelectedPost(undefined)}}>
            <CloseIcon width={14} height={14}/>
          </Pressable>
          <Text>{selectedPost.title}</Text>
          <WebViewCross html={selectedPost.content} width={width* 0.9}/>
        </ScrollView>:
        <>
          { (postState === loadingStateEnum.loading) ?
            <View style={{width: width, height: isHoverPicker ? height * 0.75 : height * 0.8, alignItems: 'center', alignContent: 'center', justifyContent: 'center', backgroundColor: Colors.lightGray}}>
              <ProgressView width={14} height={14}/>
              <Text>Loading</Text>
            </View>:
            <>
              { (postState === loadingStateEnum.success) ?
                <FlatList 
                  data={posts}
                  renderItem={(post) => (
                    <Pressable onPress={() => {setSelectedPost(post.item)}} style={{backgroundColor: Colors.white, borderRadius: 15, marginLeft: 10, marginRight: 10, margin: 5}}>
                      <Text style={{marginLeft: 10, marginTop: 5}}>{post.item.title}</Text>
                      <WebViewCross style={{marginTop: 2}} width={width * 0.6} html={post.item.excerpt}/>
                    </Pressable>
                  )}
                  onEndReached={() => {
                    if (nextLink !== undefined) {
                      loadArticles()
                    }
                  }}
                  style={{width: width, height: isHoverPicker ? height * 0.75 : height * 0.8, backgroundColor: Colors.lightGray}}
                />:
                <View style={{width: width, height: isHoverPicker ? height * 0.75 : height * 0.8, backgroundColor: Colors.lightGray}}>
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