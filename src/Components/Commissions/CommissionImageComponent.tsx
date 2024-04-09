/*
  Pauly
  Andrew Mainella
  8 April 2024
  CommissionImageComponent.tsx
  This is a block in the commission view to pick the image.
*/
import { View, Text, Pressable, Image } from 'react-native'
import React, { useState } from 'react'
import * as ImagePicker from 'expo-image-picker';
import ProgressView from '../ProgressView';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { Colors } from '@constants';

enum CameraResult {
  notStarted,
  loading,
  success,
  permissionDenied,
  goToSettings,
  failed,
}

function getTextPickImage(result: CameraResult) {
  if (result === CameraResult.notStarted) {
    return 'CHOOSE PHOTO';
  }
  if (result === CameraResult.permissionDenied) {
    return 'Permission Denied';
  }
  if (result === CameraResult.success) {
    return 'USE A DIFFERENT PHOTO';
  }
  return 'AN ERROR OCCURED';
}

function getTextTakeImage(result: CameraResult) {
  if (result === CameraResult.notStarted) {
    return 'TAKE PHOTO';
  }
  if (result === CameraResult.goToSettings) {
    return 'Go To Settings And Give Camera Permissions';
  }
  if (result === CameraResult.permissionDenied) {
    return 'Permission Denied';
  }
  if (result === CameraResult.success) {
    return 'TAKE DIFFERENT PHOTO';
  }
  return 'AN ERROR OCCURED';
}

export default function CommissionImageComponent({imageUri, setImageUri}:{imageUri: string; setImageUri: (item: string) => void}) {
  const { width, height } = useSelector((state: RootState) => state.dimensions);
  const [takeImageState, setTakeImageState] = useState<CameraResult>(
    CameraResult.notStarted,
  );
  const [pickImageState, setPickerImageState] = useState<CameraResult>(
    CameraResult.notStarted,
  );
  const [status, requestPermission] = ImagePicker.useCameraPermissions();
  const [imageHeight, setImageHeight] = useState<number>(0);
  async function takeImage() {
    setTakeImageState(CameraResult.loading);
    if (status?.status === ImagePicker.PermissionStatus.GRANTED) {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        allowsMultipleSelection: false,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });
      if (!result.canceled) {
        if (result.assets.length === 1) {
          setImageUri(result.assets[0].uri);
          Image.getSize(
            result.assets[0].uri,
            (imageMeasureWidth, imageMeasureHeight) => {
              const heightPerWidth = imageMeasureHeight / imageMeasureWidth;
              setImageHeight(width * 0.7 * heightPerWidth);
            },
          );
          setTakeImageState(CameraResult.success);
        } else {
          setTakeImageState(CameraResult.failed);
        }
      } else {
        setTakeImageState(CameraResult.notStarted);
      }
    } else if (status?.canAskAgain) {
      const permissionResult = await requestPermission();
      if (permissionResult.granted) {
        takeImage();
      } else {
        setTakeImageState(CameraResult.permissionDenied);
      }
    } else {
      setTakeImageState(CameraResult.goToSettings);
    }
  }
  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: false,
      allowsEditing: false,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (!result.canceled) {
      if (result.assets.length === 1) {
        setImageUri(result.assets[0].uri);
        Image.getSize(
          result.assets[0].uri,
          (imageMeasureWidth, imageMeasureHeight) => {
            const heightPerWidth = imageMeasureHeight / imageMeasureWidth;
            setImageHeight(width * 0.7 * heightPerWidth);
          },
        );
        setPickerImageState(CameraResult.success);
      } else {
        setPickerImageState(CameraResult.failed);
      }
    } else {
      setPickerImageState(CameraResult.notStarted);
    }
  }
  return (
    <>
      {imageUri !== '' ? (
        <Image
          source={{ uri: imageUri }}
          width={width * 0.7}
          resizeMode="center"
          style={{
            width: width * 0.7,
            height: imageHeight,
            marginLeft: 'auto',
            marginRight: 'auto',
            alignContent: 'center',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: Colors.white,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.8,
            shadowRadius: 10,
            borderRadius: 15,
          }}
        />
      ) : (
        <View
          style={{
            width: width * 0.7,
            height: height * 0.3,
            marginLeft: 'auto',
            marginRight: 'auto',
            alignContent: 'center',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: Colors.white,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.8,
            shadowRadius: 10,
            borderRadius: 15,
          }}
        >
          <Text>No Photo Selected</Text>
        </View>
      )}
      <Pressable
        onPress={() => takeImage()}
        style={{
          marginLeft: 'auto',
          marginRight: 'auto',
          marginTop: 15,
          backgroundColor: '#ededed',
          width: width * 0.7,
          borderRadius: 15,
          alignItems: 'center',
          alignContent: 'center',
          justifyContent: 'center',
        }}
      >
        {takeImageState === CameraResult.loading ? (
          <ProgressView
            width={14}
            height={14}
            style={{ margin: 10 }}
          />
        ) : (
          <Text style={{ margin: 10, fontWeight: 'bold' }}>
            {getTextTakeImage(takeImageState)}
          </Text>
        )}
      </Pressable>
      <Pressable
        onPress={() => pickImage()}
        style={{
          marginLeft: 'auto',
          marginRight: 'auto',
          marginTop: 10,
          backgroundColor: '#ededed',
          width: width * 0.7,
          borderRadius: 15,
          alignItems: 'center',
          alignContent: 'center',
          justifyContent: 'center',
        }}
      >
        {pickImageState === CameraResult.loading ? (
          <ProgressView
            width={14}
            height={14}
            style={{ margin: 10 }}
          />
        ) : (
          <Text style={{ margin: 10, fontWeight: 'bold' }}>
            {getTextPickImage(pickImageState)}
          </Text>
        )}
      </Pressable>
    </>
  )
}