import React, { useContext, useEffect, useState } from 'react'
// import { Card, Stack, Button, Form } from 'react-bootstrap';
import { accessTokenContent } from '../../App';
import { Button, Pressable, View, Text, TextInput, Dimensions } from 'react-native';
import Svg, { Polygon, Rect, G, Path } from 'react-native-svg';
// import {FcFolder, FcDocument} from "react-icons/fc"
import Picker from "./Picker/Picker"
import callMsGraph from '../Functions/microsoftAssets';

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

export default function({ onSetIsShowingUpload, onSetIsShowingMicrosoftUpload, onSelectedFile }:{
    onSetIsShowingUpload: (item: boolean) => void,
    onSetIsShowingMicrosoftUpload: (item: boolean) => void,
    onSelectedFile: (item: microsoftFileType) => void
}) {
    const microsoftAccessToken = useContext(accessTokenContent);
    const [usersTeams, setUsersTeams] = useState<TeamsGroupType[]>([])
    const [usersFiles, setUsersFies] = useState<microsoftFileType[]>([])
    const [microsoftPath, setMicrosoftPath] = useState<string>("https://graph.microsoft.com/v1.0/me/drive/root/children")
    const [selectedMicrosoftUploadMode, setSelectedMicrosoftUploadMode] = useState<MicrosoftUploadModeType>(MicrosoftUploadModeType.Personal)
    const [fileBackAvaliable, setFilesBackAvaliable] = useState<boolean>(false)
    const [shareLinkString, setShareLinkString] = useState<string>("")
    const [dimensions, setDimensions] = useState({
        window: windowDimensions,
        screen: screenDimensions,
    });

    useEffect(() => {
        const subscription = Dimensions.addEventListener(
            'change',
            ({window, screen}) => {
                setDimensions({window, screen});
            },
        );
        return () => subscription?.remove();
    });

    useEffect(() => {
        getUserMicrosoftFiles(microsoftPath)
        getUserTeams()
    }, [])

    async function getUserMicrosoftFiles(path: string) {
        fetch(path, {method: "Get", headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + microsoftAccessToken
        },})
        .then(response => response.json())
        .then(data => {
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
        })
    }

    async function getUserTeams() {
        const result = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/me/joinedTeams")//TO DO make sure this works on live tenancy
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
        const result = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/shares/" + ShareLink + "/driveItem?$select=content.downloadUrl")
        console.log(result)
        if (result.ok){
            const data = await result.json()
            console.log(data)
        }
    }
    return (
        <View>
            <View style={{flexDirection: "row"}}>
                <Text style={{textAlign: "left"}}>Upload File From Microsoft</Text>
                <Pressable onPress={() => {onSetIsShowingUpload(false); onSetIsShowingMicrosoftUpload(false)}}><View><Text>Back</Text></View></Pressable>
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
                                        <Svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 48 48" enable-background="new 0 0 48 48" height="1em" width="1em">
                                            <Path fill="#FFA000" d="M40,12H22l-4-4H8c-2.2,0-4,1.8-4,4v8h40v-4C44,13.8,42.2,12,40,12z" />
                                            <Path fill="#FFCA28" d="M40,12H8c-2.2,0-4,1.8-4,4v20c0,2.2,1.8,4,4,4h32c2.2,0,4-1.8,4-4V16C44,13.8,42.2,12,40,12z" />
                                        </Svg>
                                        <Text style={{padding: 0, margin: 0}}>{file.name}</Text>
                                    </View>
                                </Pressable>:
                                <Pressable onPress={() => {
                                    onSelectedFile(file)
                                }}>
                                    <View style={{flexDirection: "row"}}>
                                        <Svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 48 48" enable-background="new 0 0 48 48" height="1em" width="1em">
                                            <Polygon fill="#90CAF9" points="40,45 8,45 8,3 30,3 40,13" />
                                            <Polygon fill="#E1F5FE" points="38.5,14 29,14 29,4.5"/>
                                            <G fill="#1976D2">
                                                <Rect x="16" y="21" width="17" height="2" />
                                                <Rect x="16" y="25" width="13" height="2" />
                                                <Rect x="16" y="29" width="17" height="2" />
                                                <Rect x="16" y="33" width="13" height="2" />
                                            </G>
                                        </Svg>
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
                <View style={{height: dimensions.window.height * 0.6, overflow: "scroll"}}>
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
