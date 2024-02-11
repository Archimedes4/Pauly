/*
  Pauly
  Andrew Mainella
  21 Decemeber 2023
*/
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-native';
import store, { RootState } from '@redux/store';
import createUUID, { getTextState } from '@utils/ultility/createUUID';
import { Colors, loadingStateEnum, styles } from '@constants';
import { createDressCode } from '@utils/calendar/calendarFunctionsGraph';
import getDressCode from '@utils/notifications/getDressCode';
import ProgressView from '@components/ProgressView';
import callMsGraph from '@utils/ultility/microsoftAssets';
import { Link } from 'expo-router';
import DressCodeBlock from '@components/DressCodeBlock';
import BackButton from '@components/BackButton';
import StyledButton from '@src/components/StyledButton';

export function GovernmentDressCodeEdit({
  isCreating,
}: {
  isCreating: boolean;
}) {
  const { width, height } = useSelector((state: RootState) => state.dimentions);
  const [dressCodeName, setDressCodeName] = useState<string>('');
  const [dressCodeData, setDressCodeData] = useState<dressCodeDataType[]>([
    { name: '', description: '', id: createUUID() },
  ]);
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
    if (id !== undefined && !isCreating) {
      const result = await getDressCode(id);
      if (
        result.result === loadingStateEnum.success &&
        result.data !== undefined
      ) {
        setDressCodeListId(result.data.listId);
        setDressCodeName(result.data.name);
        setDressCodeData(result.data.dressCodeData);
        setDressCodeState(loadingStateEnum.success);
      } else {
        setDressCodeState(loadingStateEnum.failed);
      }
    }
  }

  useEffect(() => {
    loadData();
  }, [id]);

  if (isCreating || getDressCodeState === loadingStateEnum.success) {
    return (
      <View
        style={{
          width,
          height,
          backgroundColor: Colors.white,
        }}
      >
        <Link href="/government/calendar/dresscode">
          <Text>Back</Text>
        </Link>
        <Text style={styles.headerText}>Create Dress Code</Text>
        <Text style={{ marginLeft: 25 }}>Dress Code Name:</Text>
        <TextInput
          value={dressCodeName}
          onChangeText={setDressCodeName}
          placeholder="Dress Code Name"
          style={styles.textInputStyle}
        />
        <FlatList
          style={{ height: height * 0.7 }}
          data={dressCodeData}
          renderItem={item => (
            <DressCodeBlock
              dressCode={item.item}
              dressCodeData={dressCodeData}
              index={item.index}
              setDressCodeData={setDressCodeData}
            />
          )}
        />
        <StyledButton
          style={{ margin: 15, marginBottom: 0 }}
          onPress={() => {
            setDressCodeData([
              ...dressCodeData,
              { name: '', description: '', id: createUUID() },
            ]);
          }}
          text="Add"
        />
        <StyledButton
          second
          style={{ margin: 15 }}
          onPress={() => loadCreateDressCode()}
          text={getTextState(deleteDressCodeState, {
            notStarted: 'Create Dress Code',
          })}
        />
        {!isCreating ? (
          <Pressable style={{ margin: 10 }} onPress={() => deleteDressCode()}>
            <Text>
              {getTextState(deleteDressCodeState, {
                notStarted: 'Delete',
              })}
            </Text>
          </Pressable>
        ) : null}
      </View>
    );
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
        <BackButton to="/government/calendar/dresscode" />
        <ProgressView width={14} height={14} />
        <Text>Loading</Text>
      </View>
    );
  }

  return (
    <View>
      <Link href="/government/calendar/dresscode">
        <Text>Back</Text>
      </Link>
      <Text>Failed</Text>
    </View>
  );
}

export default function GovernmentDressCodeEditMain() {
  return <GovernmentDressCodeEdit isCreating={false} />;
}
