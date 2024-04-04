/*
  Pauly
  Andrew Mainella
  November 9 2023
*/
import {
  View,
  Text,
  Pressable,
  Switch,
  FlatList,
  ListRenderItemInfo,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import store, { RootState } from '@redux/store';
import callMsGraph from '@utils/ultility/microsoftAssests';
import { Colors, loadingStateEnum, resourceResponce, styles } from '@constants';
import ProgressView from '@components/ProgressView';
import getResource from '@utils/getResources';
import { getResourceChannels } from '@utils/microsoftGroupsFunctions';
import { Link } from 'expo-router';

type resourceGroupType = {
  name: string;
  id: string;
};

function ChannelBlock({
  channel,
  groupId,
  onUpdate,
  selectedGroup,
}: {
  channel: ListRenderItemInfo<channelType>;
  groupId: string;
  onUpdate: (item: channelType) => void;
  selectedGroup: string;
}) {
  const [isSelected, setIsSelected] = useState<boolean>(channel.item.selected);
  const [isLoading, setIsLoading] = useState<boolean>(channel.item.loading);

  async function addChannel() {
    const data = {
      fields: {
        resourceGroupId: groupId,
        resourceConversationId: channel.item.id,
      },
    };
    const result = await callMsGraph(
      `https://graph.microsoft.com/v1.0/sites/${
        store.getState().paulyList.siteId
      }/lists/${store.getState().paulyList.resourceListId}/items`,
      'POST',
      JSON.stringify(data),
    );
    if (result.ok) {
      onUpdate({
        ...channel.item,
        selected: true,
        loading: false,
      });
      setIsSelected(true);
      setIsLoading(false);
    } else {
      onUpdate({
        ...channel.item,
        loading: false,
      });
      setIsLoading(false);
    }
  }

  async function removeChannel() {
    const itemResult = await getResource(groupId, channel.item.id);
    if (
      itemResult.result === resourceResponce.found &&
      itemResult.itemId !== undefined
    ) {
      const result = await callMsGraph(
        `https://graph.microsoft.com/v1.0/sites/${
          store.getState().paulyList.siteId
        }/lists/${store.getState().paulyList.resourceListId}/items/${
          itemResult.itemId
        }`,
        'DELETE',
      );
      if (result.ok) {
        onUpdate({
          ...channel.item,
          selected: false,
          loading: false,
        });
        setIsSelected(false);
        setIsLoading(false);
      } else {
        onUpdate({
          ...channel.item,
          loading: false,
        });
        setIsLoading(false);
      }
    } else {
      onUpdate({
        ...channel.item,
        loading: false,
      });
      setIsLoading(false);
    }
  }

  return (
    <View
      key={`Team_Channel_${channel.item.id}`}
      style={{ flexDirection: 'row' }}
    >
      {isLoading ? (
        <ProgressView width={12} height={12} />
      ) : (
        <View>
          {selectedGroup === groupId ? (
            <Switch
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={isSelected ? '#f5dd4b' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={e => {
                onUpdate({
                  ...channel.item,
                  loading: true,
                });
                setIsLoading(true);
                if (e === true) {
                  addChannel();
                } else {
                  removeChannel();
                }
              }}
              value={isSelected}
            />
          ) : (
            <View
              style={{
                height: 12,
                width: 12,
                marginTop: 'auto',
                marginBottom: 'auto',
                borderRadius: 50,
                backgroundColor: channel.item.selected ? 'green' : 'blue',
              }}
            />
          )}
        </View>
      )}
      <Text style={{ marginLeft: 2 }}>{channel.item.displayName}</Text>
    </View>
  );
}

function GroupBlockBody({
  groupId,
  selectedGroup,
}: {
  groupId: string;
  selectedGroup: string;
}) {
  const { width, height } = useSelector((state: RootState) => state.dimensions);
  const [channels, setChannels] = useState<channelType[]>([]);
  const [channelState, setChannelState] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );

  async function loadChannels() {
    const result = await getResourceChannels(groupId);
    if (result.result === loadingStateEnum.success) {
      setChannels(result.data);
      setChannelState(loadingStateEnum.success);
    } else {
      setChannelState(loadingStateEnum.failed);
    }
  }

  useEffect(() => {
    loadChannels();
  }, []);

  if (channelState === loadingStateEnum.loading) {
    return (
      <View
        style={{
          width: width * 0.9,
          height: height * 0.2,
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ProgressView width={14} height={14} />
        <Text>Loading</Text>
      </View>
    );
  }
  if (channelState === loadingStateEnum.success) {
    return (
      <FlatList
        data={channels}
        renderItem={channel => (
          <ChannelBlock
            key={channel.item.id}
            channel={channel}
            groupId={groupId}
            onUpdate={item => {
              const newChannels = [...channels];
              newChannels[channel.index] = item;
              setChannels([...newChannels]);
            }}
            selectedGroup={selectedGroup}
          />
        )}
      />
    );
  }
  return (
    <View>
      <Text>Failed</Text>
    </View>
  );
}

function GroupBlock({
  group,
  selectedGroup,
  setSelectedGroup,
}: {
  group: resourceGroupType;
  selectedGroup: string;
  setSelectedGroup: (item: string) => void;
}) {
  const { width, height } = useSelector((state: RootState) => state.dimensions);

  return (
    <Pressable
      key={`Team_${group.id}`}
      onPress={() => {
        setSelectedGroup(group.id);
      }}
    >
      <View
        style={{
          shadowColor: Colors.black,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.8,
          shadowRadius: 10,
          borderRadius: 15,
          marginLeft: width * 0.03,
          marginRight: width * 0.03,
          marginTop: height * 0.02,
          marginBottom: height * 0.02,
        }}
      >
        <View style={{ margin: 10 }}>
          <Text>{group.name}</Text>
          <Text>Channels</Text>
          <GroupBlockBody groupId={group.id} selectedGroup={selectedGroup} />
        </View>
      </View>
    </Pressable>
  );
}

function GovernmentResourcesBody() {
  const [groups, setGroups] = useState<resourceGroupType[]>([]);
  const [teamsState, setTeamsState] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );
  const [selectedGroup, setSelectedGroup] = useState<string>('');

  async function getTeams() {
    const result = await callMsGraph(
      "https://graph.microsoft.com/v1.0/groups?$filter=resourceProvisioningOptions/Any(x:x eq 'Team')",
    );
    if (!result.ok) {
      setTeamsState(loadingStateEnum.failed);
      return;
    }
    const data = await result.json();
    const resultGroups: resourceGroupType[] = [];
    for (let index = 0; index < data.value.length; index += 1) {
      resultGroups.push({
        name: data.value[index].displayName,
        id: data.value[index].id,
      });
    }
    setTeamsState(loadingStateEnum.success);
    setGroups(resultGroups);
  }

  useEffect(() => {
    getTeams();
  }, []);

  if (teamsState === loadingStateEnum.loading) {
    return (
      <View
        style={{
          flex: 1,
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ProgressView width={14} height={14} />
        <Text>Loading</Text>
      </View>
    );
  }

  if (teamsState === loadingStateEnum.success) {
    return (
      <FlatList
        data={groups}
        renderItem={group => (
          <GroupBlock
            key={group.item.id}
            group={group.item}
            selectedGroup={selectedGroup}
            setSelectedGroup={setSelectedGroup}
          />
        )}
      />
    );
  }

  return (
    <View
      style={{
        flex: 1,
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text>Failed</Text>
    </View>
  );
}

function GovernmentResourceLayout() {
  return <View />;
}

export default function GovernmentResources() {
  const { width, height } = useSelector((state: RootState) => state.dimensions);
  const [groups, setGroups] = useState<resourceGroupType[]>([]);
  const [getTeamsState, setGetTeamsState] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );
  const [isShowingEditor, setIsShowingEditor] = useState<boolean>(false);

  async function getTeams() {
    const result = await callMsGraph(
      "https://graph.microsoft.com/v1.0/groups?$filter=resourceProvisioningOptions/Any(x:x eq 'Team')",
    );
    if (!result.ok) {
      setGetTeamsState(loadingStateEnum.failed);
      return;
    }
    const data = await result.json();
    const resultGroups: resourceGroupType[] = [];
    for (let index = 0; index < data.value.length; index += 1) {
      resultGroups.push({
        name: data.value[index].displayName,
        id: data.value[index].id,
      });
    }
    setGetTeamsState(loadingStateEnum.success);
    setGroups(resultGroups);
  }

  useEffect(() => {
    getTeams();
  }, []);

  return (
    <View style={{ width, height, backgroundColor: Colors.white }}>
      <View style={{ height: height * 0.1 }}>
        <Link href="/government">
          <Text>Back</Text>
        </Link>
        <Text style={styles.headerText}>Government Resources</Text>
      </View>
      <GovernmentResourcesBody />
    </View>
  );
}
