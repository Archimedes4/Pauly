/*
  Pauly
  Andrew Mainella
  21 Decemeber 2023
*/
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-native';
import store, { RootState } from '@redux/store';
import createUUID, { getTextState } from '@utils/ultility/createUUID';
import { Colors, loadingStateEnum } from '@constants';
import { createDressCode } from '@utils/calendar/calendarFunctionsGraph';
import getDressCode from '@utils/notifications/getDressCode';
import ProgressView from '@components/ProgressView';
import callMsGraph from '@utils/ultility/microsoftAssets';
import { Link } from 'expo-router';
import DressCodeBlock from '@components/DressCodeBlock';

export default function GovernmentDressCodeEdit() {
  const { width, height } = useSelector((state: RootState) => state.dimentions);
  const [dressCodeName, setDressCodeName] = useState<string>('');
  const [dressCodeData, setDressCodeData] = useState<dressCodeDataType[]>([
    { name: '', description: '', id: createUUID() },
  ]);
  const [selectedDressCodeId, setSelectedDressCodeId] = useState<string>('');
  const [dressCodeListId, setDressCodeListId] = useState<string>('');

  const [createDressCodeState, setCreateDressCodeState] =
    useState<loadingStateEnum>(loadingStateEnum.notStarted);

  async function loadCreateDressCode() {
    const result = await createDressCode(dressCodeName, dressCodeData);
    setCreateDressCodeState(result);
  }

  const { id } = useParams();

  const [getDressCodeState, setDressCodeState] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );
  const [isCreatingDressCode, setIsCreatingDressCode] =
    useState<boolean>(false);
  const [deleteDressCodeState, setDeleteDressCodeState] =
    useState<loadingStateEnum>(loadingStateEnum.notStarted);

  async function deleteDressCode() {
    setDeleteDressCodeState(loadingStateEnum.loading);
    const result = await callMsGraph(
      `https://graph.microsoft.com/v1.0/sites/${
        store.getState().paulyList.siteId
      }/lists/${
        store.getState().paulyList.dressCodeListId
      }/items/${dressCodeListId}`,
      'DELETE',
    );
    if (result.ok) {
      setDeleteDressCodeState(loadingStateEnum.success);
    } else {
      setDeleteDressCodeState(loadingStateEnum.failed);
    }
  }

  async function loadData() {
    if (id !== undefined && id !== 'create') {
      const result = await getDressCode(id);
      if (
        result.result === loadingStateEnum.success &&
        result.data !== undefined
      ) {
        setDressCodeListId(result.data.listId);
        setDressCodeName(result.data.name);
        setDressCodeData(result.data.dressCodeData);
        setIsCreatingDressCode(false);
        setDressCodeState(loadingStateEnum.success);
      } else {
        setDressCodeState(loadingStateEnum.failed);
      }
    } else if (id === 'create') {
      setIsCreatingDressCode(true);
    }
  }

  useEffect(() => {
    loadData();
  }, [id]);

  if (isCreatingDressCode || getDressCodeState === loadingStateEnum.success) {
    return (
<View
          style={{
            width,
            height,
            backgroundColor: Colors.white,
          }}
        >
          <Link href="/profile/government/calendar/dresscode">
            <Text>Back</Text>
          </Link>
          <Text>Create Dress Code</Text>
          <Text>Dress Code Name:</Text>
          <TextInput
            value={dressCodeName}
            onChangeText={setDressCodeName}
            placeholder="Dress Code Name"
          />
          <ScrollView style={{ height: height * 0.7 }}>
            {dressCodeData.map((dressCode, index) => (
              <DressCodeBlock
                dressCode={dressCode}
                dressCodeData={dressCodeData}
                index={index}
                setDressCodeData={setDressCodeData}
                selectedDressCodeId={selectedDressCodeId}
                setSelectedDressCodeId={setSelectedDressCodeId}
              />
            ))}
          </ScrollView>
          <Pressable
            onPress={() => {
              setDressCodeData([
                ...dressCodeData,
                { name: '', description: '', id: createUUID() },
              ]);
            }}
          >
            <Text>Add</Text>
          </Pressable>
          <Pressable onPress={() => loadCreateDressCode()}>
            <Text>
              {getTextState(deleteDressCodeState, {
                notStarted: 'Create Dress Code'
              })}
            </Text>
          </Pressable>
          {!isCreatingDressCode ? (
            <Pressable style={{ margin: 10 }} onPress={() => deleteDressCode()}>
              <Text>
                {getTextState(deleteDressCodeState, {
                  notStarted: "Delete"
                })}
              </Text>
            </Pressable>
          ) : null}
        </View>
    )
  }

  if (getDressCodeState === loadingStateEnum.loading) {
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
        <Link href="/profile/government/calendar/dresscode">
          <Text>Back</Text>
        </Link>
        <ProgressView width={14} height={14} />
        <Text>Loading</Text>
      </View>
    )
  }

  return (
    <View>
      <Link href="/profile/government/calendar/dresscode">
        <Text>Back</Text>
      </Link>
      <Text>Failed</Text>
    </View>
  );
}
