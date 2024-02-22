/*
  Pauly
  Andrew Mainella
  20 October 2023
  Resources.tsx
  This is the main component for the resources section of pauly.
  See README.md for more information about the resources section.
*/
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Linking,
  FlatList,
  ListRenderItemInfo,
  Image,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { safeAreaColorsSlice } from '@redux/reducers/safeAreaColorsReducer';
import { resourcesSlice } from '@redux/reducers/resourcesReducer';
import createUUID, { getTextState } from '@utils/ultility/createUUID';
import {
  getCategoryResources,
  getResources,
  getResourcesSearch,
  getScholarships,
  getTaggedResource,
  tagResource,
} from '@utils/getResources';
import { CloseIcon } from '@components/Icons';
import WebViewCross from '@components/WebViewCross';
import BackButton from '@components/BackButton';
import ProgressView from '@components/ProgressView';
import MimeTypeIcon from '@components/Icons/MimeTypeIcon';
import { Colors, loadingStateEnum, resourceMode } from '@constants';
import ResourcesNews from '@components/ResourcesNews';
import ResourceBar from '@components/ResourceBar';
import SearchBar from '@components/SearchBar';
import StyledButton from '@components/StyledButton';
import { ResizeMode, Video } from 'expo-av';

// Resources
// -> Sports
// -> Advancement Board
// -> Schedule Annoucments
// -> School Events
// -> Annoucments
// -> News (special from crusader news weebly)

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

