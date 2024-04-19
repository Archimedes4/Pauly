import StyledButton from '@components/StyledButton';
import { Colors, loadingStateEnum, styles } from '@constants';
import { RootState } from '@redux/store';
import { createCommissionSubmission } from '@utils/commissions/updateCommissionFunctions';
import { getUsers } from '@utils/studentFunctions';
import { getTextState } from '@utils/ultility/createUUID';
import callMsGraph from '@utils/ultility/microsoftAssests';
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useSelector } from 'react-redux';

function PickUser({
  setSelectedUser,
  onBack,
  selectedUser,
}: {
  setSelectedUser: (item: microsoftUserType) => void;
  onBack: () => void;
  selectedUser: undefined | microsoftUserType;
}) {
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [loadedUsers, setLoadedUsers] = useState<microsoftUserType[]>([]);
  const [loadUsersResult, setLoadUsersResult] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );
  const [nextLink, setNextLink] = useState<string | undefined>(undefined);
  const { height, width } = useSelector((state: RootState) => state.dimensions);

  async function getUserId() {
    const result = await callMsGraph('https://graph.microsoft.com/v1.0/me');
    if (result.ok) {
      const data = await result.json();
      setCurrentUserId(data.id);
    }
  }

  async function loadUsers(nextLink?: string) {
    const userResult = await getUsers(nextLink);
    if (userResult.result === loadingStateEnum.success) {
      setNextLink(userResult.nextLink);
      if (nextLink) {
        setLoadedUsers([...loadedUsers, ...userResult.data]);
      } else {
        setLoadedUsers(userResult.data);
      }
      setLoadUsersResult(loadingStateEnum.success);
    } else {
      setLoadUsersResult(loadingStateEnum.failed);
    }
  }

  useEffect(() => {
    getUserId();
    loadUsers();
  }, []);

  if (loadUsersResult === loadingStateEnum.loading) {
    return (
      <View style={{ height: height * 0.4 }}>
        <StyledButton text="Back" onPress={() => onBack()} />
        <Text>Loading</Text>
      </View>
    );
  }
  if (loadUsersResult === loadingStateEnum.success) {
    return (
      <>
        <StyledButton text="Back" onPress={() => onBack()} />
        <FlatList
          data={loadedUsers}
          renderItem={user => {
            if (user.item.id !== currentUserId) {
              return (
                <StyledButton
                  key={`User_${user.item.id}`}
                  text={user.item.displayName}
                  onPress={() => {
                    setSelectedUser(user.item);
                  }}
                  selected={user.item.id === selectedUser?.id}
                  style={styles.listStyle}
                />
              );
            }
            return null;
          }}
          onEndReached={() => {
            if (nextLink !== undefined) {
              loadUsers(nextLink);
            }
          }}
          style={{ height: height * 0.4, width: width - height * 0.1 }}
        />
      </>
    );
  }
  return (
    <View style={{ height: height * 0.4 }}>
      <StyledButton text="Back" onPress={() => onBack()} />
      <Text>Failed</Text>
    </View>
  );
}

export default function AddCommissionSubmission({
  commissionId,
  onClose,
}: {
  commissionId: string;
  onClose: () => void;
}) {
  const { width, height } = useSelector((state: RootState) => state.dimensions);
  const [isPickingUser, setIsPickingUser] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<
    undefined | microsoftUserType
  >(undefined);
  const [addSubmissionState, setAddSubmissionState] =
    useState<loadingStateEnum>(loadingStateEnum.cannotStart);
  const [submissionApproved, setSubmissionApproved] = useState<boolean>(false);
  const [submissionReviewed, setSubmissionReview] = useState<boolean>(false);

  async function loadCreateCommissionSubmission() {
    if (selectedUser !== undefined) {
      setAddSubmissionState(loadingStateEnum.loading);
      const result = await createCommissionSubmission(
        selectedUser.id,
        commissionId,
        submissionApproved,
        submissionReviewed,
      );
      setAddSubmissionState(result);
    } else {
      setAddSubmissionState(loadingStateEnum.cannotStart);
    }
  }

  useEffect(() => {
    if (selectedUser !== undefined) {
      setAddSubmissionState(loadingStateEnum.notStarted);
    } else {
      setAddSubmissionState(loadingStateEnum.cannotStart);
    }
  }, [selectedUser]);

  if (isPickingUser) {
    return (
      <View
        style={{
          width: width * 0.8,
          height: height * 0.8,
          marginHorizontal: width * 0.1,
          marginVertical: height * 0.1,
          borderRadius: 15,
          borderWidth: 2,
          borderColor: Colors.black,
          backgroundColor: Colors.white,
        }}
      >
        <PickUser
          selectedUser={selectedUser}
          onBack={() => setIsPickingUser(false)}
          setSelectedUser={setSelectedUser}
        />
      </View>
    );
  }

  return (
    <View
      style={{
        width: width * 0.8,
        height: height * 0.8,
        marginHorizontal: width * 0.1,
        marginVertical: height * 0.1,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: Colors.black,
        backgroundColor: Colors.white,
      }}
    >
      <StyledButton
        text="Select User"
        onPress={() => setIsPickingUser(true)}
        style={{ margin: 15 }}
      />
      <StyledButton
        text={getTextState(addSubmissionState, {
          cannotStart: 'Please Pick a User',
          notStarted: 'Start',
          loading: 'Loading',
          success: 'Submission Created',
          failed: 'Failed to Create Submission',
        })}
        onPress={() => loadCreateCommissionSubmission()}
        style={{ margin: 15 }}
      />
      <StyledButton
        text="Close"
        onPress={() => {
          onClose();
        }}
        style={{ margin: 15 }}
      />
    </View>
  );
}
