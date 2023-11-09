import { View, Text, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-native';
import { useSelector } from 'react-redux';
import { Button } from 'react-native-paper';
import GovernmentHandleFileSubmissions from './GovernmentHandleFileSubmissions';
import { Colors, loadingStateEnum } from '../../../../types';
import { RootState } from '../../../../Redux/store';
import { getSports } from '../../../../Functions/sports/sportsFunctions';
import ProgressView from '../../../../UI/ProgressView';

export default function GovernmentSports() {
  const { width, height } = useSelector((state: RootState) => state.dimentions);

  const [currentSports, setCurrentSports] = useState<sportType[]>([]);
  const [dataResult, setDataResult] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );

  const navigate = useNavigate();

  async function loadData() {
    const result = await getSports();
    if (
      result.result === loadingStateEnum.success &&
      result.data !== undefined
    ) {
      setCurrentSports(result.data);
    }
    setDataResult(result.result);
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <View style={{ width, height, backgroundColor: Colors.white }}>
      <View style={{ height: height * 0.1 }}>
        <Pressable
          onPress={() => {
            navigate('/profile/government/');
          }}
        >
          <Text>Back</Text>
        </Pressable>
        <Text style={{ marginLeft: 'auto', marginRight: 'auto' }}>
          Government Sports
        </Text>
      </View>
      <View style={{ height: height * 0.4 }}>
        {dataResult === loadingStateEnum.loading ? (
          <View
            style={{
              height: height * 0.4,
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
        ) : (
          <>
            {dataResult === loadingStateEnum.success ? (
              <View>
                {currentSports.map(item => (
                  <Pressable
                    onPress={() => {
                      navigate(
                        `/profile/government/sports/team/${item.name}/${item.id}`,
                      );
                    }}
                    key={item.id}
                  >
                    <View>
                      <Text>{item.name}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            ) : (
              <View>
                <Text>Error</Text>
              </View>
            )}
          </>
        )}
      </View>
      <View style={{ height: height * 0.1, overflow: 'hidden' }}>
        <Button onPress={() => navigate('/profile/government/sports/create')}>
          Create Sport
        </Button>
        <Button
          onPress={() => navigate('/profile/government/sports/post/create')}
        >
          Create Post
        </Button>
      </View>
      <GovernmentHandleFileSubmissions width={width} height={height * 0.4} />
    </View>
  );
}
