import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import { RootState } from '../../Redux/store';
import CommissionClaim from './CommissionClaim';
import getCommission from '../../Functions/commissions/getCommission';
import callMsGraph from '../../Functions/Ultility/microsoftAssets';
import ProgressView from '../../UI/ProgressView';
import { CloseIcon } from '../../UI/Icons/Icons';
import WebViewCross from '../../UI/WebViewCross';
import { Colors, commissionTypeEnum, loadingStateEnum } from '../../types';

enum CameraResult {
  notStarted,
  loading,
  success,
  permissionDenied,
  goToSettings,
  failed,
}

export default function CommissionsView({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const { width, height } = useSelector((state: RootState) => state.dimentions);
  const [commissionData, setCommissionData] = useState<
    commissionType | undefined
  >(undefined);
  const [commissionState, setCommissionState] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );
  const [messageState, setMessageState] = useState<loadingStateEnum>(
    loadingStateEnum.notStarted,
  );
  const [messageData, setMessageData] = useState<string>('');
  const [imageUri, setImageUri] = useState<string>('');
  const [takeImageState, setTakeImageState] = useState<CameraResult>(
    CameraResult.notStarted,
  );
  const [pickImageState, setPickerImageState] = useState<CameraResult>(
    CameraResult.notStarted,
  );
  const [isOverflowing, setIsOverflowing] = useState<boolean>(false);
  const [evaluatedOverflow, setEvaluatedOverflow] = useState<boolean>(false);
  const [imageHeight, setImageHeight] = useState<number>(0);

  async function getPost(teamId: string, channelId: string, messageId: string) {
    setMessageState(loadingStateEnum.loading);
    const result = await callMsGraph(
      `https://graph.microsoft.com/v1.0/teams/${teamId}/channels/${channelId}/messages/${messageId}`,
    );
    if (result.ok) {
      const data = await result.json();
      setMessageData(data.body.content);
      setMessageState(loadingStateEnum.success);
    } else {
      setMessageState(loadingStateEnum.failed);
    }
  }

  async function getCommissionInformation() {
    const result = await getCommission(id);
    if (
      result.result === loadingStateEnum.success &&
      result.data !== undefined
    ) {
      setCommissionData(result.data);
      if (result.data?.postData !== undefined) {
        getPost(
          result.data.postData.teamId,
          result.data.postData.channelId,
          result.data.postData.postId,
        );
      }
    }
    setCommissionState(result.result);
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
  const [status, requestPermission] = ImagePicker.useCameraPermissions();

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

  useEffect(() => {
    getCommissionInformation();
  }, [id]);

  const [fontsLoaded] = useFonts({
    BukhariScript: require('../../../assets/fonts/BukhariScript.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View
      style={{
        width: width * 0.9,
        height: height * 0.8,
        backgroundColor: Colors.white,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        borderRadius: 15,
      }}
    >
      {commissionState === loadingStateEnum.loading ? (
        <View
          style={{
            height: height * 0.8,
            width: width * 0.9,
            alignItems: 'center',
            justifyContent: 'center',
            alignContent: 'center',
          }}
        >
          <ProgressView
            width={width * 0.8 < height * 0.7 ? width * 0.4 : height * 0.35}
            height={width * 0.8 < height * 0.7 ? width * 0.4 : height * 0.35}
          />
          <Text>Loading</Text>
        </View>
      ) : (
        <>
          {commissionState === loadingStateEnum.success &&
          commissionData !== undefined ? (
            <View>
              <View style={{ height: height * 0.1, overflow: 'hidden' }}>
                <Pressable
                  onPress={() => onClose()}
                  style={{ marginTop: 10, marginLeft: 10 }}
                >
                  <CloseIcon
                    width={width < height ? width * 0.05 : height * 0.05}
                    height={width < height ? width * 0.05 : height * 0.05}
                  />
                </Pressable>
                <View
                  style={{
                    width: width * 0.9,
                    alignContent: 'center',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: height * 0.03 }}>
                    Commission: {commissionData.title}
                  </Text>
                </View>
              </View>
              <ScrollView
                style={{ height: isOverflowing ? height * 0.6 : height * 0.7 }}
              >
                <View
                  onLayout={e => {
                    if (e.nativeEvent.layout.height >= height * 0.6) {
                      setIsOverflowing(true);
                      setEvaluatedOverflow(true);
                    } else if (!evaluatedOverflow) {
                      setIsOverflowing(false);
                    }
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      margin: 10,
                      backgroundColor: Colors.maroon,
                      borderRadius: 15,
                      shadowOffset: { width: 2, height: 3 },
                    }}
                  >
                    <View style={{ margin: 10, flexDirection: 'row' }}>
                      <Image
                        source={require('../../../assets/images/PaulyLogo.png')}
                        resizeMode="contain"
                        style={{ width: 50, height: 50 }}
                      />
                      <Text
                        style={{
                          fontSize: 45,
                          color: Colors.white,
                          fontFamily: 'BukhariScript',
                          width: 100,
                          paddingLeft: 10,
                        }}
                      >
                        {commissionData.points}
                      </Text>
                    </View>
                  </View>
                  <View style={{ marginLeft: width * 0.05 }}>
                    <WebViewCross html={messageData} width={width * 0.7} />
                  </View>
                  {commissionData.value === commissionTypeEnum.Image ||
                  commissionData.value === commissionTypeEnum.ImageLocation ? (
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
                            backgroundColor: '#FFFFFF',
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
                            backgroundColor: '#FFFFFF',
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
                            {takeImageState === CameraResult.notStarted
                              ? 'TAKE PHOTO'
                              : takeImageState === CameraResult.goToSettings
                              ? 'Go To Settings And Give Camera Permissions'
                              : takeImageState === CameraResult.permissionDenied
                              ? 'Permission Denied'
                              : takeImageState === CameraResult.success
                              ? 'TAKE DIFFERENT PHOTO'
                              : 'AN ERROR OCCURED'}
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
                            {pickImageState === CameraResult.notStarted
                              ? 'CHOOSE PHOTO'
                              : pickImageState === CameraResult.permissionDenied
                              ? 'Permission Denied'
                              : pickImageState === CameraResult.success
                              ? 'USE A DIFFERENT PHOTO'
                              : 'AN ERROR OCCURED'}
                          </Text>
                        )}
                      </Pressable>
                    </>
                  ) : null}
                  {isOverflowing ? null : (
                    <View style={{ marginTop: 10, marginBottom: 10 }}>
                      <CommissionClaim commission={commissionData} />
                    </View>
                  )}
                </View>
              </ScrollView>
              {isOverflowing ? (
                <View
                  style={{
                    height: height * 0.1,
                    alignContent: 'center',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CommissionClaim
                    commission={commissionData}
                    imageData={imageUri !== '' ? imageUri : undefined}
                  />
                </View>
              ) : null}
            </View>
          ) : (
            <View>
              <Text>Something Went Wrong</Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}
