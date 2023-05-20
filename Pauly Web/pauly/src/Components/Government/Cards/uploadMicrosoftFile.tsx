import React, { useEffect, useState } from 'react'
import { Card, Stack, Button } from 'react-bootstrap';
import styles from "./Cards.module.css"
import { useAuth } from '../../../Contexts/AuthContext';
import {FcFolder, FcDocument} from "react-icons/fc"

enum MicrosoftUploadModeType {
    ShareLink,
    Personal,
    Site
}

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
}


export default function({ onSetIsShowingUpload, onSetIsShowingMicrosoftUpload }:{
    onSetIsShowingUpload: (item: boolean) => void,
    onSetIsShowingMicrosoftUpload: (item: boolean) => void
}) {
    const { app, db, currentUser, currentUserMicrosoftAccessToken } = useAuth()
    const [usersTeams, setUsersTeams] = useState<TeamsGroupType[]>([])
    const [usersFiles, setUsersFies] = useState<microsoftFileType[]>([])
    const [microsoftPath, setMicrosoftPath] = useState<string>("https://graph.microsoft.com/v1.0/me/drive/root/children")
    const [selectedMicrosoftUploadMode, setSelectedMicrosoftUploadMode] = useState<MicrosoftUploadModeType>(MicrosoftUploadModeType.Personal)
    const [fileBackAvaliable, setFilesBackAvaliable] = useState<boolean>(false)

    useEffect(() => {
        getUserMicrosoftFiles(microsoftPath)
        getUserTeams()
    }, [])

    async function getUserMicrosoftFiles(path: string) {
        fetch(path, {method: "Get", headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + currentUserMicrosoftAccessToken
        },})
        .then(response => response.json())
        .then(data => {
          console.log(data)
          var newFiles = []
          for(var index = 0; index <= data["value"].length; index++){
            if (data['value'][index] !== undefined){
                if ("@microsoft.graph.downloadUrl" in data["value"][index]){
                    newFiles.push({name: data["value"][index]["name"], id: data["value"][index]["id"], lastModified: data["value"][index]["lastModifiedDateTime"], folder: false, parentDriveId: data["value"][index]["parentReference"]["driveId"]})
                } else {
                    newFiles.push({name: data["value"][index]["name"], id: data["value"][index]["id"], lastModified: data["value"][index]["lastModifiedDateTime"], folder: true, parentDriveId: data["value"][index]["parentReference"]["driveId"]})
                }
            }
          }
          setUsersFies(newFiles)
        })
    }

    async function getUserTeams() {
        fetch("https://graph.microsoft.com/v1.0/me/memberOf", {method: "Get", headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + currentUserMicrosoftAccessToken
        },})
        .then(response => response.json())
        .then(data => {
        const NewData: TeamsGroupType[] = []
        for(var index = 0; index < data["value"].length; index++){
            if (data["value"][index] !== undefined){
            NewData.push({TeamName: data["value"][index]["displayName"], TeamId: data["value"][index]["id"], TeamDescription: data["value"][index]["description"]})
            }
        }
        setUsersTeams(NewData)
        })
    }
    return (
        <div className={styles.ImageLibraryView}>
            <Card className={styles.ImageLibraryViewCard}>
                <Card.Text>
                <Stack direction='horizontal'>
                    <h1 style={{textAlign: "left"}} className={styles.ImageLibraryViewTitle}>Upload File From Microsoft</h1>
                    <Button variant="primary" style={{display: "flex", alignContent: "right", marginLeft: "auto", marginRight: "3%"}} onClick={() => {onSetIsShowingUpload(false); onSetIsShowingMicrosoftUpload(false)}}>Back</Button>
                </Stack>
                </Card.Text>
                <Card.Body>
                <Button onClick={() => {setSelectedMicrosoftUploadMode(MicrosoftUploadModeType.Personal)}}>
                    Personal
                </Button>
                <Button onClick={() => {setSelectedMicrosoftUploadMode(MicrosoftUploadModeType.ShareLink)}}>
                    Link
                </Button>
                <Button onClick={() => {setSelectedMicrosoftUploadMode(MicrosoftUploadModeType.Site)}}>
                    Teams
                </Button>
                { (selectedMicrosoftUploadMode === MicrosoftUploadModeType.Personal) ? 
                    <div className={styles.uploadMicrosoftFilesContainer}>
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
                            <div>
                                {file.folder ? 
                                    <button onClick={() => {
                                        setMicrosoftPath("https://graph.microsoft.com/v1.0/drives/" + file.parentDriveId + "/items/" + file.id + "/children")
                                        getUserMicrosoftFiles("https://graph.microsoft.com/v1.0/drives/" + file.parentDriveId + "/items/" + file.id + "/children")
                                        setFilesBackAvaliable(true)
                                    }}>
                                        <Stack direction='horizontal'>
                                            <FcFolder style={{display: "block"}}/>
                                            <p style={{display: "block", padding: 0, margin: 0}}>{file.name}</p>
                                        </Stack>
                                    </button>:
                                    <Stack direction='horizontal'>
                                        <FcDocument style={{display: "block"}} />
                                        <p style={{display: "block", padding: 0, margin: 0}}>{file.name}</p>
                                    </Stack>
                                }
                            </div>))
                        }
                    </div>:null
                }
                { (selectedMicrosoftUploadMode === MicrosoftUploadModeType.ShareLink) ? 
                    <div>
                    Link
                    </div>:null
                }
                { (selectedMicrosoftUploadMode === MicrosoftUploadModeType.Site) ? 
                    <div>
                    Teams
                    </div>:null
                }
                </Card.Body>
            </Card>
        </div>
)}
