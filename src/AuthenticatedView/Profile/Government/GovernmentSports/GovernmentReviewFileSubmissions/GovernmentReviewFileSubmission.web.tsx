import { View, Text, Image, Pressable } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import callMsGraph from '../../../../../Functions/Ultility/microsoftAssets'
import { Link, useParams } from 'react-router-native';
import getFileWithShareID from '../../../../../Functions/Ultility/getFileWithShareID';
import { useSelector } from 'react-redux';
import store, { RootState } from '../../../../../Redux/store';
import { loadingStateEnum } from '../../../../../types';
// import Video from 'react-native-video';

enum dataContentTypeOptions {
  video,
  image,
  unknown
}

export default function GovernmentReviewFileSubmission() {
  const { submissionID } = useParams()
  const [dataURL, setDataURL] = useState<string>("")
  const [dataContentType, setDataContentType] = useState<dataContentTypeOptions>(dataContentTypeOptions.unknown)
  const [currentSubmissionInfomration, setCurrentSubmissionInformation] = useState<mediaSubmissionType | undefined>(undefined)

  //Loading States
  const [loadingState, setLoadingState] = useState<loadingStateEnum>(loadingStateEnum.loading)

  async function deleteSubmission(itemID: string): Promise<boolean> {
    const result = await callMsGraph(`https://graph.microsoft.com/v1.0/sites/${store.getState().paulyList.siteId}/lists/${store.getState().paulyList.sportsSubmissionsListId}/items/` + itemID, "DELETE")//TO DO fix list ids
    if (result.ok){
      //TO DO Check if submission has been approved before   
      //Remove from approved submissions
      return true
    } else {
      return false
    }
  }
  async function getSubmissionInformation(submissionID: string) {
    const result = await callMsGraph(`https://graph.microsoft.com/v1.0/sites/${store.getState().paulyList.siteId}/lists/${store.getState().paulyList.sportsSubmissionsListId}/items?expand=fields&filter=fields/SubmissionID%20eq%20'${submissionID}'`)
    if (result.ok) {
      const data = await result.json()
      if (data["value"].length !== undefined){
          if (data["value"].length <= 1){
            if (data["value"].length == 1){
              //All things are working
              //TO DO make sure that values cannot be undefined
              setCurrentSubmissionInformation({
                Title: data["value"][0]["fields"]["Title"],
                User: data["value"][0]["fields"]["User"],
                SubmissionID: data["value"][0]["fields"]["SubmissionID"],
                Accepted: data["value"][0]["fields"]["Accepted"],
                FileId: data["value"][0]["fields"]["FileId"],
                ItemID:  data["value"][0]["id"]
              })
              setLoadingState(loadingStateEnum.success)
            } else {
              setLoadingState(loadingStateEnum.failed)
            }
          } else {
            setLoadingState(loadingStateEnum.failed)
          }
      } else {
        setLoadingState(loadingStateEnum.failed)
      }
    } else {
      setLoadingState(loadingStateEnum.failed)
    }
  }
  async function getDataURL(url: string) {
    const response = await fetch(url)
    const dataBlob = await response.blob()
    const urlOut = URL.createObjectURL(dataBlob)
    console.log(urlOut)
    setDataURL(urlOut)
  }
  async function approveSubmission() {
    if (currentSubmissionInfomration){
      const data = {
        "requests": [
          {
            "id":"1",
            "method": "POST",
            "url": `/sites/${store.getState().paulyList.siteId}/lists/${store.getState().paulyList.sportsApprovedSubmissionsListId}/items`,
            "body": {
              "fields": {
                Title: currentSubmissionInfomration.Title,
                FileId: currentSubmissionInfomration.FileId,
                Caption: currentSubmissionInfomration.Title
              }
            },
            "headers": {
              "Content-Type": "application/json"
            }
          },
          {
            "id":"2",
            "method":"PATCH",
            "url": `/sites/${store.getState().paulyList.siteId}/lists/${store.getState().paulyList.sportsSubmissionsListId}/items/${currentSubmissionInfomration.ItemID}`,
            "body": {
              "fields":{"Accepted":true}
            },
            "headers": {
              "Content-Type": "application/json"
            }
          }
        
        ]
      }
      var resourceHeader = new Headers()
      resourceHeader.append("Accept", "application/json")
      const result = await callMsGraph("https://graph.microsoft.com/v1.0/$batch", "POST", false, JSON.stringify(data), undefined, undefined, resourceHeader)
      if (result.ok){

      } else {
        const data = await result.json()
        console.log(data)
      }
    }
  }
  useEffect(() => {
    if (submissionID !== undefined){
      getSubmissionInformation(submissionID)
    }
  }, [])
  useEffect(() => {
    if (currentSubmissionInfomration !== undefined){
      getFileWithShareID(currentSubmissionInfomration.FileId)
    }
  }, [currentSubmissionInfomration])
  return (
    <>
      { (loadingState === loadingStateEnum.loading) ?
        <Text>Loading</Text>:
        <>
          { (loadingState === loadingStateEnum.success) ?
          <View>
            <Link to="/profile/government/sports">
              <Text>Back</Text>
            </Link>
            <Text>GovernmentReviewFileSubmission</Text>
            { (dataURL !== "") &&
            <View>
              { (dataContentType === dataContentTypeOptions.image) ?
                <Image height={100} style={{height: 100}} source={{uri: dataURL}}/>:null
              }
              { (dataContentType === dataContentTypeOptions.video) ?
                // <Video source={{uri: dataURL}}   
                //  />:null
                <video src={dataURL} controls/>:null
              }
            </View>
            }
            <Pressable onPress={() => {
              if (currentSubmissionInfomration){
                deleteSubmission(currentSubmissionInfomration.ItemID)
              }
            }}>
                <Text>Remove File Submission</Text>
            </Pressable>
            <Pressable onPress={() => {approveSubmission()}}>
              <Text>Approve</Text>
            </Pressable>
            <Pressable>
              <Text>Deny</Text>
            </Pressable>
          </View>:
          <Text>Failed</Text>
          }
        </>
      }
    </>
  )
}