function AttachmentComponent({
  attachment,
  width,
}: {
  attachment: attachment;
  width: number;
}) {
  const [height, setHeight] = useState(200);
  if (attachment.type.split('/')[0] === 'image') {
    return (
      <Image width={width} style={{width, height, borderRadius: 15}} onLoad={(e) => {
        if (Platform.OS === 'web') {
          Image.getSize(attachment.webUrl, (srcWidth, srcHeight) => {
            const aspectRatio = srcWidth / srcHeight;
            setHeight(width / aspectRatio)
          }, error => {
            //Fallback height
            setHeight((width * 9) / 16);
          });
        } else {
          const aspectRatio = e.nativeEvent.source.width / e.nativeEvent.source.height;
          setHeight(width * aspectRatio);
        }
      }} source={{uri: attachment.webUrl}}/>
    )
  }
  if (attachment.type.split('/')[0] === 'video') {
    return (
      <Video
        useNativeControls
        source={{ uri: attachment.webUrl }}
        resizeMode={ResizeMode.COVER}
        onReadyForDisplay={e => {
          if (Platform.OS === 'web') {
            setHeight((width * 9) / 16);
          } else {
            const aspectRatio = e.naturalSize.width / e.naturalSize.height;
            setHeight(width * aspectRatio);
          }
        }}
        isLooping
        style={{
          width,
          height,
          alignSelf: 'stretch',
          borderRadius: 15,
        }}
        videoStyle={{
          width,
          height,
          borderRadius: 15,
        }}
      />
    );
  }
  return (
    <Pressable
      style={{ flexDirection: 'row' }}
      onPress={() => {
        Linking.openURL(attachment.webUrl);
      }}
    >
      <MimeTypeIcon width={14} height={14} mimeType={attachment.type} />
      <Text>{attachment.title}</Text>
    </Pressable>
  );
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
  const { height, width } = useSelector((state: RootState) => state.dimensions);
  const isGovernmentMode = useSelector(
    (state: RootState) => state.isGovernmentMode,
  );
  if (isGovernmentMode) {
    return (
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
              <AttachmentComponent
                key={attachment.id}
                attachment={attachment}
                width={width * 0.8 - 20}
              />
            ))}
          </View>
        ) : null}
      </Pressable>
    );
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
  if (item === undefined) {
    return null;
  }
  return (
    <Pressable
      onPress={() => {
        Linking.openURL(item.item.link);
      }}
      style={{
        margin: 5,
        borderRadius: 15,
        width: width - 10,
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
  const newValue = Math.floor(width / 400);
  if (newValue === 0) {
    return 1;
  }
  return newValue;
}

function ResourceScholarships() {
  const { height, width } = useSelector((state: RootState) => state.dimensions);
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
        renderItem={item => {
          return (
            <ScholarshipBlock
              key={item.item.id}
              item={item}
              width={width / numberScholarBlock(width)}
            />
          );
        }}
        numColumns={numberScholarBlock(width)}
        style={{
          height: height * 0.85,
          width,
          backgroundColor: Colors.lightGray,
        }}
        ListFooterComponent={() => <View style={{ height: 100 }} />}
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
    (state: RootState) => state.dimensions,
  );
  const { resources, loadingState, selectedResourceMode } = useSelector(
    (state: RootState) => state.resources,
  );
  const isGovernmentMode = useSelector(
    (state: RootState) => state.isGovernmentMode,
  );
  const { searchValue } = useSelector((state: RootState) => state.resources);
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
    if (selectedResourceMode === resourceMode.home) {
      getResources();
    } else {
      getCategoryResources(selectedResourceMode);
    }
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
        <SearchBar
          value={searchValue}
          onChangeText={e => dispatch(resourcesSlice.actions.setSearchValue(e))}
          onSearch={() => getResourcesSearch(searchValue)}
        />
        <View
          style={{
            width,
            height: height * 0.05,
            backgroundColor: Colors.lightGray,
          }}
        />
        {selectedResourceMode === resourceMode.news ? <ResourcesNews /> : null}
        {selectedResourceMode === resourceMode.scholarships ? (
          <ResourceScholarships />
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
                    ListFooterComponent={() => <View style={{ height: 100 }} />}
                  />
                ) : (
                  <Text>Failed</Text>
                )}
              </>
            )}
            <ResourceBar />
          </View>
        ) : null}
        <ResourceBar />
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
  const { height, width } = useSelector((state: RootState) => state.dimensions);
  const [categoryState, setCategoryState] = useState<loadingStateEnum>(
    loadingStateEnum.notStarted,
  );
  const [selectedCategory, setSelectedCategory] = useState<resourceMode>(
    resourceMode.home,
  );
  const [tagResourceState, setTagResourceState] = useState<loadingStateEnum>(
    loadingStateEnum.notStarted,
  );
  const [tagId, setTagId] = useState<string | undefined>(undefined);
  async function updateTagResource() {
    setCategoryState(loadingStateEnum.loading);
    const result = await tagResource(
      teamId,
      channelId,
      messageId,
      selectedCategory,
      tagId,
    );
    setCategoryState(result);
  }
  async function loadTagResource() {
    setTagResourceState(loadingStateEnum.loading);
    const result = await getTaggedResource(teamId, channelId, messageId);
    if (result.result === loadingStateEnum.success) {
      setTagId(result.data.tagId);
      setSelectedCategory(result.data.category);
      setTagResourceState(loadingStateEnum.success);
    }
    setTagResourceState(result.result);
  }

  useEffect(() => {
    loadTagResource();
  }, []);

  if (tagResourceState === loadingStateEnum.loading) {
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
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Pressable
          onPress={() => onClose()}
          style={{ position: 'absolute', left: 20, top: 20 }}
        >
          <CloseIcon width={12} height={12} />
        </Pressable>
        <ProgressView width={14} height={14} />
        <Text>Loading</Text>
      </View>
    );
  }

  if (
    tagResourceState === loadingStateEnum.notFound ||
    tagResourceState === loadingStateEnum.success
  ) {
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
        <StyledButton
          onPress={() => setSelectedCategory(resourceMode.sports)}
          text="Sports"
          selected={selectedCategory === resourceMode.sports}
          style={{ marginLeft: 15, marginRight: 15, marginTop: 15 }}
        />
        <StyledButton
          onPress={() => setSelectedCategory(resourceMode.schoolEvents)}
          text="School Events"
          selected={selectedCategory === resourceMode.schoolEvents}
          style={{ marginLeft: 15, marginRight: 15, marginTop: 20 }}
        />
        <StyledButton
          onPress={() => setSelectedCategory(resourceMode.annoucments)}
          text="Annoucments"
          selected={selectedCategory === resourceMode.annoucments}
          style={{ marginLeft: 15, marginRight: 15, marginTop: 20 }}
        />
        <StyledButton
          onPress={() => setSelectedCategory(resourceMode.fitness)}
          text="Fitness"
          selected={selectedCategory === resourceMode.fitness}
          style={{ marginLeft: 15, marginRight: 15, marginTop: 20 }}
        />
        <StyledButton
          onPress={() => setSelectedCategory(resourceMode.files)}
          text="Files"
          selected={selectedCategory === resourceMode.files}
          style={{ marginLeft: 15, marginRight: 15, marginTop: 20 }}
        />
        <StyledButton
          onPress={() => updateTagResource()}
          text={getTextState(categoryState, { notStarted: 'Confirm' })}
          second
          style={{ marginLeft: 15, marginRight: 15, marginTop: 25 }}
          textStyle={{ marginLeft: 'auto', marginRight: 'auto' }}
        />
      </View>
    );
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
      <Text>Something went wrong</Text>
    </View>
  );
}
