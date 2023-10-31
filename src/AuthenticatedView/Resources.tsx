/*
  Andrew Mainella
  20 October 2023
  Pauly
  Resources.tsx
  This is the main component for the resources section of pauly.
  See README.md for more information about the resources section.
*/
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
  Platform,
  Pressable,
  Linking,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import store, { RootState } from '../Redux/store';
import { safeAreaColorsSlice } from '../Redux/reducers/safeAreaColorsReducer';
import { resourcesSlice } from '../Redux/reducers/resourcesReducer';
import createUUID, { getTextState } from '../Functions/ultility/createUUID';
import callMsGraph from '../Functions/ultility/microsoftAssets';
import {
  convertResourceModeString,
  getResources,
  getResourcesSearch,
} from '../Functions/getResources';
import { CloseIcon, SearchIcon } from '../UI/Icons/Icons';
import WebViewCross from '../UI/WebViewCross';
import BackButton from '../UI/BackButton';
import ProgressView from '../UI/ProgressView';
import MimeTypeIcon from '../UI/Icons/MimeTypeIcon';
import { Colors, loadingStateEnum, resourceMode } from '../types';
import ResourcesNews from './ResourcesNews';

// Resources
// -> Sports
// -> Advancement Board
// -> Schedule Annoucments
// -> School Events
// -> Annoucments
// -> News (special from crusader news weebly)

function PickerPiece({
  text,
  item,
  isHoverPicker,
  setIsHoverPicker,
}: {
  text: string;
  item: resourceMode;
  isHoverPicker: boolean;
  setIsHoverPicker: (item: boolean) => void;
}) {
  const { height, width, currentBreakPoint } = useSelector(
    (state: RootState) => state.dimentions,
  );
  const { selectedResourceMode } = useSelector(
    (state: RootState) => state.resources,
  );
  const [isSelected, setIsSelected] = useState<boolean>(false);
  const dispatch = useDispatch();
  return (
    <Pressable
      onPress={() => {
        dispatch(resourcesSlice.actions.setSelectedResourceMode(item));
      }}
      onHoverIn={() => {
        setIsHoverPicker(true);
        setIsSelected(true);
      }}
      onHoverOut={() => setIsSelected(false)}
      style={{
        height: isHoverPicker ? height * 0.1 : height * 0.05,
        width: isSelected
          ? currentBreakPoint >= 2
            ? width * 0.3
            : width * 0.6
          : currentBreakPoint >= 2
          ? width * 0.2
          : width * 0.4,
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.white,
      }}
    >
      <View
        style={{
          height: isHoverPicker ? height * 0.06 : height * 0.03,
          width: isSelected
            ? currentBreakPoint >= 2
              ? width * 0.28
              : width * 0.46
            : currentBreakPoint >= 2
            ? width * 0.18
            : width * 0.36,
          marginLeft: currentBreakPoint >= 2 ? width * 0.01 : width * 0.02,
          marginRight: currentBreakPoint >= 2 ? width * 0.01 : width * 0.02,
          backgroundColor: Colors.darkGray,
          borderWidth: item !== selectedResourceMode ? 0 : 2,
          borderColor: 'black',
          borderRadius: 15,
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: Colors.white }}>{text}</Text>
      </View>
    </Pressable>
  );
}

function checkIfResourceDataJustAttachment(body: string): boolean {
  if (body.length === 67) {
    const start = body.slice(0, 15);
    const end = body.slice(53, 67);
    if (start === '<attachment id=' && end === '></attachment>') {
      return false;
    }
    return true;
  }
  return true;
}

