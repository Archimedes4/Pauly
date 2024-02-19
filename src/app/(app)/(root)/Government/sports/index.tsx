/*
  Pauly
  Andrew Mainella
  Government Sports overview page. 
*/
import { View, Text, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Colors, loadingStateEnum } from '@constants';
import { RootState } from '@redux/store';
import { getSports } from '@utils/sports/sportsFunctions';
import ProgressView from '@components/ProgressView';
import { Link } from 'expo-router';
import StyledButton from '@components/StyledButton';

function GovernmentSportsBody() {
  const { width, height } = useSelector((state: RootState) => state.dimensions);
  const [currentSports, setCurrentSports] = useState<sportType[]>([]);
  const [sportsState, setSportsState] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );

  async function loadData() {
    const result = await getSports();
    if (result.result === loadingStateEnum.success) {
      setCurrentSports(result.data);
    }
    setSportsState(result.result);
  }

  useEffect(() => {
    loadData();
  }, []);
  if (sportsState === loadingStateEnum.loading) {
    return (
      <View
        style={{
          flex: 1,
          width,
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ProgressView
          width={height * 0.4 < width ? height * 0.1 : width * 0.4}
          height={height * 0.4 < width ? height * 0.1 : width * 0.4}
        />
        <Text>Loading</Text>
      </View>
    );
  }

  if (sportsState === loadingStateEnum.success) {
    return (
      <FlatList
        data={currentSports}
        renderItem={item => (
          <StyledButton
            key={item.item.id}
            to={`/government/sports/${item.item.id}`}
            text={item.item.name}
            style={{ marginLeft: 15, marginRight: 15, marginTop: 15 }}
          />
        )}
      />
    );
  }

  return (
    <View>
      <Text>Error</Text>
    </View>
  );
}

export default function GovernmentSports() {
  const { width, height } = useSelector((state: RootState) => state.dimensions);

  return (
    <View style={{ width, height, backgroundColor: Colors.white }}>
      <View style={{ height: height * 0.1 }}>
        <Link href="/government/">Back</Link>
        <Text
          style={{
            marginLeft: 'auto',
            marginRight: 'auto',
            fontFamily: 'Comfortaa-Regular',
            marginBottom: 5,
            fontSize: 25,
          }}
        >
          Government Sports
        </Text>
      </View>
      <GovernmentSportsBody />
      <StyledButton
        second
        style={{ marginLeft: 10, marginRight: 10, marginBottom: 15 }}
        to="/government/sports/create"
        text="Create Sport"
      />
      <StyledButton
        second
        style={{ marginLeft: 10, marginRight: 10, marginBottom: 15 }}
        to="/government/sports/posts"
        text="Posts"
      />
    </View>
  );
}
