import { View, Text, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { Colors, loadingStateEnum } from '@constants';
import { Link } from 'expo-router';
import StyledButton from '@components/StyledButton';
import ProgressView from '@components/ProgressView';
import getDressCodeData from '@utils/calendar/dressCodeFunctions';

function GovernmentDressCodeBody() {
  const { width } = useSelector((state: RootState) => state.dimensions);
  const [getDressCodeState, setGetDressCodeState] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );
  const [dressCodes, setDressCodes] = useState<dressCodeType[]>([]);

  async function loadData() {
    const result = await getDressCodeData();
    setGetDressCodeState(result.result);
    if (
      result.result === loadingStateEnum.success &&
      result.data !== undefined
    ) {
      setDressCodes(result.data);
    }
  }

  useEffect(() => {
    loadData();
  }, []);
  if (getDressCodeState === loadingStateEnum.loading) {
    return (
      <View
        style={{
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
        }}
      >
        <ProgressView width={14} height={14} />
        <Text>Loading</Text>
      </View>
    );
  }

  if (getDressCodeState === loadingStateEnum.success) {
    return (
      <FlatList
        data={dressCodes}
        renderItem={dressCode => (
          <StyledButton
            key={dressCode.item.id}
            to={`/government/calendar/dresscode/${dressCode.item.id}`}
            text={dressCode.item.name}
            style={{ margin: 15, marginBottom: 5 }}
          />
        )}
      />
    );
  }
  return <Text>Failed</Text>;
}

export default function GovernmentDressCode() {
  const { width, height } = useSelector((state: RootState) => state.dimensions);

  return (
    <View style={{ width, height, backgroundColor: Colors.white }}>
      <Link href="/government/calendar">
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
        Dress Codes
      </Text>
      <GovernmentDressCodeBody />
      <StyledButton
        style={{
          marginBottom: 15,
          marginLeft: 15,
          marginRight: 15,
          marginTop: 5,
        }}
        second
        text="Create Dress Code"
        to="/government/calendar/dresscode/create"
      />
    </View>
  );
}
