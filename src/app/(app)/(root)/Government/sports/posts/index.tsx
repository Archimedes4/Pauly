/*
  Andrew Mainella
  20 October 2023
  Pauly
  GovernmentHandleFileSubmissions.tsx
*/
import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, FlatList } from 'react-native';
import { Colors, loadingStateEnum } from '@constants';
import ProgressView from '@components/ProgressView';
import getSubmissions from '@utils/sports/sportsFunctions';
import { Link, useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import StyledButton from '@components/StyledButton';

function GovernmentSportsPostsBody() {
  const { width } = useSelector((state: RootState) => state.dimensions);
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
    return (
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
      </View>
    );
  }

  if (loadingSubmissionsState === loadingStateEnum.success) {
    return (
      <FlatList
        data={currentMediaSubmissions}
        renderItem={item => (
          <StyledButton
            key={`Submission_${item.item.submissionId}`}
            onPress={() =>
              router.push(`/government/sports/posts/${item.item.submissionId}`)
            }
            style={{ margin: 15 }}
            text={item.item.Title}
            caption={`Accepted: ${item.item.accepted ? 'Yes' : 'No'}\nReviewed: ${item.item.reviewed ? 'Yes' : 'No'}\n${item.item.user}`}
          />
        )}
        style={{ width }}
      />
    );
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
  const { width, height } = useSelector((state: RootState) => state.dimensions);
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
      <GovernmentSportsPostsBody />
      <StyledButton
        text="Create Post"
        style={{
          marginBottom: 10,
          marginTop: 5,
          marginLeft: 15,
          marginRight: 15,
        }}
        to="/government/sports/posts/create"
        second
      />
    </View>
  );
}
