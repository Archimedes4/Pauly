/*
  Pauly
  Andrew Mainella
  3 December 2023
*/
import {
  View,
  Text,
  Pressable,
  Modal,
  FlatList,
  ListRenderItemInfo,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import BackButton from '@components/BackButton';
import MicrosoftFilePicker from '@components/MicrosoftFilePicker';
import store, { RootState } from '@redux/store';
import {
  changeStudentSelection,
  getStudentData,
  getUsersAndPhotos,
  removeStudentSelection,
} from '@utils/studentFunctions';
import { CloseIcon } from '@components/Icons';
import { studentSearchSlice } from '@redux/reducers/studentSearchReducer';
import { Colors, loadingStateEnum, styles } from '@constants';
import ProgressView from '@components/ProgressView';
import addImage from '@utils/addImage';
import { getTextState } from '@utils/ultility/createUUID';
import SecondStyledButton from '@components/StyledButton';
import SearchBar from '@components/SearchBar';

function SelectMainFile({
  userId,
  setFilePickingMode,
}: {
  userId: string;
  setFilePickingMode: (item: filePickingModeEnum) => void;
}) {
  const { width, height } = useSelector((state: RootState) => state.dimensions);
  const [fileData, setFileData] = useState<studentInformationType[]>([]);
  const [fileState, setFileState] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );
  const [selectedFileListId, setSelectedFileListId] = useState<string>('');

  async function loadData() {
    const result = await getStudentData(userId);
    if (result.result === loadingStateEnum.success) {
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
          shadowColor: Colors.black,
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
  const { height, width } = useSelector((state: RootState) => state.dimensions);
  const { usersState, users } = useSelector(
    (state: RootState) => state.studentSearch,
  );
  const dispatch = useDispatch();

  async function loadUsers() {
    getUsersAndPhotos();
  }

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <View style={{ width, height, backgroundColor: Colors.white }}>
      <View style={{ height: height * 0.15, backgroundColor: Colors.darkGray }}>
        <BackButton to="/government/" />
        <Text style={styles.headerText}>Government Students</Text>
      </View>
      <SearchBar
        value={store.getState().studentSearch.searchText}
        onChangeText={e => {
          dispatch(studentSearchSlice.actions.setStudentSearch(e));
        }}
        onSearch={() => loadUsers()}
      />
      <View style={{ width, height: height * 0.05 }} />
      <View style={{ height: height * 0.7 }}>
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
        <SecondStyledButton
          text="Select Folder"
          style={{ marginLeft: 10, marginTop: 'auto', marginBottom: 'auto' }}
        />
        <SecondStyledButton
          text="Select Maping Keys"
          style={{ marginLeft: 10, marginTop: 'auto', marginBottom: 'auto' }}
        />
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
  const { height, width } = useSelector((state: RootState) => state.dimensions);
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

function StudentsSelectFile({
  setFilePickingMode,
  userId,
}: {
  setFilePickingMode: (item: filePickingModeEnum) => void;
  userId: string;
}) {
  const { width, height } = useSelector((state: RootState) => state.dimensions);
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
              shadowColor: Colors.black,
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
              shadowColor: Colors.black,
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