export default function Resources() {
  const { height, width, currentBreakPoint } = useSelector(
    (state: RootState) => state.dimentions,
  );
  const { resources, loadingState, selectedResourceMode } = useSelector(
    (state: RootState) => state.resources,
  );
  const [isHoverPicker, setIsHoverPicker] = useState<boolean>(false);
  const isGovernmentMode = useSelector(
    (state: RootState) => state.isGovernmentMode,
  );
  const [isShowingCategoryView, setIsShowingCategoryView] =
    useState<boolean>(false);
  const [selectedPost, setSelectedPost] = useState<
    undefined | { teamId: string; conversationId: string; messageId: string }
  >(undefined);
  const dispatch = useDispatch();

  async function loadData() {
    await getResources(selectedResourceMode);
  }

  useEffect(() => {
    dispatch(
      safeAreaColorsSlice.actions.setSafeAreaColors({
        top: Colors.darkGray,
        bottom: Colors.white,
      }),
    );
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [selectedResourceMode]);

  // Fonts
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
      <View style={{ height, width }}>
        <View
          style={{
            height: height * 0.1,
            width,
            backgroundColor: Colors.darkGray,
            alignContent: 'center',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {currentBreakPoint <= 0 ? <BackButton to="/" /> : null}
          <Text style={{ fontFamily: 'BukhariScript', color: Colors.white }}>
            Resources
          </Text>
        </View>
        <SearchBox />
        <View
          style={{
            width,
            height: height * 0.05,
            backgroundColor: Colors.lightGray,
          }}
        />
        <>
         { (selectedResourceMode === resourceMode.news) ?
          <ResourcesNews />:
          <ScrollView
            style={{
              height: isHoverPicker ? height * 0.75 : height * 0.8,
              backgroundColor: Colors.lightGray,
            }}
          >
            <>
              {loadingState === loadingStateEnum.loading ? (
                <View
                  style={{
                    width,
                    height: isHoverPicker ? height * 0.75 : height * 0.8,
                    alignContent: 'center',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ProgressView
                    width={width < height ? width * 0.05 : height * 0.05}
                    height={width < height ? width * 0.05 : height * 0.05}
                  />
                  <Text>Loading</Text>
                </View>
              ) : (
                <>
                  {loadingState === loadingStateEnum.success ? (
                    <>
                      {resources.map(resource => (
                        <View key={`Resource_${resource.id}`}>
                          {isGovernmentMode ? (
                            <Pressable
                              onPress={() => {
                                setIsShowingCategoryView(true);
                                setSelectedPost({
                                  teamId: resource.teamId,
                                  conversationId: resource.conversationId,
                                  messageId: resource.id,
                                });
                              }}
                              style={{
                                width: width * 0.8,
                                marginLeft: 'auto',
                                marginRight: 'auto',
                                backgroundColor: Colors.white,
                                borderRadius: 15,
                                marginBottom: height * 0.01,
                              }}
                            >
                              {resource.body !== '' &&
                              checkIfResourceDataJustAttachment(resource.body) ? (
                                <WebViewCross
                                  width={width * 0.8 - 20}
                                  html={
                                    resource.html
                                      ? resource.body
                                      : `<div><div>${resource.body}</div></div>`
                                  }
                                />
                              ) : null}
                              {resource.attachments !== undefined ? (
                                <View
                                  style={{
                                    marginLeft: 10,
                                    marginBottom: 10,
                                    marginRight: 10,
                                    marginTop:
                                      resource.body === '' ||
                                      !checkIfResourceDataJustAttachment(
                                        resource.body,
                                      )
                                        ? 10
                                        : 0,
                                    overflow: 'scroll',
                                  }}
                                >
                                  {resource.attachments.map(attachment => (
                                    <Pressable
                                      style={{ flexDirection: 'row' }}
                                      onPress={() => {
                                        Linking.openURL(attachment.webUrl);
                                      }}
                                    >
                                      <MimeTypeIcon
                                        width={14}
                                        height={14}
                                        mimeType={attachment.type}
                                      />
                                      <Text>{attachment.title}</Text>
                                    </Pressable>
                                  ))}
                                </View>
                              ) : null}
                            </Pressable>
                          ) : (
                            <View
                              style={{
                                width: width * 0.8,
                                marginLeft: 'auto',
                                marginRight: 'auto',
                                backgroundColor: Colors.white,
                                borderRadius: 15,
                                marginBottom: height * 0.01,
                              }}
                            >
                              {resource.body !== '' &&
                              checkIfResourceDataJustAttachment(resource.body) ? (
                                <WebViewCross
                                  width={width * 0.8 - 20}
                                  html={
                                    resource.html
                                      ? resource.body
                                      : `<div><div>${resource.body}</div></div>`
                                  }
                                />
                              ) : null}
                              {resource.attachments !== undefined ? (
                                <View
                                  style={{
                                    marginLeft: 10,
                                    marginBottom: 10,
                                    marginRight: 10,
                                    marginTop:
                                      resource.body === '' ||
                                      !checkIfResourceDataJustAttachment(
                                        resource.body,
                                      )
                                        ? 10
                                        : 0,
                                    overflow: 'scroll',
                                  }}
                                >
                                  {resource.attachments.map(attachment => (
                                    <Pressable
                                      key={attachment.id}
                                      style={{ flexDirection: 'row' }}
                                      onPress={() => {
                                        Linking.openURL(attachment.webUrl);
                                      }}
                                    >
                                      <MimeTypeIcon
                                        width={14}
                                        height={14}
                                        mimeType={attachment.type}
                                      />
                                      <Text>{attachment.title}</Text>
                                    </Pressable>
                                  ))}
                                </View>
                              ) : null}
                            </View>
                          )}
                        </View>
                      ))}
                    </>
                  ) : (
                    <Text>Failed</Text>
                  )}
                </>
              )}
            </>
          </ScrollView>
         }
        </>
        <Pressable
          style={{ height: isHoverPicker ? height * 0.1 : height * 0.05 }}
          onHoverIn={() => {
            setIsHoverPicker(true);
          }}
          onHoverOut={() => {
            setIsHoverPicker(false);
          }}
        >
          <ScrollView
            horizontal
            style={{
              height: isHoverPicker ? height * 0.1 : height * 0.05,
              width,
              backgroundColor: Colors.white,
            }}
            showsHorizontalScrollIndicator={false}
          >
            <PickerPiece
              key={`Button_${createUUID()}`}
              text="Home"
              item={resourceMode.home}
              isHoverPicker={isHoverPicker}
              setIsHoverPicker={setIsHoverPicker}
            />
            <PickerPiece
              key={`Button_${createUUID()}`}
              text="Sports"
              item={resourceMode.sports}
              isHoverPicker={isHoverPicker}
              setIsHoverPicker={setIsHoverPicker}
            />
            <PickerPiece
              key={`Button_${createUUID()}`}
              text="Advancement"
              item={resourceMode.advancement}
              isHoverPicker={isHoverPicker}
              setIsHoverPicker={setIsHoverPicker}
            />
            <PickerPiece
              key={`Button_${createUUID()}`}
              text="School Events"
              item={resourceMode.schoolEvents}
              isHoverPicker={isHoverPicker}
              setIsHoverPicker={setIsHoverPicker}
            />
            <PickerPiece
              key={`Button_${createUUID()}`}
              text="Annoucments"
              item={resourceMode.annoucments}
              isHoverPicker={isHoverPicker}
              setIsHoverPicker={setIsHoverPicker}
            />
            <PickerPiece
              key={`Button_${createUUID()}`}
              text="Fitness"
              item={resourceMode.fitness}
              isHoverPicker={isHoverPicker}
              setIsHoverPicker={setIsHoverPicker}
            />
            <PickerPiece
              key={`Button_${createUUID()}`}
              text="Files"
              item={resourceMode.files}
              isHoverPicker={isHoverPicker}
              setIsHoverPicker={setIsHoverPicker}
            />
            <PickerPiece
              key={`Button_${createUUID()}`}
              text="Crusader News"
              item={resourceMode.news}
              isHoverPicker={isHoverPicker}
              setIsHoverPicker={setIsHoverPicker}
            />
          </ScrollView>
        </Pressable>
      </View>
      {isGovernmentMode &&
      isShowingCategoryView &&
      selectedPost !== undefined ? (
        <GovernmentCategoryView
          teamId={selectedPost.teamId}
          channelId={selectedPost.conversationId}
          messageId={selectedPost.messageId}
          onClose={() => setIsShowingCategoryView(false)}
        />
      ) : null}
    </>
  );
}

function GovernmentCategoryView({
  teamId,
  channelId,
  messageId,
  onClose,
}: {
  teamId: string;
  channelId: string;
  messageId: string;
  onClose: () => void;
}) {
  const { height, width } = useSelector((state: RootState) => state.dimentions);
  const [categoryState, setCategoryState] = useState<loadingStateEnum>(
    loadingStateEnum.notStarted,
  );
  const [selectedCategory, setSelectedCategory] = useState<resourceMode>(
    resourceMode.home,
  );
  async function addCategory() {
    setCategoryState(loadingStateEnum.loading);
    const data = {
      singleValueExtendedProperties: [
        {
          id: store.getState().paulyList.resourceExtensionId,
          value: convertResourceModeString(selectedCategory),
        },
      ],
    };
    const result = await callMsGraph(
      `https://graph.microsoft.com/v1.0/teams/${teamId}/channels/${channelId}/messages/${messageId}`,
      'PATCH',
      JSON.stringify(data),
    );
    if (result.ok) {
      setCategoryState(loadingStateEnum.success);
    } else {
      setCategoryState(loadingStateEnum.failed);
    }
  }
  return (
    <View
      style={{
        height: height * 0.9,
        width: width * 0.8,
        position: 'absolute',
        top: height * 0.05,
        left: width * 0.1,
        backgroundColor: Colors.white,
        shadowColor: 'black',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 5,
        borderRadius: 15,
      }}
    >
      <Pressable onPress={() => onClose()}>
        <CloseIcon width={12} height={12} />
      </Pressable>
      <View
        style={{
          width: width * 0.8,
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: Colors.white,
        }}
      >
        <Text>Categories</Text>
      </View>
      <Pressable
        onPress={() => setSelectedCategory(resourceMode.sports)}
        style={{
          marginLeft: width * 0.05,
          width: width * 0.7,
          height: height * 0.05,
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor:
            selectedCategory === resourceMode.sports ? Colors.lightGray : Colors.white,
 
        }}
      >
        <Text>Sports</Text>
      </Pressable>
      <Pressable
        onPress={() => setSelectedCategory(resourceMode.advancement)}
        style={{
          marginLeft: width * 0.05,
          marginTop: height * 0.02,
          width: width * 0.7,
          height: height * 0.05,
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor:
            selectedCategory === resourceMode.advancement ? Colors.lightGray : Colors.white,
          shadowColor: 'black',
          shadowOffset: { width: 1, height: 1 },
          shadowOpacity: 1,
          shadowRadius: 5,
          borderRadius: 15,
        }}
      >
        <Text>Advancement</Text>
      </Pressable>
      <Pressable
        onPress={() => setSelectedCategory(resourceMode.schoolEvents)}
        style={{
          marginLeft: width * 0.05,
          marginTop: height * 0.02,
          width: width * 0.7,
          height: height * 0.05,
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor:
            selectedCategory === resourceMode.schoolEvents ? Colors.lightGray : Colors.white,
          shadowColor: 'black',
          shadowOffset: { width: 1, height: 1 },
          shadowOpacity: 1,
          shadowRadius: 5,
          borderRadius: 15,
        }}
      >
        <Text>School Events</Text>
      </Pressable>
      <Pressable
        onPress={() => setSelectedCategory(resourceMode.annoucments)}
        style={{
          marginLeft: width * 0.05,
          marginTop: height * 0.02,
          width: width * 0.7,
          height: height * 0.05,
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor:
            selectedCategory === resourceMode.annoucments ? Colors.lightGray : Colors.white,
          shadowColor: 'black',
          shadowOffset: { width: 1, height: 1 },
          shadowOpacity: 1,
          shadowRadius: 5,
          borderRadius: 15,
        }}
      >
        <Text>Annoucments</Text>
      </Pressable>
      <Pressable
        onPress={() => setSelectedCategory(resourceMode.fitness)}
        style={{
          marginLeft: width * 0.05,
          marginTop: height * 0.02,
          width: width * 0.7,
          height: height * 0.05,
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor:
            selectedCategory === resourceMode.fitness ? Colors.lightGray : Colors.white,
          shadowColor: 'black',
          shadowOffset: { width: 1, height: 1 },
          shadowOpacity: 1,
          shadowRadius: 5,
          borderRadius: 15,
        }}
      >
        <Text>Fitness</Text>
      </Pressable>
      <Pressable
        onPress={() => setSelectedCategory(resourceMode.files)}
        style={{
          marginLeft: width * 0.05,
          marginTop: height * 0.02,
          width: width * 0.7,
          height: height * 0.05,
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor:
            selectedCategory === resourceMode.files ? Colors.lightGray : Colors.white,
          shadowColor: 'black',
          shadowOffset: { width: 1, height: 1 },
          shadowOpacity: 1,
          shadowRadius: 5,
          borderRadius: 15,
        }}
      >
        <Text>Files</Text>
      </Pressable>
      <Pressable
        onPress={() => {
          addCategory();
        }}
        style={{
          marginLeft: width * 0.05,
          marginTop: height * 0.02,
          width: width * 0.7,
          height: height * 0.05,
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: Colors.white,
          shadowColor: 'black',
          shadowOffset: { width: 1, height: 1 },
          shadowOpacity: 1,
          shadowRadius: 5,
          borderRadius: 15,
        }}
      >
        <Text>{getTextState(categoryState, { notStarted: 'Confirm' })}</Text>
      </Pressable>
    </View>
  );
}

function SearchBox() {
  // Dimentsions
  const { width, height } = useSelector((state: RootState) => state.dimentions);

  const [mounted, setMounted] = useState<boolean>(false);
  const { searchValue } = useSelector((state: RootState) => state.resources);
  const [isOverflowing, setIsOverflowing] = useState<boolean>(false); // Boolean true if text overflowing. This is telling the search icon to show or not.
  const style = Platform.OS === 'web' ? { outlineStyle: 'none' } : undefined; // Style to remove ourline around textbox on web
  const dispatch = useDispatch();

  // Getting search results on value chage
  useEffect(() => {
    if (mounted) {
      // Checking so that this isn't called on start
      const searchValueSave = searchValue; // saving value to check if change in 1.5 s
      setTimeout(() => {
        // Waiting 1.5s
        if (store.getState().resources.searchValue === searchValueSave) {
          // Checking if value changed
          getResourcesSearch(searchValue); // getting search data
        }
      }, 1500);
    } else {
      setMounted(true); // Setting that it has been called on start
    }
  }, [searchValue]);

  return (
    <View
      key="Search_View_Top"
      style={{
        width,
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: height * 0.1 - 19,
        zIndex: 2,
      }}
    >
      <View
        key="Search_View_Mid"
        style={{
          width: width * 0.8,
          shadowColor: 'black',
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
            value={searchValue}
            onChangeText={e => {
              dispatch(resourcesSlice.actions.setSearchValue(e));
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
            <Text style={{ color: 'white' }}>{searchValue}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
