import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, FlatList } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import callMsGraph from '@utils/ultility/microsoftAssets';
import createUUID from '@utils/ultility/createUUID';
import { Colors, loadingStateEnum, semesters } from '@constants';
import ProgressView from '@components/ProgressView';
import { Link } from 'expo-router';
import StyledButton from '@src/components/SecondStyledButton';

export default function GovernmentClasses() {
  const { width, height } = useSelector((state: RootState) => state.dimentions);
  const [classState, setClassState] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );
  const [classes, setClasses] = useState<classType[]>([]);

  async function getClasses() {
    const groupResult = await callMsGraph(
      'https://graph.microsoft.com/v1.0/groups',
    );
    if (groupResult.ok) {
      const groupResultData = await groupResult.json();
      if (groupResultData.value !== undefined) {
        const outputData: classType[] = [];
        for (let index = 0; index < groupResultData.value.length; index += 1) {
          outputData.push({
            name: groupResultData.value[index].displayName,
            id: groupResultData.value[index].id,
            periods: [],
            room: {
              name: '',
              id: '',
            },
            schoolYearId: '',
            semester: semesters.semesterOne,
          });
        }
        setClasses(outputData);
        setClassState(loadingStateEnum.success);
      } else {
        setClassState(loadingStateEnum.failed);
      }
    } else {
      setClassState(loadingStateEnum.failed);
    }
  }

  useEffect(() => {
    getClasses();
  }, []);

  return (
    <View style={{ width, height, backgroundColor: Colors.white }}>
      <View>
        <Link href="/profile/government/">
          <Text>Back</Text>
        </Link>
        <Text style={{marginLeft: 'auto', marginRight: 'auto',}}>Classes</Text>
      </View>
      <ScrollView style={{ height: height * 0.85 }}>
        <>
          {classState === loadingStateEnum.loading ? (
            <View>
              <ProgressView width={14} height={14} />
              <Text>Loading</Text>
            </View>
          ) : (
            <>
              {classState === loadingStateEnum.success ? (
                <FlatList
                  data={classes}
                  renderItem={classMap => (
                    <Link
                      href={`/profile/government/classes/edit/${classMap.item.id}`}
                    >
                      <Pressable
                        key={`Class_${classMap.item.id}_${createUUID()}`}
                        style={{
                          backgroundColor: '#FFFFFF',
                          shadowColor: 'black',
                          shadowOffset: { width: 1, height: 1 },
                          shadowOpacity: 1,
                          shadowRadius: 5,
                          borderRadius: 15,
                          margin: 10,
                        }}
                      >
                        <Text style={{ margin: 10 }}>{classMap.item.name}</Text>
                      </Pressable>
                    </Link>
                  )}
                />
              ) : (
                <View>
                  <Text>Failed</Text>
                </View>
              )}
            </>
          )}
        </>
      </ScrollView>
      <StyledButton to="/profile/government/classes/room" text='Rooms' style={{marginLeft: 10, marginRight: 10, marginBottom: 20}}/>
    </View>
  );
}
