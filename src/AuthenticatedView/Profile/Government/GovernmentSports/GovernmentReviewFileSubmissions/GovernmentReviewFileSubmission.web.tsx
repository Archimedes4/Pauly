import { View, Text, Image, Pressable } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import callMsGraph from '../../../../../Functions/Ultility/microsoftAssets'
import { Link, useParams } from 'react-router-native';
import getFileWithShareID from '../../../../../Functions/Ultility/getFileWithShareID';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../../Redux/store';
// import Video from 'react-native-video';

enum dataContentTypeOptions {
    video,
    image,
    unknown
}

export default function GovernmentReviewFileSubmission() {
    const { submissionID } = useParams()
    const {siteId} = useSelector((state: RootState) => state.paulyList)
    const [dataURL, setDataURL] = useState<string>("")
    const [dataContentType, setDataContentType] = useState<dataContentTypeOptions>(dataContentTypeOptions.unknown)
    const [currentSubmissionInfomration, setCurrentSubmissionInformation] = useState<mediaSubmissionType | undefined>(undefined)
    async function deleteSubmission(itemID: string): Promise<boolean> {
        const result = await callMsGraph("https://graph.microsoft.com/v1.0/sites/8td1tk.sharepoint.com,b2ef509e-4511-48c3-b607-a8c2cddc0e35,091feb8c-a978-4e3f-a60f-ecdc319b2304/lists/bf26e642-f655-47db-a037-188189b0d378/items/" + itemID, "DELETE")//TO DO fix list ids
        if (result.ok){
            return true
        } else {
            return false
        }
    }
    async function getSubmissionInformation(submissionID: string) { //TO handle errors
        const result = await callMsGraph("https://graph.microsoft.com/v1.0/sites/8td1tk.sharepoint.com,b2ef509e-4511-48c3-b607-a8c2cddc0e35,091feb8c-a978-4e3f-a60f-ecdc319b2304/lists/bf26e642-f655-47db-a037-188189b0d378/items?expand=fields&filter=fields/SubmissionID%20eq%20'"+ submissionID +"'")//TO DO deal wth id
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
                    } else {
                        //TO DO something went wrong
                    }
                } else {
                    //TO Do this is not good only one result should be returned
                }
            } else {
                //TO DO this submission does not exist
            }
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
                "fields": {
                    Title: currentSubmissionInfomration.Title,
                    FileId: currentSubmissionInfomration.FileId,
                    Caption: currentSubmissionInfomration.Title
                }
            }
            const result = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + siteId + "/lists/d10e9373-7e8b-4400-98f1-62ba95e4cd34/items", "POST", false, JSON.stringify(data))
            console.log(result)
            const dataResult = await result.json()
            console.log(dataResult)
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
    </View>
  )
}