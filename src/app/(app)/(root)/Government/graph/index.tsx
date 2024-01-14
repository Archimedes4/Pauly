import { View, Text, ScrollView, FlatList, SectionList } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import callMsGraph from '@utils/ultility/microsoftAssets';
import PickerWrapper from '@components/Pickers/Picker';
import { Colors, loadingStateEnum, styles } from '@constants';
import { RootState } from '@redux/store';
import { getTeams } from '@utils/microsoftGroupsFunctions';
import { Link } from 'expo-router';
import StyledButton from '@components/StyledButton';
import ProgressView from '@components/ProgressView';

type listType = {
  displayName: string;
  listId: string;
  name: string;
};

type extensionType = {
  description: string;
  id: string;
};

enum graphMode {
  list,
  group,
  extension,
}

function GroupBody({
  groupState,
  groups,
}: {
  groupState: loadingStateEnum;
  groups: groupType[];
}) {
  if (groupState === loadingStateEnum.loading) {
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

  if (groupState === loadingStateEnum.success) {
    return (
      <FlatList
        data={groups}
        renderItem={group => (
          <StyledButton
            to={`/government/graph/group/${group.item.id}`}
            key={`group_${group.item.id}`}
            text={group.item.name}
            style={{
              marginLeft: 15,
              marginRight: 15,
              marginTop: 20,
              marginBottom: group.index === groups.length - 1 ? 15 : 0,
            }}
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

function ListBody({
  listState,
  lists,
}: {
  listState: loadingStateEnum;
  lists: listType[];
}) {
  const ignoredLists = [
    '2b86ba89-0262-4906-9247-bfd1260fb68e',
    '1f4cd053-dd6b-4e40-bb9b-803cbc74e872',
  ];
  if (listState === loadingStateEnum.loading) {
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

  if (listState === loadingStateEnum.success) {
    return (
      <>
        <FlatList
          data={lists}
          renderItem={list => {
            if (!ignoredLists.includes(list.item.listId)) {
              return (
                <StyledButton
                  key={`${list.item.listId}Link`}
                  to={`/government/graph/list/${list.item.listId}`}
                  text={list.item.displayName}
                  caption={list.item.listId}
                  style={{
                    marginLeft: 15,
                    marginRight: 15,
                    marginTop: 20,
                    marginBottom: list.index === lists.length - 1 ? 15 : 0,
                  }}
                />
              );
            }
            return null;
          }}
        />
        <StyledButton
          second
          to="/government/graph/list/create"
          text="Create List"
          style={{
            marginLeft: 15,
            marginRight: 15,
            marginBottom: 20,
            marginTop: 20,
          }}
        />
      </>
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

function ExtensionBody({
  extensionState,
  extensions,
  applicationExtensions,
}: {
  extensionState: loadingStateEnum;
  extensions: extensionType[];
  applicationExtensions: extensionType[];
}) {
  if (extensionState === loadingStateEnum.loading) {
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

  if (extensionState === loadingStateEnum.success) {
    return (
      <SectionList
        sections={[
          {
            title: 'Pauly Extensions',
            data: applicationExtensions,
          },
          {
            title: 'Extensions',
            data: extensions,
          },
        ]}
        renderItem={({ item }) => {
          return (
            <StyledButton
              key={`${item.id}Link`}
              to={`/government/graph/extension/${item.id}`}
              text={item.description}
              caption={item.id}
              style={styles.listStyle}
            />
          );
        }}
        renderSectionHeader={({ section: { title } }) => <Text>{title}</Text>}
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

export default function MicrosoftGraphOverview() {
  const { height, width } = useSelector((state: RootState) => state.dimentions);
  const { siteId } = useSelector((state: RootState) => state.paulyList);
  const [lists, setLists] = useState<listType[]>([]);
  const [groups, setGroups] = useState<groupType[]>([]);
  const [extensions, setExtensions] = useState<extensionType[]>([]);
  const [applicationExtensions, setApplicationExtensions] = useState<
    extensionType[]
  >([]);
  const [selectedGraphMode, setSelectedGraphMode] = useState<graphMode>(
    graphMode.list,
  );

  // loading states
  const [groupLoadingState, setGroupLoadingState] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );
  const [listLoadingState, setListLoadingState] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );
  const [schemaLoadingState, setSchemaLoadingState] =
    useState<loadingStateEnum>(loadingStateEnum.loading);

  async function getLists() {
    const result = await callMsGraph(
      `https://graph.microsoft.com/v1.0/sites/${siteId}/lists`,
    ); // sites/8td1tk.onmicrosoft.com/sites
    if (result.ok) {
      const data = await result.json();
      if (data.value !== undefined) {
        const incomingLists: listType[] = [];
        for (let index = 0; index < data.value.length; index += 1) {
          incomingLists.push({
            displayName: data.value[index].displayName,
            listId: data.value[index].id,
            name: data.value[index].name,
          });
        }
        setLists(incomingLists);
        setListLoadingState(loadingStateEnum.success);
      } else {
        setListLoadingState(loadingStateEnum.failed);
      }
    } else {
      setListLoadingState(loadingStateEnum.failed);
    }
  }

  // async function searchGroups(search: string) {
  //   const groupResult = await callMsGraph(
  //     `https://graph.microsoft.com/v1.0/groups?$filter=startswith(displayName,'${search}')`,
  //   );
  // }

  async function loadData() {
    const groupResult = await getTeams(
      'https://graph.microsoft.com/v1.0/groups',
    );
    if (
      groupResult.result === loadingStateEnum.success &&
      groupResult.data !== undefined
    ) {
      setGroups(groupResult.data);
    }
    setGroupLoadingState(groupResult.result);
  }

  async function getExtensions() {
    let schemaExtensionsUrl = `https://graph.microsoft.com/v1.0/schemaExtensions?$filter=owner%20eq%20'${process.env.EXPO_PUBLIC_CLIENTID}'`;
    const resultData: extensionType[] = [];
    while (schemaExtensionsUrl !== '') {
      const result = await callMsGraph(schemaExtensionsUrl);
      if (!result.ok) {
        setSchemaLoadingState(loadingStateEnum.failed);
        return;
      }
      const data = await result.json();
      for (let index = 0; index < data.value.length; index += 1) {
        resultData.push({
          description: data.value[index].description,
          id: data.value[index].id,
        });
      }
      if (data['@odata.nextLink'] !== undefined) {
        schemaExtensionsUrl = data['@odata.nextLink'];
      } else {
        schemaExtensionsUrl = '';
      }
    }
    setApplicationExtensions(resultData);

    const applicationResult = await callMsGraph(
      'https://graph.microsoft.com/v1.0/schemaExtensions',
    );
    if (applicationResult.ok) {
      const applicationData = await applicationResult.json();
      const resultData: extensionType[] = [];
      for (let index = 0; index < applicationData.value.length; index += 1) {
        resultData.push({
          description: applicationData.value[index].description,
          id: applicationData.value[index].id,
        });
      }
      setExtensions(resultData);
      setSchemaLoadingState(loadingStateEnum.success);
    } else {
      setSchemaLoadingState(loadingStateEnum.failed);
    }
  }

  useEffect(() => {
    getLists();
    loadData();
    getExtensions();
  }, []);

  return (
    <View style={{ height, width, backgroundColor: Colors.white }}>
      <Link href="/government">
        <Text>Back</Text>
      </Link>
      <Text
        style={{
          marginLeft: 'auto',
          marginRight: 'auto',
          fontFamily: 'Comfortaa-Regular',
          marginBottom: 5,
          fontSize: 25,
        }}
      >
        Microsoft Graph Overview
      </Text>
      <PickerWrapper
        selectedIndex={selectedGraphMode}
        onSetSelectedIndex={setSelectedGraphMode}
        width={width}
        height={30}
      >
        <Text>Lists</Text>
        <Text>Groups</Text>
        <Text>Extensions</Text>
      </PickerWrapper>
      {selectedGraphMode === graphMode.list ? (
        <ListBody listState={listLoadingState} lists={lists} />
      ) : null}
      {selectedGraphMode === graphMode.group ? (
        <GroupBody groupState={groupLoadingState} groups={groups} />
      ) : null}
      {selectedGraphMode === graphMode.extension ? (
        <ExtensionBody
          extensionState={schemaLoadingState}
          extensions={extensions}
          applicationExtensions={applicationExtensions}
        />
      ) : null}
    </View>
  );
}
