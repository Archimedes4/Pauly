import { View, Text, Image, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-native';
import { useSelector } from 'react-redux';
import { ResizeMode, Video } from 'expo-av';
import callMsGraph from '../../../../Functions/ultility/microsoftAssets';
import getFileWithShareID from '../../../../Functions/ultility/getFileWithShareID';
import store, { RootState } from '../../../../Redux/store';
import {
  Colors,
  dataContentTypeOptions,
  loadingStateEnum,
  postType,
} from '../../../../types';
import SportsYoutube from '../../../../UI/SportsYoutube';
import { getTextState } from '../../../../Functions/ultility/createUUID';

function getDenyText(reviewed: boolean, accepted: boolean) {
  if (!reviewed && !accepted) {
    'SubmissionDenied'
  } else {
    return 'Deny'
  }
}

export default function GovernmentReviewFileSubmission() {
  const { width, height } = useSelector((state: RootState) => state.dimentions);

  const { submissionID } = useParams();
  const [dataURL, setDataURL] = useState<string>('');
  const [dataContentType, setDataContentType] =
    useState<dataContentTypeOptions>(dataContentTypeOptions.unknown);
  const [currentSubmissionInfomration, setCurrentSubmissionInformation] =
    useState<mediaSubmissionType | undefined>(undefined);
  const navigate = useNavigate();

  // Loading States
  const [loadingState, setLoadingState] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );
  const [approveSubmissionState, setApproveSubmissionState] =
    useState<loadingStateEnum>(loadingStateEnum.notStarted);
  const [denySubmissionState, setDenySubmissionState] =
    useState<loadingStateEnum>(loadingStateEnum.notStarted);
  const [deleteState, setDeleteState] =
    useState<loadingStateEnum>(loadingStateEnum.notStarted);

  async function deleteSubmission(itemID: string) {
    setDeleteState(loadingStateEnum.loading);
    const result = await callMsGraph(
      `https://graph.microsoft.com/v1.0/sites/${
        store.getState().paulyList.siteId
      }/lists/${
        store.getState().paulyList.sportsSubmissionsListId
      }/items/${itemID}`,
      'DELETE',
    ); // TO DO fix list ids
    if (result.ok) {
      // TO DO Check if submission has been approved before
      // Remove from approved submissions
      setDeleteState(loadingStateEnum.success);
    } else {
      setDeleteState(loadingStateEnum.failed);
    }
  }

  async function getSubmissionInformation() {
    if (submissionID !== undefined) {
      const result = await callMsGraph(
        `https://graph.microsoft.com/v1.0/sites/${
          store.getState().paulyList.siteId
        }/lists/${
          store.getState().paulyList.sportsSubmissionsListId
        }/items?expand=fields&filter=fields/submissionId%20eq%20'${submissionID}'`,
      );
      if (result.ok) {
        const data = await result.json();
        if (data.value !== undefined) {
          if (data.value.length === 1) {
            // All things are working
            setCurrentSubmissionInformation({
              Title: data.value[0].fields.Title,
              user: data.value[0].fields.user,
              submissionId: data.value[0].fields.submissionId,
              accepted: data.value[0].fields.accepted,
              fileId: data.value[0].fields.fileId,
              fileType: data.value[0].fields.fileType,
              itemID: data.value[0].id,
              selectedSportId: data.value[0].fields.selectedSportId,
              selectedTeamId: data.value[0].fields.selectedTeamId,
              reviewed: data.value[0].fields.reviewed,
            });
            setLoadingState(loadingStateEnum.success);
          } else {
            setLoadingState(loadingStateEnum.failed);
          }
        } else {
          setLoadingState(loadingStateEnum.failed);
        }
      } else {
        setLoadingState(loadingStateEnum.failed);
      }
    }
  }

  async function approveSubmission() {
    if (currentSubmissionInfomration) {
      setApproveSubmissionState(loadingStateEnum.loading);
      const data = {
        requests: [
          {
            id: '1',
            method: 'POST',
            url: `/sites/${store.getState().paulyList.siteId}/lists/${
              store.getState().paulyList.sportsApprovedSubmissionsListId
            }/items`,
            body: {
              fields: {
                Title: currentSubmissionInfomration.Title,
                fileId: currentSubmissionInfomration.fileId,
                fileType: currentSubmissionInfomration.fileType,
                caption: currentSubmissionInfomration.Title,
                submissionId: currentSubmissionInfomration.submissionId,
                selectedSportId: currentSubmissionInfomration.selectedSportId,
                selectedTeamId: currentSubmissionInfomration.selectedTeamId,
              },
            },
            headers: {
              'Content-Type': 'application/json',
            },
          },
          {
            id: '2',
            method: 'PATCH',
            url: `/sites/${store.getState().paulyList.siteId}/lists/${
              store.getState().paulyList.sportsSubmissionsListId
            }/items/${currentSubmissionInfomration.itemID}`,
            body: {
              fields: { accepted: true, reviewed: true },
            },
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ],
      };
      const result = await callMsGraph(
        'https://graph.microsoft.com/v1.0/$batch',
        'POST',
        JSON.stringify(data),
        [{ key: 'Accept', value: 'application/json' }],
      );
      if (result.ok) {
        const newInformation = currentSubmissionInfomration;
        newInformation.accepted = true;
        newInformation.reviewed = true;
        setCurrentSubmissionInformation(currentSubmissionInfomration);
        setApproveSubmissionState(loadingStateEnum.success);
      } else {
        setApproveSubmissionState(loadingStateEnum.failed);
      }
    }
  }

  async function denySubmission() {
    if (currentSubmissionInfomration) {
      const data = {
        fields: {
          accepted: false,
          reviewed: true,
        },
      };
      setDenySubmissionState(loadingStateEnum.loading);
      const result = await callMsGraph(
        `/sites/${store.getState().paulyList.siteId}/lists/${
          store.getState().paulyList.sportsSubmissionsListId
        }/items/${currentSubmissionInfomration.itemID}`,
        'PATCH',
        JSON.stringify(data),
      );
      if (result.ok) {
        setDenySubmissionState(loadingStateEnum.success);
      } else {
        setDenySubmissionState(loadingStateEnum.failed);
      }
    }
  }

  async function loadFile() {
    if (currentSubmissionInfomration !== undefined) {
      if (currentSubmissionInfomration.fileType === postType.microsoftFile) {
        const result = await getFileWithShareID(
          currentSubmissionInfomration.fileId,
          0,
        );
        if (
          result.result === loadingStateEnum.success &&
          result.url !== undefined &&
          result.contentType !== undefined
        ) {
          setDataURL(result.url);
          setDataContentType(result.contentType);
        }
      }
    }
  }

  useEffect(() => {
    if (submissionID !== undefined) {
      getSubmissionInformation();
    }
  }, [submissionID]);

  useEffect(() => {
    loadFile();
  }, [currentSubmissionInfomration]);

  return (
    <>
      {loadingState === loadingStateEnum.loading ? (
        <View
          style={{
            width,
            height,
            backgroundColor: Colors.white,
            alignContent: 'center',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text>Loading</Text>
        </View>
      ) : (
        <>
          {loadingState === loadingStateEnum.success &&
          currentSubmissionInfomration !== undefined ? (
            <View
              style={{
                width,
                height,
                backgroundColor: Colors.white,
              }}
            >
              <Pressable onPress={() => navigate('/profile/government/sports')}>
                <Text>Back</Text>
              </Pressable>
              <Text>GovernmentReviewFileSubmission</Text>
              {dataURL !== '' && (
                <View>
                  {dataContentType === dataContentTypeOptions.image ? (
                    <Image
                      height={100}
                      style={{ height: 100 }}
                      source={{ uri: dataURL }}
                    />
                  ) : null}
                  {dataContentType === dataContentTypeOptions.video ? (
                    <Video
                      useNativeControls
                      source={{ uri: dataURL }}
                      resizeMode={ResizeMode.COVER}
                      style={{
                        width: width * 0.9,
                        height: height * 0.4,
                        alignSelf: 'stretch',
                        marginLeft: width * 0.05,
                        marginRight: width * 0.05,
                      }}
                      videoStyle={{ width: width * 0.9, height: height * 0.4 }}
                    />
                  ) : null}
                </View>
              )}
              { (currentSubmissionInfomration.fileType === postType.youtubeVideo) ?
                <View style={{height: (width * 0.9/16) *9}}>
                  <SportsYoutube videoId={currentSubmissionInfomration.fileId} width={width*0.9}/>
                </View>:null
              }
              <Pressable
                onPress={() => {
                  if (currentSubmissionInfomration) {
                    deleteSubmission(currentSubmissionInfomration.itemID);
                  }
                }}
              >
                <Text>Remove File Submission</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  approveSubmission();
                }}
              >
                <Text>
                  {approveSubmissionState === loadingStateEnum.loading
                    ? 'Loading'
                    : approveSubmissionState === loadingStateEnum.success ||
                      approveSubmissionState === loadingStateEnum.notStarted
                    ? currentSubmissionInfomration.reviewed
                      ? currentSubmissionInfomration.accepted
                        ? 'Submission Approved'
                        : 'Approve'
                      : 'Approve'
                    : 'Failed'}
                </Text>
              </Pressable>
              <Pressable onPress={() => denySubmission()}>
                <Text>
                  {
                    getTextState(denySubmissionState, {
                      success: getDenyText(currentSubmissionInfomration.reviewed, currentSubmissionInfomration.accepted),
                      notStarted: getDenyText(currentSubmissionInfomration.reviewed, currentSubmissionInfomration.accepted)
                    })
                  }
                </Text>
              </Pressable>
            </View>
          ) : (
            <View style={{ width, height }}>
              <Pressable onPress={() => navigate('/profile/government/sports')}>
                <Text>Back</Text>
              </Pressable>
              <Text>Failed</Text>
            </View>
          )}
        </>
      )}
    </>
  );
}
