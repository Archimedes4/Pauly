/*
  Pauly
  Andrew Mainella
  21 Decemeber 2023
*/
import {
  View,
  Text,
  TextInput,
  FlatList,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import createUUID, { getTextState } from '@utils/ultility/createUUID';
import { Colors, loadingStateEnum, styles } from '@constants';
import ProgressView from '@components/ProgressView';
import { Link, useGlobalSearchParams } from 'expo-router';
import DressCodeBlock from '@components/DressCodeBlock';
import BackButton from '@components/BackButton';
import StyledButton from '@components/StyledButton';
import { createDressCode, deleteDressCode, getDressCode, updateDressCode } from '@src/utils/calendar/dressCodeFunctions';

export function GovernmentDressCodeEdit({
  isCreating,
}: {
  isCreating: boolean;
}) {
  const { width, height } = useSelector((state: RootState) => state.dimensions);
  const [dressCode, setDressCode] = useState<dressCodeType>({
    name: '',
    id: 'create',
    dressCodeData: [],
    itemId: 'create',
    dressCodeIncentives: []
  })

  const [createDressCodeState, setCreateDressCodeState] =
    useState<loadingStateEnum>(loadingStateEnum.notStarted);

  async function loadCreateDressCode() {
    setCreateDressCodeState(loadingStateEnum.loading)
    if (isCreating) {
      const result = await createDressCode(dressCode);
      setCreateDressCodeState(result);
    } else {
      const result = await updateDressCode(dressCode);
      setCreateDressCodeState(result);
    }
  }

  const { id } = useGlobalSearchParams();

  const [getDressCodeState, setDressCodeState] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );
  const [deleteDressCodeState, setDeleteDressCodeState] =
    useState<loadingStateEnum>(loadingStateEnum.notStarted);

  async function onPressDeleteDressCode() {
    setDeleteDressCodeState(loadingStateEnum.loading);
    const result = await deleteDressCode(dressCode.itemId)
    if (result === loadingStateEnum.success) {
      setDeleteDressCodeState(loadingStateEnum.success);
    } else {
      setDeleteDressCodeState(loadingStateEnum.failed);
    }
  }

  async function loadData() {
    if (typeof id === 'string' && !isCreating) {
      const result = await getDressCode(id);
      if (
        result.result === loadingStateEnum.success
      ) {
        setDressCode(result.data)
        setDressCodeState(loadingStateEnum.success);
      } else {
        setDressCodeState(loadingStateEnum.failed);
      }
    } else {
      setDressCodeState(loadingStateEnum.failed);
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
          value={dressCode.name}
          onChangeText={(e) => {
            setDressCode({
              ...dressCode,
              name: e
            })
          }}
          placeholder="Dress Code Name"
          style={styles.textInputStyle}
        />
        <FlatList
          style={{ height: height * 0.7 }}
          data={dressCode.dressCodeData}
          renderItem={item => (
            <DressCodeBlock
              dressCode={item.item}
              dressCodeData={dressCode.dressCodeData}
              index={item.index}
              setDressCodeData={(e) => {
                setDressCode({
                  ...dressCode,
                  dressCodeData: e
                })
              }}
            />
          )}
        />
        <StyledButton
          style={{ margin: 15, marginBottom: 0 }}
          onPress={() => {
            setDressCode({
              ...dressCode,
              dressCodeData: [
                ...dressCode.dressCodeData,
                { name: '', description: '', id: createUUID() },
              ]
            })
          }}
          text="Add"
        />
        <StyledButton
          second
          style={{ margin: 15 }}
          onPress={() => loadCreateDressCode()}
          text={getTextState(createDressCodeState, {
            notStarted: (isCreating) ? 'Create Dress Code':'Save Dress Code',
          })}
        />
        {!isCreating ? (
          <StyledButton 
            text={getTextState(deleteDressCodeState, {
              notStarted: 'Delete',
            })}
            style={{ margin: 10 }}
            onPress={() => onPressDeleteDressCode()}
          />
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
