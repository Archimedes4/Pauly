/*
  Pauly
  Andrew Mainella
  20 October 2023
  Resources.tsx
  This is the main component for the resources section of pauly.
  See README.md for more information about the resources section.
*/
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Platform,
  Pressable,
  Linking,
  FlatList,
  ListRenderItemInfo,
  Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import store, { RootState } from '@Redux/store';
import { safeAreaColorsSlice } from '@Redux/reducers/safeAreaColorsReducer';
import { resourcesSlice } from '@Redux/reducers/resourcesReducer';
import createUUID, { getTextState } from '@src/Functions/ultility/createUUID';
import callMsGraph from '@Functions/ultility/microsoftAssets';
import {
  convertResourceModeString,
  getResources,
  getResourcesSearch,
  getScholarships,
} from '@Functions/getResources';
import { CloseIcon, SearchIcon } from '@src/components/Icons';
import WebViewCross from '@components/WebViewCross';
import BackButton from '@components/BackButton';
import ProgressView from '@components/ProgressView';
import MimeTypeIcon from '@components/Icons/MimeTypeIcon';
import { Colors, loadingStateEnum, resourceMode } from '@src/types';
import ResourcesNews from '@components/ResourcesNews';
import ResourceBar from '@src/components/ResourceBar';

// Resources
// -> Sports
// -> Advancement Board
// -> Schedule Annoucments
// -> School Events
// -> Annoucments
// -> News (special from crusader news weebly)

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
      if (searchValue !== '') {
        setTimeout(() => {
          // Waiting 1.5s
          if (store.getState().resources.searchValue === searchValueSave) {
            // Checking if value changed
            getResourcesSearch(searchValue); // getting search data
          }
        }, 1500);
      }
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

