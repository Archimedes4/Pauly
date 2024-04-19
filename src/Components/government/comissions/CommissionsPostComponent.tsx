import { Colors, loadingStateEnum } from '@constants';
import ProgressView from '@components/ProgressView';
import StyledButton from '@components/StyledButton';
import WebViewCross from '@components/WebViewCross';
import {
  getChannels,
  getPosts,
  getTeams,
} from '@utils/microsoftGroupsFunctions';
import React, { useEffect, useState } from 'react';
import { FlatList, View, Text, ScrollView } from 'react-native';

enum postPickingMode {
  team,
  channel,
  post,
}

function GroupSelection({
  width,
  height,
  onSelect,
}: {
  width: number;
  height: number;
  onSelect: (item: string) => void;
}) {
  const [backLink, setBackLink] = useState(undefined);
  const [nextLink, setNextLink] = useState(undefined);
  const [groupsState, setGroupsState] = useState(loadingStateEnum.loading);
  const [groups, setGroups] = useState<groupType[]>([]);
  async function loadData() {
    const result = await getTeams();
    if (
      result.result === loadingStateEnum.success &&
      result.data !== undefined
    ) {
      setGroups(result.data);
    }
    setGroupsState(result.result);
  }
  useEffect(() => {
    loadData();
  }, []);

  if (groupsState === loadingStateEnum.loading) {
    return (
      <View
        style={{
          width,
          height,
          backgroundColor: Colors.white,
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ProgressView
          width={width < height ? width * 0.3 : height * 0.3}
          height={width < height ? width * 0.3 : height * 0.3}
        />
        <Text>Loading</Text>
      </View>
    );
  }

  if (groupsState === loadingStateEnum.success) {
    return (
      <FlatList
        data={groups}
        style={{ width, height }}
        renderItem={group => (
          <StyledButton
            text={group.item.name}
            key={`Group_${group.item.id}`}
            onPress={() => {
              onSelect(group.item.id);
            }}
            style={{
              marginLeft: 15,
              marginRight: 15,
              marginBottom: 15,
              marginTop: group.index === 0 ? 15 : 0,
            }}
          />
        )}
      />
    );
  }

  return (
    <View style={{ width, height }}>
      <Text>Failed To Get Groups</Text>
    </View>
  );
}

function ChannelSelection({
  width,
  height,
  teamId,
  onSelect,
  onBack,
}: {
  width: number;
  height: number;
  teamId: string;
  onSelect: (item: string) => void;
  onBack: () => void;
}) {
  const [backLink, setBackLink] = useState(undefined);
  const [nextLink, setNextLink] = useState(undefined);
  const [channelState, setChannelState] = useState(loadingStateEnum.loading);
  const [channels, setChannels] = useState<channelType[]>([]);
  async function loadData() {
    const result = await getChannels(teamId);
    if (
      result.result === loadingStateEnum.success &&
      result.data !== undefined
    ) {
      setChannels(result.data);
    }
    setChannelState(result.result);
  }
  useEffect(() => {
    loadData();
  }, []);

  if (channelState === loadingStateEnum.loading) {
    return (
      <View
        style={{
          width,
          height,
          backgroundColor: Colors.white,
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ProgressView
          width={width < height ? width * 0.3 : height * 0.3}
          height={width < height ? width * 0.3 : height * 0.3}
        />
        <Text>Loading</Text>
      </View>
    );
  }

  if (channelState === loadingStateEnum.success) {
    return (
      <View style={{ width, height }}>
        <StyledButton
          text="Back"
          onPress={() => onBack()}
          second
          style={{ marginLeft: 15, marginRight: 15, marginTop: 10 }}
        />
        <FlatList
          data={channels}
          renderItem={channel => (
            <StyledButton
              key={`Channel_${channel.item.id}`}
              onPress={() => {
                onSelect(channel.item.id);
              }}
              text={channel.item.displayName}
              style={{ marginLeft: 15, marginRight: 15, marginTop: 15 }}
            />
          )}
        />
      </View>
    );
  }

  return (
    <View style={{ width, height }}>
      <Text>Failed To Get Channels</Text>
    </View>
  );
}

function PostSelection({
  width,
  height,
  teamId,
  channelId,
  selectedPostId,
  onSelect,
  onBack,
}: {
  width: number;
  height: number;
  teamId: string;
  channelId: string;
  selectedPostId: string;
  onSelect: (item: string) => void;
  onBack: () => void;
}) {
  const [backLink, setBackLink] = useState(undefined);
  const [nextLink, setNextLink] = useState(undefined);
  const [postsState, setPostsState] = useState(loadingStateEnum.loading);
  const [posts, setPosts] = useState<resourceDataType[]>([]);
  async function loadData() {
    const result = await getPosts(teamId, channelId);
    if (
      result.result === loadingStateEnum.success &&
      result.data !== undefined
    ) {
      setPosts(result.data);
    }
    setPostsState(result.result);
  }
  useEffect(() => {
    loadData();
  }, []);

  if (postsState === loadingStateEnum.loading) {
    return (
      <View
        style={{
          width,
          height,
          backgroundColor: Colors.white,
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ProgressView
          width={width < height ? width * 0.3 : height * 0.3}
          height={width < height ? width * 0.3 : height * 0.3}
        />
        <Text>Loading</Text>
      </View>
    );
  }

  if (postsState === loadingStateEnum.success) {
    return (
      <ScrollView style={{ width, height }}>
        <StyledButton
          text="Back"
          onPress={() => onBack()}
          second
          style={{
            marginLeft: 15,
            marginRight: 15,
            marginTop: 10,
            marginBottom: 10,
          }}
        />
        <FlatList
          data={posts}
          renderItem={post => {
            if (post.item.body !== '<systemEventMessage/>') {
              return (
                <StyledButton
                  key={`Post_${post.item.id}`}
                  onPress={() => {
                    onSelect(post.item.id);
                  }}
                  style={{
                    padding: 5,
                    margin: 15,
                  }}
                  selected={selectedPostId === post.item.id}
                  altColor="white"
                >
                  <WebViewCross html={post.item.body} width={width * 0.9} />
                </StyledButton>
              );
            }
            return null;
          }}
        />
      </ScrollView>
    );
  }

  return (
    <View style={{ width, height }}>
      <StyledButton
        text="Back"
        onPress={() => onBack()}
        second
        style={{
          marginLeft: 15,
          marginRight: 15,
          marginTop: 10,
          marginBottom: 10,
        }}
      />
      <Text>Failed To Get Posts</Text>
    </View>
  );
}

export default function CommissionsPostComponent({
  width,
  height,
  selectedPost,
  setSelectedPost,
}: {
  width: number;
  height: number;
  selectedPost?: {
    teamId: string;
    channelId: string;
    postId: string;
  };
  setSelectedPost: (
    item:
      | {
          teamId: string;
          channelId: string;
          postId: string;
        }
      | undefined,
  ) => void;
}) {
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [selectedChannelId, setSelectedChannelId] = useState<string>('');
  const [selectedPostId, setSelectedPostId] = useState<string>('');
  const [currentPostPickingMode, setCurrentPostPickingMode] =
    useState<postPickingMode>(postPickingMode.team);

  useEffect(() => {
    if (selectedPost) {
      setSelectedTeamId(selectedPost.teamId);
      setSelectedChannelId(selectedPost.channelId);
      setSelectedPostId(selectedPost.postId);
    } else {
      setSelectedPostId('');
      setSelectedChannelId('');
      setSelectedTeamId('');
    }
  }, [selectedPost]);

  return (
    <>
      {currentPostPickingMode === postPickingMode.team ? (
        <GroupSelection
          width={width}
          height={height}
          onSelect={e => {
            setSelectedPost(undefined);
            setSelectedTeamId(e);
            setCurrentPostPickingMode(postPickingMode.channel);
          }}
        />
      ) : null}
      {currentPostPickingMode === postPickingMode.channel ? (
        <ChannelSelection
          width={width}
          height={height}
          teamId={selectedTeamId}
          onSelect={e => {
            setSelectedChannelId(e);
            setCurrentPostPickingMode(postPickingMode.post);
          }}
          onBack={() => {
            setSelectedChannelId('');
            setSelectedTeamId('');
            setSelectedPost(undefined);
            setCurrentPostPickingMode(postPickingMode.team);
          }}
        />
      ) : null}
      {currentPostPickingMode === postPickingMode.post ? (
        <PostSelection
          width={width}
          height={height}
          teamId={selectedTeamId}
          channelId={selectedChannelId}
          selectedPostId={selectedPostId}
          onSelect={e => {
            setSelectedPostId(e);
            setSelectedPost({
              teamId: selectedTeamId,
              channelId: selectedChannelId,
              postId: e,
            });
          }}
          onBack={() => {
            setSelectedPostId('');
            setSelectedChannelId('');
            setCurrentPostPickingMode(postPickingMode.channel);
          }}
        />
      ) : null}
    </>
  );
}
