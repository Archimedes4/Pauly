import { ApprovedIcon, CloseIcon, DeniedIcon, WarningIcon } from "@src/components/Icons";
import ProgressView from "@src/components/ProgressView";
import { Colors, loadingStateEnum, submissionTypeEnum } from "@src/constants";
import store from "@src/redux/store";
import getSubmissions from "@src/utils/commissions/getSubmissions";
import { getTextState } from "@src/utils/ultility/createUUID";
import { getFileWithShareID } from "@src/utils/ultility/handleShareID";
import callMsGraph from "@src/utils/ultility/microsoftAssests";
import React, { useEffect } from "react";
import { useState } from "react";
import { Pressable, View, Text, Image, ListRenderItemInfo, FlatList } from "react-native";

export default function CommissionSubmissions({
  commissionId,
  width,
  height,
}: {
  commissionId: string;
  width: number;
  height: number;
}) {
  // Loading State
  const [submissiosState, setSubmissionsState] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );

  const [submissions, setSubmissions] = useState<submissionType[]>([]);
  const [selectedSubmissionMode, setSelectedSubmissionMode] =
    useState<submissionTypeEnum>(submissionTypeEnum.unApproved);

  const [selectedSubmission, setSelectedSubmission] = useState<string>("");

  async function loadData() {
    setSubmissionsState(loadingStateEnum.loading);
    const result = await getSubmissions({commissionId, submissionType: selectedSubmissionMode});
    if (
      result.result === loadingStateEnum.success &&
      result.data !== undefined
    ) {
      setSubmissions(result.data);
      setSubmissionsState(result.result);
      if (result.count === 0) {
        const secondResult = await getSubmissions({
          commissionId,
          submissionType: submissionTypeEnum.unApproved,
        });
        if (
          secondResult.result === loadingStateEnum.success &&
          secondResult.data !== undefined
        ) {
          setSubmissions(result.data);
          setSubmissionsState(secondResult.result);
        }
      }
    } else {
      setSubmissionsState(result.result);
    }
  }
  useEffect(() => {
    loadData();
  }, [selectedSubmissionMode]);

  if (submissiosState === loadingStateEnum.loading) {
    return (
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
    );
  }

  if (submissiosState === loadingStateEnum.success) {
    return (
      <>
        <View style={{ width, height }}>
          <View style={{ flexDirection: 'row' }}>
            <Pressable
              onPress={() => setSelectedSubmissionMode(submissionTypeEnum.all)}
              style={{ marginLeft: 'auto', marginRight: 'auto' }}
            >
              <Text>All</Text>
            </Pressable>
            <Pressable
              onPress={() =>
                setSelectedSubmissionMode(submissionTypeEnum.unApproved)
              }
              style={{ marginLeft: 'auto', marginRight: 'auto' }}
            >
              <Text>Unapproved</Text>
            </Pressable>
            <Pressable
              onPress={() =>
                setSelectedSubmissionMode(submissionTypeEnum.approved)
              }
              style={{ marginLeft: 'auto', marginRight: 'auto' }}
            >
              <Text>Approved</Text>
            </Pressable>
          </View>
          <FlatList
            data={submissions}
            renderItem={submission => (
              <CommissionSubmissionButton key={submission.item.id} submission={submission} setSelectedSubmission={setSelectedSubmission}/>
            )}
          />
        </View>
        <SubmissionView
          width={width}
          height={height}
          submissionData={submissions.find((e) => {return e.id === selectedSubmission})}
          onClose={() => setSelectedSubmission("")}
          onSetSubmissionData={e => {
            const newSubmissions = [...submissions];
            const index = newSubmissions.findIndex(sub => {
              return e.id === sub.id;
            });
            newSubmissions[index] = e;
            setSubmissions(newSubmissions);
          }}
        />
      </>
    );
  }

  return (
    <View>
      <Text>Failed To Load Submissions</Text>
    </View>
  );
}

