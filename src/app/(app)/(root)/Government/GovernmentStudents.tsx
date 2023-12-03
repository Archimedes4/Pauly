import {
  View,
  Text,
  Pressable,
  ViewStyle,
  Platform,
  TextInput,
  Modal,
  FlatList,
  ListRenderItemInfo,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import BackButton from '../../../../components/BackButton';
import MicrosoftFilePicker from '../../../../components/MicrosoftFilePicker';
import store, { RootState } from '../../../../Redux/store';
import {
  changeStudentSelection,
  getStudentData,
  getUsers,
  removeStudentSelection,
} from '../../../../Functions/studentFunctions';
import { CloseIcon, SearchIcon } from '../../../../components/Icons';
import { studentSearchSlice } from '../../../../Redux/reducers/studentSearchReducer';
import { Colors, loadingStateEnum } from '../../../../types';
import ProgressView from '../../../../components/ProgressView';
import addImage from '../../../../Functions/addImage';
import { getTextState } from '../../../../Functions/ultility/createUUID';

function SelectMainFile({
  userId,
  setFilePickingMode,
}: {
  userId: string;
  setFilePickingMode: (item: filePickingModeEnum) => void;
}) {
  const { width, height } = useSelector((state: RootState) => state.dimentions);
  const [fileData, setFileData] = useState<studentInformationType[]>([]);
  const [fileState, setFileState] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );
  const [selectedFileListId, setSelectedFileListId] = useState<string>('');

  async function loadData() {
    const result = await getStudentData(userId);
    if (
      result.result === loadingStateEnum.success &&
      result.data !== undefined
    ) {
      setFileState(loadingStateEnum.success);
      setFileData(result.data);
      const selectedFileList = result.data.find(e => {
        return e.selected;
      });
      if (selectedFileList !== undefined) {
        setSelectedFileListId(selectedFileList.listId);
      }
    } else {
      setFileState(loadingStateEnum.failed);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <View
      style={{
        height,
        width,
        position: 'absolute',
        zIndex: 200,
        top: 0,
        right: 0,
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.lightGray,
      }}
    >
      <Pressable
        onPress={() => {
          setFilePickingMode(filePickingModeEnum.notStarted);
        }}
        style={{
          position: 'absolute',
          top: height * 0.05,
          left: height * 0.05,
        }}
      >
        <CloseIcon width={20} height={20} />
      </Pressable>
      <View
        style={{
          height: height * 0.8,
          width: width * 0.8,
          shadowColor: 'black',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.8,
          shadowRadius: 10,
          backgroundColor: Colors.white,
          borderRadius: 15,
        }}
      >
        <View style={{ margin: 10 }}>
          {fileState === loadingStateEnum.loading ? (
            <View>
              <Text>Loading</Text>
            </View>
          ) : (
            <>
              {fileState === loadingStateEnum.success ? (
                <FlatList
                  data={fileData}
                  renderItem={file => (
                    <StudentSelectFileBlock
                      key={`${file.item.listId}_${file.item.createdTime}`}
                      file={file}
                      setFileData={setFileData}
                      fileData={fileData}
                      selectedFileListId={selectedFileListId}
                      setSelectedFileListId={setSelectedFileListId}
                    />
                  )}
                />
              ) : (
                <View>
                  <Text>Failed</Text>
                </View>
              )}
            </>
          )}
          <Pressable
            onPress={() => setFilePickingMode(filePickingModeEnum.create)}
          >
            <Text>Create</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function StudentSelectFileBlock({
  file,
  selectedFileListId,
  setSelectedFileListId,
  fileData,
  setFileData,
}: {
  file: ListRenderItemInfo<studentInformationType>;
  setFileData: (item: studentInformationType[]) => void;
  fileData: studentInformationType[];
  selectedFileListId: string;
  setSelectedFileListId: (item: string) => void;
}) {
  const [updateState, setUpdateState] = useState(loadingStateEnum.notStarted);

  async function callRemoveSelection() {
    setUpdateState(loadingStateEnum.loading);
    const result = await removeStudentSelection(
      file.item.listId,
      file.index,
      fileData,
    );
    if (
      result.result === loadingStateEnum.success &&
      result.fileData !== undefined
    ) {
      setSelectedFileListId('');
      setFileData(result.fileData);
      setUpdateState(loadingStateEnum.success);
    } else {
      setUpdateState(loadingStateEnum.failed);
    }
  }

  async function callChangeSelection() {
    setUpdateState(loadingStateEnum.loading);
    const result = await changeStudentSelection(
      file.item.listId,
      selectedFileListId,
      fileData,
      file.index,
    );
    if (
      result.result === loadingStateEnum.success &&
      result.fileData !== undefined
    ) {
      setUpdateState(loadingStateEnum.success);
      setFileData(result.fileData);
    } else {
      setUpdateState(loadingStateEnum.failed);
    }
  }

  return (
    <Pressable
      onPress={() => {
        if (file.item.selected) {
          callRemoveSelection();
        } else {
          callChangeSelection();
        }
      }}
      style={{
        backgroundColor: file.item.selected ? Colors.lightGray : Colors.white,
        borderRadius: 15,
        shadowColor: Colors.black,
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 5,
        flexDirection: 'row',
      }}
    >
      <>
        {updateState === loadingStateEnum.loading ? (
          <ProgressView width={14} height={14} />
        ) : (
          <View
            style={{
              width: 14,
              height: 14,
              backgroundColor:
                updateState === loadingStateEnum.success ||
                loadingStateEnum.notStarted
                  ? 'green'
                  : Colors.danger,
              borderRadius: 7,
            }}
          />
        )}
      </>
      <Text style={{ margin: 10 }}>
        {new Date(file.item.createdTime).toLocaleDateString()}
      </Text>
    </Pressable>
  );
}

export default function GovernmentStudents() {
  const { height, width } = useSelector((state: RootState) => state.dimentions);
  const { usersState, users } = useSelector(
    (state: RootState) => state.studentSearch,
  );

  async function loadUsers() {
    getUsers();
  }

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <View style={{ width, height, backgroundColor: Colors.white }}>
      <View style={{ height: height * 0.1 }}>
        <BackButton to="/profile/government/" />
        <Text style={{ marginTop: 14 }}>Government Students</Text>
      </View>
      <SearchBox
        getUsers={() => {
          loadUsers();
        }}
      />
      <View style={{ width, height: height * 0.05 }} />
      <View style={{ height: height * 0.75 }}>
        {usersState === loadingStateEnum.loading ? (
          <View
            style={{
              width,
              height: height * 0.8,
              alignContent: 'center',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ProgressView width={12} height={12} />
            <Text>Loading</Text>
          </View>
        ) : (
          <>
            {usersState === loadingStateEnum.success ? (
              <FlatList data={users} renderItem={e => <StudentItem e={e} />} />
            ) : (
              <Text>Failed</Text>
            )}
          </>
        )}
      </View>
      <View style={{ flexDirection: 'row', height: height * 0.1 }}>
        <Pressable>
          <Text>Select Folder</Text>
        </Pressable>
        <Pressable>
          <Text>Select Maping Keys</Text>
        </Pressable>
      </View>
    </View>
  );
}

enum filePickingModeEnum {
  notStarted,
  select,
  create,
}

function StudentItem({ e }: { e: ListRenderItemInfo<schoolUserType> }) {
  const { height, width } = useSelector((state: RootState) => state.dimentions);
  const [filePickingMode, setFilePickingMode] = useState<filePickingModeEnum>(
    filePickingModeEnum.notStarted,
  );
  return (
    <View style={{ flexDirection: 'row', margin: 5 }}>
      <Text>{e.item.name}</Text>
      <Pressable
        onPress={() => {
          setFilePickingMode(filePickingModeEnum.select);
        }}
        style={{ marginLeft: 2 }}
      >
        <Text style={{ margin: 2 }}>Choose File</Text>
      </Pressable>
      <Modal
        visible={filePickingMode !== filePickingModeEnum.notStarted}
        animationType="slide"
        transparent
        style={{ width: width * 0.8 }}
        onRequestClose={() =>
          setFilePickingMode(filePickingModeEnum.notStarted)
        }
      >
        <Pressable
          onPress={() => setFilePickingMode(filePickingModeEnum.notStarted)}
          style={{
            position: 'absolute',
            left: 0,
            height,
            zIndex: -1,
            width,
          }}
        />
        <>
          {filePickingMode === filePickingModeEnum.create ? (
            <StudentsSelectFile
              setFilePickingMode={setFilePickingMode}
              userId={e.item.id}
            />
          ) : (
            <SelectMainFile
              userId={e.item.id}
              setFilePickingMode={setFilePickingMode}
            />
          )}
        </>
      </Modal>
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
            <Text style={{ color: 'white' }}>{searchText}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function StudentsSelectFile({
  setFilePickingMode,
  userId,
}: {
  setFilePickingMode: (item: filePickingModeEnum) => void;
  userId: string;
}) {
  const { width, height } = useSelector((state: RootState) => state.dimentions);
  const [isReviewing, setIsReviewing] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<
    microsoftFileType | undefined
  >(undefined);
  const [addImageState, setAddImageState] = useState<loadingStateEnum>(
    loadingStateEnum.notStarted,
  );

  async function loadAddImage() {
    if (selectedFile !== undefined) {
      setAddImageState(loadingStateEnum.loading);
      const result = await addImage(userId, selectedFile);
      setAddImageState(result);
    }
  }

  return (
    <View
      style={{
        height,
        width,
        position: 'absolute',
        zIndex: 200,
        top: 0,
        right: 0,
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.lightGray,
      }}
    >
      <Pressable
        onPress={() => {
          setFilePickingMode(filePickingModeEnum.select);
        }}
        style={{
          position: 'absolute',
          top: height * 0.05,
          left: height * 0.05,
        }}
      >
        <CloseIcon width={20} height={20} />
      </Pressable>
      <>
        {!isReviewing ? (
          <View
            style={{
              height: height * 0.8,
              width: width * 0.8,
              shadowColor: 'black',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.8,
              shadowRadius: 10,
              backgroundColor: Colors.white,
              borderRadius: 15,
            }}
          >
            <View style={{ margin: 10 }}>
              <MicrosoftFilePicker
                height={height * 0.8 - 5}
                width={width * 0.8 - 5}
                onSelectedFile={file => {
                  setIsReviewing(true);
                  setSelectedFile(file);
                }}
              />
            </View>
          </View>
        ) : (
          <View
            style={{
              height: height * 0.8,
              width: width * 0.8,
              shadowColor: 'black',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.8,
              shadowRadius: 10,
              backgroundColor: Colors.white,
              borderRadius: 15,
            }}
          >
            <View style={{ margin: 10 }}>
              {selectedFile !== undefined ? (
                <Pressable
                  onPress={() => {
                    loadAddImage();
                  }}
                >
                  <Text>
                    {getTextState(addImageState, { notStarted: 'Confirm' })}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        )}
      </>
    </View>
  );
}
