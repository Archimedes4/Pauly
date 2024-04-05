import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import callMsGraph from '@utils/ultility/microsoftAssests';
import { Colors, loadingStateEnum, semesters, styles } from '@constants';
import ProgressView from '@components/ProgressView';
import { Link } from 'expo-router';
import StyledButton from '@components/StyledButton';

function GovernmentClassesBody() {
  const [classState, setClassState] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );
  const [classes, setClasses] = useState<classType[]>([]);

  async function loadTeamClasses() {
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
            semester: [semesters.semesterOne],
            teamLink: '',
            isHomeroom: false
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
    loadTeamClasses();
  }, []);

  if (classState === loadingStateEnum.loading) {
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

  if (classState === loadingStateEnum.success) {
    return (
      <FlatList
        data={classes}
        renderItem={classMap => (
          <StyledButton
            to={`/government/classes/${classMap.item.id}`}
            key={`Class_${classMap.item.id}`}
            text={classMap.item.name}
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
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
      }}
    >
      <Text>Failed</Text>
    </View>
  );
}

export default function GovernmentClasses() {
  const { width, height } = useSelector((state: RootState) => state.dimensions);
  return (
    <View style={{ width, height, backgroundColor: Colors.white }}>
      <View>
        <Link href="/government">
          <Text>Back</Text>
        </Link>
        <Text style={styles.headerText}>Classes</Text>
      </View>
      <GovernmentClassesBody />
      <StyledButton
        to="/government/classes/rooms"
        text="Rooms"
        style={{ marginLeft: 10, marginRight: 10, marginBottom: 20 }}
        second
      />
    </View>
  );
}
