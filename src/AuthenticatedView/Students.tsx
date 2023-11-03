import {
  View,
  Text,
  Pressable,
  TextInput,
  ViewStyle,
  Platform,
  ListRenderItemInfo,
  Image,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FlatList } from 'react-native-gesture-handler';
import { useNavigate } from 'react-router-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Colors, loadingStateEnum } from '../types';
import store, { RootState } from '../Redux/store';
import ProgressView from '../UI/ProgressView';
import { PersonIcon, SearchIcon } from '../UI/Icons/Icons';
import { studentSearchSlice } from '../Redux/reducers/studentSearchReducer';
import BackButton from '../UI/BackButton';
import { getNumberOfBlocks, getUsers } from '../Functions/studentFunctions';
import callMsGraph from '../Functions/ultility/microsoftAssets';
import { safeAreaColorsSlice } from '../Redux/reducers/safeAreaColorsReducer';
import createUUID from '../Functions/ultility/createUUID';

export default function Students() {
  const { height, width, currentBreakPoint } = useSelector(
    (state: RootState) => state.dimentions,
  );
  const { usersState, users, nextLink } = useSelector(
    (state: RootState) => state.studentSearch,
  );

  const navigate = useNavigate();
  const dispatch = useDispatch();

  async function loadUsers() {
    getUsers();
  }

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (usersState === loadingStateEnum.loading) {
      dispatch(
        safeAreaColorsSlice.actions.setSafeAreaColors({
          top: Colors.maroon,
          bottom: Colors.maroon,
        }),
      );
    } else {
      dispatch(
        safeAreaColorsSlice.actions.setSafeAreaColors({
          top: Colors.darkGray,
          bottom: currentBreakPoint === 0 ? Colors.maroon : Colors.white,
        }),
      );
    }
    
  }, [usersState]);

  const [fontsLoaded] = useFonts({
    BukhariScript: require('../../assets/fonts/BukhariScript.ttf'),
  });

  useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      {usersState === loadingStateEnum.loading ? (
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
          <Text style={{color: Colors.white}}>Loading</Text>
        </View>
      ) : (
        <>
          {usersState === loadingStateEnum.success ? (
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
                { (currentBreakPoint === 0) ?
                  <BackButton to="/profile" />:null
                }
                <Text
                  style={{ fontFamily: 'BukhariScript', color: Colors.white }}
                >
                  Students
                </Text>
              </View>
              <SearchBox
                getUsers={e => {
                  if (e !== '') {
                    getUsers(undefined, e);
                    dispatch(studentSearchSlice.actions.setNextLink(undefined));
                  } else {
                    getUsers();
                  }
                }}
              />
              <FlatList
                key={`Students_${createUUID()}`}
                data={users}
                renderItem={user => <StudentBlock user={user} />}
                keyExtractor={item => item.id}
                numColumns={getNumberOfBlocks(width)}
                onEndReached={() => {
                  if (nextLink !== undefined) {
                    getUsers(nextLink);
                  }
                }}
                style={{ height: height * 0.825 }}
              />
            </View>
          ) : (
            <View
              style={{
                width,
                height,
                backgroundColor:
                  currentBreakPoint === 0 ? Colors.maroon : Colors.white,
              }}
            >
              <Pressable
                onPress={() => {
                  navigate('/');
                }}
              >
                <Text>Back</Text>
              </Pressable>
              <Text>Something went wrong</Text>
            </View>
          )}
        </>
      )}
    </>
  );
}

function StudentBlock({ user }: { user: ListRenderItemInfo<schoolUserType> }) {
  const { width, height } = useSelector((state: RootState) => state.dimentions);
  async function getImage() {
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
  }

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
        backgroundColor: Colors.white,
        shadowColor: Colors.black,
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 5,
        borderRadius: 15,
        overflow: 'hidden'
      }}
    >
      <View
        style={{
          height: 150,
          width: 150,
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {user.item.imageState === loadingStateEnum.loading ? (
          <>
            <ProgressView width={14} height={14} />
            <Text>Loading</Text>
          </>
        ) : (
          <>
            {user.item.imageState === loadingStateEnum.success &&
            user.item.imageDataUrl !== undefined ? (
              <Image
                source={{ uri: user.item.imageDataUrl }}
                style={{ width: 150, height: 150 }}
              />
            ) : (
              <PersonIcon width={150} height={150} />
            )}
          </>
        )}
      </View>
      <View style={{ flexDirection: 'row', marginLeft: 5, marginTop: 2 }}>
        <Text>{user.item.name}</Text>
        {user.item.student ? <Text>{user.item.grade}</Text> : null}
      </View>
    </View>
  );
}

function SearchBox({ getUsers }: { getUsers: (item: string) => void }) {
  const { width, height } = useSelector((state: RootState) => state.dimentions);
  const { searchText } = useSelector((state: RootState) => state.studentSearch);
  const [isOverflowing, setIsOverflowing] = useState<boolean>(false);
  const style: ViewStyle =
    Platform.OS === 'web' ? { outlineStyle: 'none' } : {};
  const [mounted, setMounted] = useState<boolean>(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (mounted) {
      const searchValueSave = searchText;
      setTimeout(() => {
        if (store.getState().studentSearch.searchText === searchValueSave) {
          getUsers(store.getState().studentSearch.searchText);
        }
      }, 1500);
    } else {
      setMounted(true);
    }
  }, [searchText]);

  return (
    <View
      key="Search_View_Top"
      style={{
        width,
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: height * 0.15 - 19,
        zIndex: 2,
      }}
    >
      <View
        key="Search_View_Mid"
        style={{
          width: width * 0.8,
          shadowColor: Colors.black,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.8,
          shadowRadius: 10,
          borderRadius: 25,
          flexDirection: 'row',
          backgroundColor: Colors.white,
        }}
      >
        {isOverflowing ? null : (
          <View
            key="Search_View_Search_Icon"
            style={{
              width: 20,
              height: 40,
              alignContent: 'center',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 10,
            }}
          >
            <SearchIcon key="Search_Icon" width={15} height={15} />
          </View>
        )}
        <View key="Search_View_Input">
          <TextInput
            key="Search_TextInput"
            placeholder="Search"
            placeholderTextColor="black"
            value={searchText}
            onChangeText={e => {
              dispatch(studentSearchSlice.actions.setStudentSearch(e));
            }}
            style={[
              {
                width: isOverflowing ? width * 0.8 - 20 : width * 0.8 - 50,
                height: 20,
                margin: 10,
                borderWidth: 0,
              },
              style,
            ]}
            enterKeyHint="search"
            inputMode="search"
          />
          <View
            style={{ height: 0, alignSelf: 'flex-start', overflow: 'hidden' }}
            onLayout={e => {
              if (e.nativeEvent.layout.width > width * 0.8 - 20) {
                setIsOverflowing(true);
              } else {
                setIsOverflowing(false);
              }
            }}
            key="Search_View_Text"
          >
            <Text style={{ color: Colors.white }}>{searchText}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