function SubmissionView({
  width,
  height,
  submissionData,
  onClose,
  onSetSubmissionData
}: {
  width: number;
  height: number;
  submissionData?: submissionType;
  onSetSubmissionData: (item: submissionType) => void;
  onClose: () => void;
}) {
  const [changeState, setChangeState] = useState<loadingStateEnum>(
    loadingStateEnum.notStarted,
  );
  const [imageState, setImageState] = useState<loadingStateEnum>(
    loadingStateEnum.notStarted,
  );
  const [imageUri, setImageUri] = useState<string>('');
  const [imgHeight, setImgHeight] = useState<number>(0);

  async function changeSubmissionApproved() {
    if (submissionData === undefined) {
      return
    }
    setChangeState(loadingStateEnum.loading);
    const data = {
      fields: {
        submissionApproved: !submissionData.approved,
        submissionReviewed: true,
      },
    };
    try {
      const result = await callMsGraph(
        `https://graph.microsoft.com/v1.0/sites/${
          store.getState().paulyList.siteId
        }/lists/${store.getState().paulyList.commissionSubmissionsListId}/items/${
          submissionData.itemId
        }`,
        'PATCH',
        JSON.stringify(data),
      );
      if (result.ok) {
        onSetSubmissionData({
          ...submissionData,
          approved: !submissionData.approved,
          reviewed: true
        })
        setChangeState(loadingStateEnum.success);
      } else {
        setChangeState(loadingStateEnum.failed);
      }
    } catch {
      setChangeState(loadingStateEnum.failed);
    }
  }

  async function loadImage() {
    if (submissionData !== undefined && submissionData.submissionImage !== undefined) {
      setImageState(loadingStateEnum.loading);
      const shareResult = await getFileWithShareID(
        submissionData.submissionImage,
        0,
      );
      if (
        shareResult.result === loadingStateEnum.success &&
        shareResult.url !== undefined
      ) {
        setImageUri(shareResult.url);
        setImageState(shareResult.result);
        Image.getSize(
          shareResult.url,
          (imageMeasureWidth, imageMeasureHeight) => {
            const heightPerWidth = imageMeasureHeight / imageMeasureWidth;
            setImgHeight(width * 0.7 * heightPerWidth);
          },
        );
      }
      setImageState(shareResult.result);
    }
  }

  useEffect(() => {
    setChangeState(loadingStateEnum.notStarted)
    loadImage();
  }, []);

  if (submissionData === undefined) {
    return null
  }

  return (
    <View
      style={{
        width: width * 0.8,
        height: height * 0.8,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        borderRadius: 15,
        position: 'absolute',
        left: width * 0.1,
        top: height * 0.1,
        zIndex: 2,
        backgroundColor: Colors.white,
      }}
    >
      <Pressable onPress={() => onClose()} style={{ margin: 10 }}>
        <CloseIcon width={12} height={12} />
      </Pressable>
      <View
        style={{
          width: width * 0.8,
          alignContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text>Submission</Text>
        <Text>By: {submissionData.userName}</Text>
        <Text>
          Time:{' '}
          {new Date(submissionData.submissionTime).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
          })}
        </Text>
        <Text>Approved: {submissionData.approved ? 'TURE' : 'FALSE'}</Text>
        <Text>Reviewed: {submissionData.reviewed ? 'TRUE' : 'FALSE'}</Text>
        <Text>Id: {submissionData.id}</Text>
        {submissionData.submissionImage ? (
          <>
            {imageState === loadingStateEnum.loading ? (
              <View
                style={{
                  width: width * 0.8,
                  height: height * 0.8,
                  alignContent: 'center',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ProgressView
                  width={
                    width * 0.8 < height * 0.8 ? width * 0.3 : height * 0.3
                  }
                  height={
                    width * 0.8 < height * 0.8 ? width * 0.3 : height * 0.3
                  }
                />
                <Text>Loading</Text>
              </View>
            ) : (
              <>
                {imageState === loadingStateEnum.success ? (
                  <Image
                    source={{ uri: imageUri }}
                    width={width * 0.7}
                    resizeMode="center"
                    style={{
                      width: width * 0.7,
                      height: imgHeight,
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
                  <Text>Failed to load image</Text>
                )}
              </>
            )}
          </>
        ) : null}
      </View>
      <Pressable onPress={() => changeSubmissionApproved()}>
        <Text>
          {getTextState(changeState, {
            notStarted: submissionData.approved ? 'REMOVE APPROVAL' : 'APPROVE',
          })}
        </Text>
      </Pressable>
    </View>
  );
}

function CommissionSubmissionButton({submission, setSelectedSubmission}:{submission: ListRenderItemInfo<submissionType>, setSelectedSubmission: (item: string) => void}) {
  const [isHover, setIsHover] = useState<boolean>(false)
  return (
    <Pressable
      style={{ margin: 10, borderColor: Colors.darkGray, borderWidth: 2, borderRadius: 15, padding: 15, backgroundColor: isHover ? Colors.lightGray:Colors.white, flexDirection: 'row' }}
      onPress={() => setSelectedSubmission(submission.item.id)}
      onHoverIn={() => {setIsHover(true)}}
      onHoverOut={() => {setIsHover(false)}}
    >
      <View>
        <Text style={{fontFamily: "Roboto-Bold"}}>{submission.item.userName}</Text>
        <Text style={{fontFamily: "Roboto"}}>
          {new Date(submission.item.submissionTime).toLocaleDateString(
            'en-US',
            {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              second: 'numeric',
            },
          )}
        </Text>
      </View>
      <View style={{margin: 'auto', marginLeft: 'auto', marginRight: 0}}>
        {submission.item.approved ?
          <View>
            <ApprovedIcon width={14} height={14}/>
          </View>:null
        }
        {submission.item.reviewed && !submission.item.approved ?
          <View style={{margin: 'auto', marginRight: 0}}>
            <DeniedIcon width={14} height={14}/>
          </View>:null
        }
        {(!submission.item.approved && !submission.item.reviewed) ?
          <View style={{margin: 'auto', marginLeft: 'auto', marginRight: 0, borderRadius: 100, backgroundColor: Colors.danger}}>
            <WarningIcon width={14} height={14} outlineColor={Colors.white}/>
          </View>:null
        }
      </View>
    </Pressable>
  )
}