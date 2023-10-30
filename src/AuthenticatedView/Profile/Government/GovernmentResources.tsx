import { View, Text, Pressable, Switch, ScrollView, FlatList, ListRenderItemInfo } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-native';
import store, { RootState } from '../../../Redux/store';
import callMsGraph from '../../../Functions/ultility/microsoftAssets';
import { Colors, loadingStateEnum, resourceResponce } from '../../../types';
import ProgressView from '../../../UI/ProgressView';
import getResource from '../../../Functions/getResources';
import { getChannels } from '../../../Functions/getTeamsChannels';

type resourceGroupType = {
  name: string;
  id: string;
};

function ChannelBlock({
  channel,
  groupId,
  onUpdate,
  selectedGroup
}: {
  channel: ListRenderItemInfo<channelType>
  groupId: string,
  onUpdate: (item: channelType) => void,
  selectedGroup: string
}) {
  const [isSelected, setIsSelected] = useState<boolean>(
    channel.item.selected,
  );
  const [isLoading, setIsLoading] = useState<boolean>(
    channel.item.loading,
  );

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
        ...channel.item, selected: true, loading: false
      })
      setIsSelected(true);
      setIsLoading(false);
    } else {
      onUpdate({
        ...channel.item, loading: false
      })
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
          ...channel.item, selected: false, loading: false
        })
        setIsSelected(false);
        setIsLoading(false);
      } else {
        onUpdate({
          ...channel.item, loading: false
        })
        setIsLoading(false);
      }
    } else {
      onUpdate({
        ...channel.item, loading: false
      })
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
                  ...channel.item, loading: true
                })
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
                borderRadius: 50,
                backgroundColor: channel.item.selected ? 'green' : 'blue',
              }}
            />
          )}
        </View>
      )}
      <Text>{channel.item.displayName}</Text>
    </View>
  );
}

function GroupBlock({
  group,
  groupIndex,
  setGroups,
  selectedGroup,
  setSelectedGroup,
}: {
  group: resourceGroupType;
  groupIndex: number;
  setGroups: (item: resourceGroupType[]) => void;
  selectedGroup: string;
  setSelectedGroup: (item: string) => void;
}) {
  const { width, height } = useSelector((state: RootState) => state.dimentions);
  const [channels, setChannels] = useState<channelType[]>([]);
  const [channelState, setChannelState] = useState<loadingStateEnum>(loadingStateEnum.loading);

  async function loadChannels() {
    const result = await getChannels(group.id);
    if (result.result === loadingStateEnum.success) {
      setChannels(result.data);
      setChannelState(loadingStateEnum.success);
    } else {
      setChannelState(loadingStateEnum.failed);
    }
  }

  useEffect(() => {
    loadChannels()
  }, [])
  return (
    <Pressable
      key={`Team_${group.id}`}
      onPress={() => {
        setSelectedGroup(group.id);
      }}
    >
      <View
        style={{
          shadowColor: 'black',
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
          <FlatList 
            data={channels}
            renderItem={(channel) => (
              <ChannelBlock channel={channel} groupId={group.id} onUpdate={(item) => {
                let newChannels = [...channels];
                newChannels[channel.index] = item
                setChannels([...newChannels])
              }} selectedGroup={selectedGroup}/>
            )}
          />
        </View>
      </View>
    </Pressable>
  );
}

export default function GovernmentResources() {
  const { width, height } = useSelector((state: RootState) => state.dimentions);
  const [groups, setGroups] = useState<resourceGroupType[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [getTeamsState, setGetTeamsState] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );

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
  async function updateResources() {}
  useEffect(() => {
    getTeams();
  }, []);
  return (
    <View style={{ width, height, backgroundColor: Colors.white }}>
      <View style={{ height: height * 0.1 }}>
        <Link to="/profile/government">
          <Text>Back</Text>
        </Link>
        <Text>GovernmentResources</Text>
      </View>
      <ScrollView style={{ height: height * 0.9 }}>
        {getTeamsState === loadingStateEnum.loading ? (
          <Text>Loading</Text>
        ) : (
          <View>
            {getTeamsState === loadingStateEnum.success ? (
              <View>
                {groups.map((group, groupIndex) => (
                  <GroupBlock
                    group={group}
                    groupIndex={groupIndex}
                    selectedGroup={selectedGroup}
                    setGroups={setGroups}
                    setSelectedGroup={setSelectedGroup}
                  />
                ))}
              </View>
            ) : (
              <Text>Failed</Text>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
