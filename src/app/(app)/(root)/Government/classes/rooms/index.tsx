/*
  Pauly
  Andrew Mainella 
  14 February 2024
*/
import { View, Text, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { Colors, loadingStateEnum, styles } from '@constants';
import { getRooms } from '@utils/classesFunctions';
import { Link } from 'expo-router';
import ProgressView from '@components/ProgressView';
import StyledButton from '@components/StyledButton';
import BackButton from '@components/BackButton';

function GovernmentRoomsBody() {
  const [roomState, setRoomState] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );
  const [rooms, setRooms] = useState<roomType[]>([]);

  async function loadData() {
    const result = await getRooms();
    if (result.result === loadingStateEnum.success) {
      setRooms(result.data);
    }
    setRoomState(result.result);
  }

  useEffect(() => {
    loadData();
  }, []);

  if (roomState === loadingStateEnum.loading) {
    return (
      <View
        style={{
          alignContent: 'center',
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
        }}
      >
        <ProgressView width={14} height={14} />
        <Text>Loading</Text>
      </View>
    );
  }

  if (roomState === loadingStateEnum.success) {
    return (
      <FlatList
        data={rooms}
        renderItem={e => (
          <StyledButton
            key={`Room_${e.item.id}`}
            text={e.item.name}
            to={`/government/classes/rooms/${e.item.id}`}
            style={{ margin: 15 }}
          />
        )}
      />
    );
  }
  return (
    <View
      style={{
        alignContent: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
      }}
    >
      <BackButton to="/government/classes" />
      <Text>Failed</Text>
    </View>
  );
}

export default function GovernmentRooms() {
  const { width, height } = useSelector((state: RootState) => state.dimentions);

  return (
    <View style={{ width, height, backgroundColor: Colors.white }}>
      <Link href="/government/classes">
        <Text>Back</Text>
      </Link>
      <Text style={styles.headerText}>Rooms</Text>
      <GovernmentRoomsBody />
      <StyledButton
        second
        text="Create Room"
        to="/government/classes/rooms/create"
        style={{ margin: 15 }}
      />
    </View>
  );
}
