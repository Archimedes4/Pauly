/*
  Andrew Mainella
  20 October 2023
  Pauly
  GovernmentHandleFileSubmissions.tsx
*/
import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { useNavigate } from 'react-router-native';
import createUUID from '../../../../Functions/ultility/createUUID';
import { loadingStateEnum } from '../../../../types';
import ProgressView from '../../../../UI/ProgressView';
import getSubmissions from '../../../../Functions/sports/sportsFunctions';

export default function GovernmentHandleFileSubmissions({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  const [currentMediaSubmissions, setCurrentMediaSubmissions] = useState<
    mediaSubmissionType[]
  >([]);
  const [loadingSubmissionsState, setLoadingSubmissionsState] =
    useState<loadingStateEnum>(loadingStateEnum.loading);
  const navigate = useNavigate();

  async function loadData() {
    //sports functions
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
  return (
    <>
      {loadingSubmissionsState === loadingStateEnum.loading ? (
        <View
          style={{
            width,
            height,
            alignContent: 'center',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ProgressView width={0} height={0} />
          <Text>loading</Text>
        </View>
      ) : (
        <>
          {loadingSubmissionsState === loadingStateEnum.success ? (
            <View style={{ width, height, overflow: 'hidden' }}>
              <Text>HandleFileSubmissions</Text>
              <FlatList
                data={currentMediaSubmissions}
                renderItem={item => (
                  <Pressable
                    key={`Submission_${
                      item.item.submissionId
                    }_${createUUID()}`}
                    onPress={() =>
                      navigate(
                        `/profile/government/sports/post/review/${item.item.submissionId}`,
                      )
                    }
                    style={{ borderColor: 'black', borderWidth: 2 }}
                  >
                    <Text>{item.item.Title}</Text>
                    <Text>Accepted: {item.item.accepted ? 'Yes' : 'No'}</Text>
                    <Text>Reviewed: {item.item.reviewed ? 'Yes' : 'No'}</Text>
                    <Text>{item.item.user}</Text>
                  </Pressable>
                )}
              />
            </View>
          ) : (
            <Text>Failed</Text>
          )}
        </>
      )}
    </>
  );
}