function ResourceBlock({
  resource,
  setIsShowingCategoryView,
  setSelectedPost,
}: {
  resource: ListRenderItemInfo<resourceDataType>;
  setIsShowingCategoryView: (item: boolean) => void;
  setSelectedPost: (item: {
    teamId: string;
    conversationId: string;
    messageId: string;
  }) => void;
}) {
  const { height, width } = useSelector((state: RootState) => state.dimentions);
  const isGovernmentMode = useSelector(
    (state: RootState) => state.isGovernmentMode,
  );
  if (isGovernmentMode) {
    <Pressable
      onPress={() => {
        setIsShowingCategoryView(true);
        setSelectedPost({
          teamId: resource.item.teamId,
          conversationId: resource.item.conversationId,
          messageId: resource.item.id,
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
      {resource.item.body !== '' &&
      checkIfResourceDataJustAttachment(resource.item.body) ? (
        <WebViewCross
          width={width * 0.8 - 20}
          html={
            resource.item.html
              ? resource.item.body
              : `<div><div>${resource.item.body}</div></div>`
          }
        />
      ) : null}
      {resource.item.attachments !== undefined ? (
        <View
          style={{
            marginLeft: 10,
            marginBottom: 10,
            marginRight: 10,
            marginTop:
              resource.item.body === '' ||
              !checkIfResourceDataJustAttachment(resource.item.body)
                ? 10
                : 0,
            overflow: 'scroll',
          }}
        >
          {resource.item.attachments?.map(attachment => (
            <Pressable
              style={{ flexDirection: 'row' }}
              onPress={() => {
                Linking.openURL(attachment.webUrl);
              }}
            >
              <MimeTypeIcon width={14} height={14} mimeType={attachment.type} />
              <Text>{attachment.title}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </Pressable>;
  }
  return (
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
      {resource.item.body !== '' &&
      checkIfResourceDataJustAttachment(resource.item.body) ? (
        <WebViewCross
          width={width * 0.8 - 20}
          html={
            resource.item.html
              ? resource.item.body
              : `<div><div>${resource.item.body}</div></div>`
          }
        />
      ) : null}
      {resource.item.attachments !== undefined ? (
        <View
          style={{
            marginLeft: 10,
            marginBottom: 10,
            marginRight: 10,
            marginTop:
              resource.item.body === '' ||
              !checkIfResourceDataJustAttachment(resource.item.body)
                ? 10
                : 0,
            overflow: 'scroll',
          }}
        >
          {resource.item.attachments.map(attachment => (
            <Pressable
              key={attachment.id}
              style={{ flexDirection: 'row' }}
              onPress={() => {
                Linking.openURL(attachment.webUrl);
              }}
            >
              <MimeTypeIcon width={14} height={14} mimeType={attachment.type} />
              <Text>{attachment.title}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function ScholarshipBlock({
  item,
  width,
}: {
  item: ListRenderItemInfo<scholarship>;
  width: number;
}) {
  const [height, setHeight] = useState<number>(0);
  useEffect(() => {
    Image.getSize(item.item.cover, (imgWidth, imgHeight) => {
      const aspect = imgWidth / imgHeight;
      setHeight((width - 10) / aspect);
    });
  }, [item.item.cover, width]);
  return (
    <Pressable
      onPress={() => {
        Linking.openURL(item.item.link);
      }}
      style={{
        margin: 5,
        borderRadius: 15,
        overflow: 'hidden',
        backgroundColor: Colors.white,
      }}
    >
      {item.item.cover !== undefined ? (
        <Image
          source={{ uri: item.item.cover }}
          style={{ width: width - 10, height }}
        />
      ) : null}
      <Text style={{ fontSize: 16, margin: 5, marginLeft: 10 }}>
        {item.item.title}
      </Text>
      <Text style={{ marginBottom: 10, margin: 10 }}>{item.item.note}</Text>
    </Pressable>
  );
}

function numberScholarBlock(width: number): number {
  const newValue = width / 500;
  if (newValue < 1) {
    return 1;
  }
  return newValue;
}

function ResourceScholarships() {
  const { height, width } = useSelector((state: RootState) => state.dimentions);
  const [scholarState, setScholarState] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );
  const [scholarships, setScholarships] = useState<scholarship[]>([]);

  async function loadData() {
    const result = await getScholarships();
    if (result.result === loadingStateEnum.success) {
      setScholarships(result.data);
      setScholarState(loadingStateEnum.success);
    } else {
      setScholarState(loadingStateEnum.failed);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  if (scholarState === loadingStateEnum.loading) {
    return (
      <View
        style={{
          height: height * 0.85,
          width,
          backgroundColor: Colors.lightGray,
        }}
      >
        <ProgressView width={14} height={14} />
        <Text>Loading</Text>
      </View>
    );
  }

  if (scholarState === loadingStateEnum.success) {
    return (
      <FlatList
        key={`Students_${createUUID()}`}
        data={scholarships}
        renderItem={item => (
          <ScholarshipBlock
            item={item}
            width={width / numberScholarBlock(width)}
          />
        )}
        numColumns={numberScholarBlock(width)}
        style={{
          height: height * 0.85,
          width,
          backgroundColor: Colors.lightGray,
        }}
      />
    );
  }

  return (
    <View
      style={{
        height: height * 0.85,
        width,
        backgroundColor: Colors.lightGray,
      }}
    >
      <Text>Failed</Text>
    </View>
  );
}

export default function Resources() {
  const { height, width, currentBreakPoint } = useSelector(
    (state: RootState) => state.dimentions,
  );
  const { resources, loadingState, selectedResourceMode } = useSelector(
    (state: RootState) => state.resources,
  );
  const isGovernmentMode = useSelector(
    (state: RootState) => state.isGovernmentMode,
  );
  const [isShowingCategoryView, setIsShowingCategoryView] =
    useState<boolean>(false);
  const [selectedPost, setSelectedPost] = useState<
    undefined | { teamId: string; conversationId: string; messageId: string }
  >(undefined);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      safeAreaColorsSlice.actions.setSafeAreaColors({
        top: Colors.darkGray,
        bottom: Colors.lightGray,
      }),
    );
  }, [dispatch]);

  useEffect(() => {
    getResources(selectedResourceMode);
  }, [selectedResourceMode]);

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
          {currentBreakPoint <= 0 ? <BackButton to="/home" /> : null}
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
        {selectedResourceMode === resourceMode.news ? (
          <>
            <ResourcesNews />
            <ResourceBar />
          </>
        ) : null}
        {selectedResourceMode === resourceMode.scholarships ? (
          <>
            <ResourceScholarships />
            <ResourceBar />
          </>
        ) : null}
        {selectedResourceMode !== resourceMode.scholarships &&
        selectedResourceMode !== resourceMode.news ? (
          <View
            style={{
              height: height * 0.85,
              width,
              backgroundColor: Colors.lightGray,
            }}
          >
            {loadingState === loadingStateEnum.loading ? (
              <View
                style={{
                  width,
                  height: height * 0.85,
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
                  <FlatList
                    data={resources}
                    renderItem={resource => (
                      <ResourceBlock
                        resource={resource}
                        key={resource.item.id}
                        setIsShowingCategoryView={setIsShowingCategoryView}
                        setSelectedPost={setSelectedPost}
                      />
                    )}
                  />
                ) : (
                  <Text>Failed</Text>
                )}
              </>
            )}
            <ResourceBar />
          </View>
        ) : null}
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
        shadowColor: Colors.black,
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 5,
        borderRadius: 15,
      }}
    >
      <Pressable
        onPress={() => onClose()}
        style={{ position: 'absolute', left: 20, top: 20 }}
      >
        <CloseIcon width={12} height={12} />
      </Pressable>
      <View
        style={{
          width: width * 0.8,
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: height * 0.05,
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
            selectedCategory === resourceMode.sports
              ? Colors.lightGray
              : Colors.white,
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
            selectedCategory === resourceMode.advancement
              ? Colors.lightGray
              : Colors.white,
          shadowColor: Colors.black,
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
            selectedCategory === resourceMode.schoolEvents
              ? Colors.lightGray
              : Colors.white,
          shadowColor: Colors.black,
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
            selectedCategory === resourceMode.annoucments
              ? Colors.lightGray
              : Colors.white,
          shadowColor: Colors.black,
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
            selectedCategory === resourceMode.fitness
              ? Colors.lightGray
              : Colors.white,
          shadowColor: Colors.black,
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
            selectedCategory === resourceMode.files
              ? Colors.lightGray
              : Colors.white,
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
          shadowColor: Colors.black,
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
