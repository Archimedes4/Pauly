import React, { useContext, useEffect, useState } from 'react'
// import { Card, Stack, Button, Form } from 'react-bootstrap';
import { accessTokenContent } from '../../App';
import { Button, Pressable, View, Text, TextInput, Dimensions } from 'react-native';
import Svg, { Polygon, Rect, G, Path } from 'react-native-svg';
// import {FcFolder, FcDocument} from "react-icons/fc"
import Picker from "./Picker/Picker"
import callMsGraph from '../Functions/microsoftAssets';
import { useMsal } from '@azure/msal-react';
import { DocumentIcon, FolderIcon } from './Icons/Icons';

enum MicrosoftUploadModeType {
    ShareLink,
    Personal,
    Site
}
declare global{
    type TeamsGroupType = {
        TeamName: string
        TeamId: string
        TeamDescription: string
    }
    
    type microsoftFileType = {
        name: string
        id: string
        lastModified: string
        folder: boolean
        parentDriveId: string
        parentPath: string
        itemGraphPath: string
    }
}

const windowDimensions = Dimensions.get('window');
const screenDimensions = Dimensions.get('screen');

export default function({ onSetIsShowingUpload, onSetIsShowingMicrosoftUpload, onSelectedFile, height, width}:{
    height: number,
    width: number,
    onSetIsShowingUpload?: (item: boolean) => void,
    onSetIsShowingMicrosoftUpload?: (item: boolean) => void,
    onSelectedFile: (item: microsoftFileType) => void
}) {
    const { instance, accounts } = useMsal();
    const pageData = useContext(accessTokenContent);
    const [usersTeams, setUsersTeams] = useState<TeamsGroupType[]>([])
    const [usersFiles, setUsersFies] = useState<microsoftFileType[]>([])
    const [microsoftPath, setMicrosoftPath] = useState<string>("https://graph.microsoft.com/v1.0/me/drive/root/children")
    const [selectedMicrosoftUploadMode, setSelectedMicrosoftUploadMode] = useState<MicrosoftUploadModeType>(MicrosoftUploadModeType.Personal)
    const [fileBackAvaliable, setFilesBackAvaliable] = useState<boolean>(false)
    const [shareLinkString, setShareLinkString] = useState<string>("")
    // const [dimensions, setDimensions] = useState({
    //     window: windowDimensions,
    //     screen: screenDimensions,
    // });

    // useEffect(() => {
    //     const subscription = Dimensions.addEventListener(
    //         'change',
    //         ({window, screen}) => {
    //             setDimensions({window, screen});
    //         },
    //     );
    //     return () => subscription?.remove();
    // });

    useEffect(() => {
        getUserMicrosoftFiles(microsoftPath)
        getUserTeams()
    }, [])

    async function getUserMicrosoftFiles(path: string) {
        const result = await callMsGraph(pageData.accessToken, path, instance, accounts)
        if (result.ok){
            const data = await result.json()
            console.log(data)
            if (data["error"] === undefined){
              var newFiles: microsoftFileType [] = []
              for(var index = 0; index <= data["value"].length; index++){
                  if (data['value'][index] !== undefined){
                      if ("@microsoft.graph.downloadUrl" in data["value"][index]){
                          newFiles.push(
                          {
                              name: data["value"][index]["name"], 
                              id: data["value"][index]["id"], 
                              lastModified: data["value"][index]["lastModifiedDateTime"], 
                              folder: false, 
                              parentDriveId: data["value"][index]["parentReference"]["driveId"], 
                              parentPath: data["value"][index]["parentReference"]["path"],
                              itemGraphPath: path
                          })
                      } else {
                          newFiles.push(
                          {
                              name: data["value"][index]["name"], 
                              id: data["value"][index]["id"], 
                              lastModified: data["value"][index]["lastModifiedDateTime"], 
                              folder: true, 
                              parentDriveId: data["value"][index]["parentReference"]["driveId"],
                              parentPath: data["value"][index]["parentReference"]["path"],
                              itemGraphPath: "FOLDER"
                          })
                      }
                  }
              }
              setUsersFies(newFiles)
            }
        } else {
            //TO DO handle error
        }
    }

    async function getUserTeams() {
        const result = await callMsGraph(pageData.accessToken, "https://graph.microsoft.com/v1.0/me/joinedTeams", instance, accounts)//TO DO make sure this works on live tenancy
        if (result.ok){
            const data = await result.json()
            console.log("This is teams data", data)
            if (data["error"] === undefined){
                const NewData: TeamsGroupType[] = []
                for(var index = 0; index < data["value"].length; index++){
                    if (data["value"][index] !== undefined){
                        NewData.push({TeamName: data["value"][index]["displayName"], TeamId: data["value"][index]["id"], TeamDescription: data["value"][index]["description"]})
                    }
                }
                console.log("This is the new teams", NewData)
                setUsersTeams(NewData)
            }
        }
    }
    
    async function getShareFile(ShareLink: string) {
        console.log("This https://graph.microsoft.com/v1.0/shares/" + ShareLink + "/driveItem?$select=content.downloadUrl")
        const result = await callMsGraph(pageData.accessToken, "https://graph.microsoft.com/v1.0/shares/" + ShareLink + "/driveItem?$select=content.downloadUrl", instance, accounts)
        console.log(result)
        if (result.ok){
            const data = await result.json()
            console.log(data)
        }
    }
    return (
        <View style={{height: height, width: width}}>
            <View style={{flexDirection: "row"}}>
                <Text style={{textAlign: "left"}}>Upload File From Microsoft</Text>
                { (onSetIsShowingMicrosoftUpload === undefined || onSetIsShowingUpload === undefined) ?
                    null:<Pressable onPress={() => {onSetIsShowingUpload(false); onSetIsShowingMicrosoftUpload(false)}}><View><Text>Back</Text></View></Pressable>
                }
            </View>
            <View>
            <View style={{width: 500}}>
                <Picker selectedIndex={(selectedMicrosoftUploadMode === MicrosoftUploadModeType.Personal) ? 0:(selectedMicrosoftUploadMode === MicrosoftUploadModeType.ShareLink) ? 1:2} onSetSelectedIndex={(item: number) => {(item === 0) ? setSelectedMicrosoftUploadMode(MicrosoftUploadModeType.Personal):(item === 1) ? setSelectedMicrosoftUploadMode(MicrosoftUploadModeType.ShareLink):setSelectedMicrosoftUploadMode(MicrosoftUploadModeType.Site)}} width={500} height={30} >
                    <Text style={{margin: 0, padding: 0}}>Personal</Text>
                    <Text style={{margin: 0, padding: 0}}>Link</Text>
                    <Text style={{margin: 0, padding: 0}}>Teams</Text>
                </Picker>
            </View>
            { (selectedMicrosoftUploadMode === MicrosoftUploadModeType.Personal) ? 
                <View>
                    { fileBackAvaliable ? <button onClick={() => {
                        const microsftPathArray = microsoftPath.split("/")
                        console.log(microsftPathArray)
                        microsftPathArray.pop()
                        microsftPathArray.pop()
                        microsftPathArray.pop()
                        var outputString = ""
                        for(var index = 0; index < microsftPathArray.length; index++){
                            outputString += microsftPathArray[index] + "/"
                        }
                        outputString += "/items/root/children"
                        setMicrosoftPath(outputString)
                        getUserMicrosoftFiles(outputString)
                        setFilesBackAvaliable(false)
                    }}>Back</button>:null

                    }
                    { usersFiles.map((file) => (
                        <View>
                            {file.folder ? 
                                <Pressable onPress={() => {
                                    setMicrosoftPath("https://graph.microsoft.com/v1.0/drives/" + file.parentDriveId + "/items/" + file.id + "/children")
                                    getUserMicrosoftFiles("https://graph.microsoft.com/v1.0/drives/" + file.parentDriveId + "/items/" + file.id + "/children")
                                    setFilesBackAvaliable(true)
                                }}>
                                    <View style={{flexDirection: "row"}}>
                                        <FolderIcon width={20} height={20}/>
                                        <Text style={{padding: 0, margin: 0}}>{file.name}</Text>
                                    </View>
                                </Pressable>:
                                <Pressable onPress={() => {
                                    onSelectedFile(file)
                                }}>
                                    <View style={{flexDirection: "row"}}>
                                        <DocumentIcon width={20} height={20}/>
                                        <Text style={{padding: 0, margin: 0}}>{file.name}</Text>
                                    </View>
                                </Pressable>
                            }
                        </View>))
                    }
                </View>:null
            }
            { (selectedMicrosoftUploadMode === MicrosoftUploadModeType.ShareLink) ? 
                <View>
                    <View>
                        <Text>Share Link</Text>
                        <TextInput placeholder='Disabled input' value={shareLinkString} onChangeText={(e) => {setShareLinkString(e)}}/>
                    </View>
                    <Pressable onPress={() => {
                        var base64Value = btoa(shareLinkString)
                        base64Value.replace("/", "_")
                        base64Value.replace("+", "-")
                        base64Value.trimEnd()
                        base64Value = "u!" + base64Value
                        getShareFile(base64Value)
                    }}>
                        <Text>Submit</Text>
                    </Pressable>
                </View>:null
            }
            { (selectedMicrosoftUploadMode === MicrosoftUploadModeType.Site) ? 
                <View style={{height: height * 0.8, overflow: "scroll"}}>
                    { usersTeams.map((team) => (
                        <View>
                            { (team.TeamName !== "Student Password Policy" && team.TeamName !== "St Paul's High School" && team.TeamName !== "Adobe_Student" && team.TeamName !== "O365 Student A3 License Assignment" && team.TeamName !== "Student") ?
                                <View>
                                    <Text>{team.TeamName}</Text>
                                </View>:null
                            }
                        </View>
                    )) 
                    }
                </View>:null
            }
            </View>
        </View>
)}
