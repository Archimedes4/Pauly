/*
  Andrew Mainella
  20 October 2023
  Pauly
  GovernmentHandleFileSubmissions.tsx
*/
import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import createUUID from '@utils/ultility/createUUID';
import { Colors, loadingStateEnum } from '@constants';
import ProgressView from '@components/ProgressView';
import getSubmissions from '@utils/sports/sportsFunctions';
import { Link, useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '@src/redux/store';
import SecondStyledButton from '@src/components/StyledButton';

function GovernmentSportsPostsBody() {
  const router = useRouter();
  const [currentMediaSubmissions, setCurrentMediaSubmissions] = useState<
    mediaSubmissionType[]
  >([]);
  const [loadingSubmissionsState, setLoadingSubmissionsState] =
    useState<loadingStateEnum>(loadingStateEnum.loading);

  async function loadData() {
    // sports functions
    const result = await getSubmissions();
    if (
      result.result === loadingStateEnum.success &&
      result.data !== undefined
    ) {
      setCurrentMediaSubmissions(result.data);
    }
    setLoadingSubmissionsState(result.result);
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loadingSubmissionsState === loadingStateEnum.loading) {
    <View
      style={{
        width: '100%',
        height: '100%',
        alignContent: 'center',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <ProgressView width={14} height={14} />
      <Text>loading</Text>
    </View>;
  }

  if (loadingSubmissionsState === loadingStateEnum.success) {
    <View style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <Text>HandleFileSubmissions</Text>
      <FlatList
        data={currentMediaSubmissions}
        renderItem={item => (
          <Pressable
            key={`Submission_${item.item.submissionId}_${createUUID()}`}
            onPress={() =>
              router.push(
                `/government/sports/post/review/${item.item.submissionId}`,
              )
            }
            style={{ borderColor: Colors.black, borderWidth: 2 }}
          >
            <Text>{item.item.Title}</Text>
            <Text>Accepted: {item.item.accepted ? 'Yes' : 'No'}</Text>
            <Text>Reviewed: {item.item.reviewed ? 'Yes' : 'No'}</Text>
            <Text>{item.item.user}</Text>
          </Pressable>
        )}
      />
    </View>;
  }

  return (
    <View
      style={{
        width: '100%',
        height: '80%',
        alignContent: 'center',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text>Failed</Text>
    </View>
  );
}

export default function GovernmentSportsposts() {
  const { width, height } = useSelector((state: RootState) => state.dimentions);
  return (
    <View style={{ width, height, backgroundColor: Colors.white }}>
      <Link href="/government/sports">Back</Link>
      <Text
        style={{
          marginLeft: 'auto',
          marginRight: 'auto',
          fontFamily: 'Comfortaa-Regular',
          marginBottom: 5,
          fontSize: 25,
        }}
      >
        Government Sports Posts
      </Text>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          margin: 5,
        }}
      >
        <GovernmentSportsPostsBody />
      </View>
      <SecondStyledButton
        text="Create Post"
        style={{
          marginBottom: 10,
          marginTop: 5,
          marginLeft: 15,
          marginRight: 15,
        }}
        to="/government/sports/posts/create"
      />
    </View>
  );
}
