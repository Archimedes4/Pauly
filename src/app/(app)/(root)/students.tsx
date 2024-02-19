/*
  Pauly
  Andrew Mainella
  November 9 2023
  Students.tsx
  Holds the student section of Pauly. See README.md for more information.
*/
import { View, Text, ListRenderItemInfo, Image } from 'react-native';
import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FlatList } from 'react-native-gesture-handler';
import { Colors, loadingStateEnum } from '@constants';
import store, { RootState } from '@redux/store';
import ProgressView from '@components/ProgressView';
import { PersonIcon } from '@components/Icons';
import { studentSearchSlice } from '@redux/reducers/studentSearchReducer';
import BackButton from '@components/BackButton';
import { getNumberOfBlocks, getUsersAndPhotos } from '@utils/studentFunctions';
import callMsGraph from '@utils/ultility/microsoftAssets';
import createUUID from '@utils/ultility/createUUID';
import { Link } from 'expo-router';
import { useStudentSafeArea } from '@hooks/safeAreaHooks';
import SearchBar from '@components/SearchBar';

function StudentImage({ user }: { user: ListRenderItemInfo<schoolUserType> }) {
  if (user.item.imageState === loadingStateEnum.loading) {
    return (
      <>
        <ProgressView width={14} height={14} />
        <Text>Loading</Text>
      </>
    );
  }
  if (
    user.item.imageState === loadingStateEnum.success &&
    user.item.imageDataUrl !== undefined
  ) {
    return (
      <Image
        source={{ uri: user.item.imageDataUrl }}
        style={{ width: 150, height: 150 }}
      />
    );
  }
  return <PersonIcon width={150} height={150} />;
}

function StudentBlock({ user }: { user: ListRenderItemInfo<schoolUserType> }) {
  const { width, height } = useSelector((state: RootState) => state.dimensions);
  const getImage = useCallback(async () => {
    const newUser: any = {};
    Object.assign(newUser, user.item);
    if (
      user.item.imageDownloadUrl !== 'noImage' &&
      user.item.imageState !== loadingStateEnum.success &&
      user.item.imageState !== loadingStateEnum.failed &&
      user.item.imageState !== loadingStateEnum.loading
    ) {
      const updateStateUser: any = {};
      Object.assign(updateStateUser, user.item);
      updateStateUser.imageState = loadingStateEnum.loading;
      store.dispatch(
        studentSearchSlice.actions.setStudentUserByIndex({
          index: user.index,
          user: updateStateUser,
        }),
      );
      const result = await callMsGraph(user.item.imageDownloadUrl);
      if (result.ok) {
        const data = await result.blob();
        const urlOut = URL.createObjectURL(data);
        newUser.imageState = loadingStateEnum.success;
        newUser.imageDataUrl = urlOut;
        store.dispatch(
          studentSearchSlice.actions.setStudentUserByIndex({
            index: user.index,
            user: newUser,
          }),
        );
      } else {
        newUser.imageState = loadingStateEnum.failed;
        store.dispatch(
          studentSearchSlice.actions.setStudentUserByIndex({
            index: user.index,
            user: newUser,
          }),
        );
      }
    }
  }, [user.index, user.item]);

  useEffect(() => {
    getImage();
  }, []);

  function calculateMarginEnds(widthIn: number, side: 'L' | 'R'): number {
    const numberOfBlocks = getNumberOfBlocks(width);
    if (user.index % numberOfBlocks === 0) {
      const widthRemaining = widthIn - (numberOfBlocks - 1) * 190 - 150;
      if (widthRemaining / 2 >= 120 || side === 'R') {
        return 20;
      }
      return widthRemaining / 2;
    }
    if ((user.index + 1) % numberOfBlocks === 0) {
      const widthRemaining = widthIn - (numberOfBlocks - 1) * 190 - 150;
      if (widthRemaining / 2 >= 120 || side === 'L') {
        return 20;
      }
      return widthRemaining / 2;
    }
    return 20;
  }

  return (
    <View
      key={`StudentBlock_${user.item.id}`}
      style={{
        height: 175,
        width: 150,
        marginTop: user.index < getNumberOfBlocks(width) ? height * 0.07 : 25,
        marginBottom: 25,
        marginLeft: calculateMarginEnds(width, 'L'),
        marginRight: calculateMarginEnds(width, 'R'),

        shadowColor: '#000',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 5,
        borderRadius: 15,
        elevation: 1,
        backgroundColor: Colors.white,
      }}
    >
      <View
        style={{
          height: 150,
          width: 150,
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          borderTopRightRadius: 15,
          borderTopLeftRadius: 15,
          overflow: 'hidden',
        }}
      >
        <StudentImage user={user} />
      </View>
      <View style={{ flexDirection: 'row', marginLeft: 5, marginTop: 2 }}>
        <Text>{user.item.name}</Text>
        {user.item.student ? (
          <Text style={{ marginLeft: 'auto', marginRight: 5 }}>
            {user.item.grade}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export default function Students() {
  useStudentSafeArea();
  const { height, width, currentBreakPoint } = useSelector(
    (state: RootState) => state.dimensions,
  );
  const { usersState, users, nextLink } = useSelector(
    (state: RootState) => state.studentSearch,
  );
  const { searchText } = useSelector((state: RootState) => state.studentSearch);
  const dispatch = useDispatch();

  async function loadUsers() {
    getUsersAndPhotos();
  }

  useEffect(() => {
    loadUsers();
  }, []);

  if (usersState === loadingStateEnum.loading) {
    return (
      <View
        style={{
          width,
          height,
          backgroundColor:
            currentBreakPoint === 0 ? Colors.maroon : Colors.white,
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ProgressView width={14} height={14} />
        <Text style={{ color: Colors.white }}>Loading</Text>
      </View>
    );
  }

  if (usersState === loadingStateEnum.success) {
    return (
      <View
        style={{
          width,
          height,
          backgroundColor:
            currentBreakPoint === 0 ? Colors.maroon : Colors.white,
        }}
      >
        <View
          style={{
            height: height * 0.15,
            width,
            alignContent: 'center',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: Colors.darkGray,
          }}
        >
          {currentBreakPoint === 0 ? <BackButton to="/home" /> : null}
          <Text style={{ fontFamily: 'BukhariScript', color: Colors.white }}>
            Students
          </Text>
        </View>
        <SearchBar
          value={searchText}
          onChangeText={e =>
            dispatch(studentSearchSlice.actions.setStudentSearch(e))
          }
          onSearch={() => {
            if (searchText !== '') {
              getUsersAndPhotos(undefined, searchText);
              dispatch(studentSearchSlice.actions.setNextLink(undefined));
            } else {
              getUsersAndPhotos();
            }
          }}
          top={height * 0.15 - 19}
        />
        <FlatList
          key={`Students_${createUUID()}`}
          data={users}
          renderItem={user => <StudentBlock user={user} key={user.item.id} />}
          numColumns={getNumberOfBlocks(width)}
          onEndReached={() => {
            if (nextLink !== undefined) {
              getUsersAndPhotos(nextLink);
            }
          }}
          style={{ height: height * 0.825 }}
        />
      </View>
    );
  }

  return (
    <View
      style={{
        width,
        height,
        backgroundColor: currentBreakPoint === 0 ? Colors.maroon : Colors.white,
      }}
    >
      <Link href="/">
        <Text>Back</Text>
      </Link>
      <Text>Something went wrong</Text>
    </View>
  );
}
