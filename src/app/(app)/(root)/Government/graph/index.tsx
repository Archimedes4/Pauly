import { View, Text, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-native';
import { useSelector } from 'react-redux';
import callMsGraph from '../../../../../Functions/ultility/microsoftAssets';
import PickerWrapper from '../../../../../components/Pickers/Picker';
import { Colors, loadingStateEnum } from '../../../../../types';
import { RootState } from '../../../../../Redux/store';
import { clientId } from '../../../../../PaulyConfig';
import { getTeams } from '../../../../../Functions/microsoftGroupsFunctions';

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
  const { mode } = useParams();

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
    let schemaExtensionsUrl = `https://graph.microsoft.com/v1.0/schemaExtensions?$filter=owner%20eq%20'${clientId}'`;
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
    if (mode === 'list') {
      setSelectedGraphMode(graphMode.list);
    } else if (mode === 'group') {
      setSelectedGraphMode(graphMode.group);
    } else if (mode === 'extension') {
      setSelectedGraphMode(graphMode.extension);
    }
  }, [mode]);

  useEffect(() => {
    getLists();
    loadData();
    getExtensions();
  }, []);

  return (
    <View style={{ height, width, backgroundColor: Colors.white }}>
      <Link to="/profile/government">
        <Text>Back</Text>
      </Link>
      <Text>Microsoft Graph Overview</Text>
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
      <ScrollView style={{ height: height * 0.6 }}>
        {selectedGraphMode === graphMode.list ? (
          <View>
            {listLoadingState === loadingStateEnum.loading ? (
              <Text>Loading</Text>
            ) : (
              <View>
                {listLoadingState === loadingStateEnum.success ? (
                  <View>
                    {lists.map((item: listType) => (
                      <Link
                        key={`${item.listId}Link`}
                        to={`/profile/government/graph/list/edit/${item.listId}`}
                      >
                        <View key={item.listId}>
                          {
                            // TO DO PRODuction fix these ids
                            item.listId !==
                              '2b86ba89-0262-4906-9247-bfd1260fb68e' &&
                            item.listId !==
                              '1f4cd053-dd6b-4e40-bb9b-803cbc74e872' ? (
                              <View
                                style={{
                                  marginBottom: 5,
                                  borderColor: 'black',
                                  borderWidth: 5,
                                }}
                              >
                                <Text>{item.displayName}</Text>
                                <Text>{item.listId}</Text>
                              </View>
                            ) : null
                          }
                        </View>
                      </Link>
                    ))}
                  </View>
                ) : (
                  <Text>Failed</Text>
                )}
              </View>
            )}
          </View>
        ) : null}
        {selectedGraphMode === graphMode.group ? (
          <View>
            {groupLoadingState === loadingStateEnum.loading ? (
              <Text>Loading</Text>
            ) : (
              <View>
                {groupLoadingState === loadingStateEnum.success ? (
                  <View>
                    {groups.map(group => (
                      <Link
                        to={`/profile/government/graph/group/edit/${group.id}`}
                        key={`group_${group.id}`}
                      >
                        <View>
                          <Text>{group.name}</Text>
                        </View>
                      </Link>
                    ))}
                  </View>
                ) : (
                  <Text>Failed</Text>
                )}
              </View>
            )}
          </View>
        ) : null}
        {selectedGraphMode === graphMode.extension ? (
          <View>
            {schemaLoadingState === loadingStateEnum.loading ? (
              <Text>Loading</Text>
            ) : (
              <View>
                {schemaLoadingState === loadingStateEnum.success ? (
                  <View>
                    <View style={{ margin: 10 }}>
                      <Text>Application Extensions</Text>
                    </View>
                    {applicationExtensions.map(extension => (
                      <Link
                        to={`/profile/government/graph/extension/edit/${extension.id}`}
                        key={`extension_${extension.id}`}
                        style={{ borderWidth: 2, borderColor: 'black' }}
                      >
                        <View>
                          <Text>{extension.id}</Text>
                          <Text>{extension.description}</Text>
                        </View>
                      </Link>
                    ))}
                    <View style={{ margin: 10 }}>
                      <Text>Tenant Extensions</Text>
                    </View>
                    {extensions.map(extension => (
                      <Link
                        to={`/profile/government/graph/extension/edit/${extension.id}`}
                        key={`extension_${extension.id}`}
                        style={{ borderWidth: 2, borderColor: 'black' }}
                      >
                        <View>
                          <Text>{extension.id}</Text>
                          <Text>{extension.description}</Text>
                        </View>
                      </Link>
                    ))}
                  </View>
                ) : (
                  <Text>Failed</Text>
                )}
              </View>
            )}
          </View>
        ) : null}
      </ScrollView>
      <Link to="/profile/government/graph/list/create">
        <Text>Create List</Text>
      </Link>
    </View>
  );
}
