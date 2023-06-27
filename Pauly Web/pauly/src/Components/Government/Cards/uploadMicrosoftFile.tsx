import React, { useEffect, useState } from 'react'
import { Card, Stack, Button, Form } from 'react-bootstrap';
import styles from "./Cards.module.css"
import { UseAuth } from '../../../Contexts/AuthContext';
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
    parentPath: string
}


export default function({ onSetIsShowingUpload, onSetIsShowingMicrosoftUpload, onSelectedFile }:{
    onSetIsShowingUpload: (item: boolean) => void,
    onSetIsShowingMicrosoftUpload: (item: boolean) => void,
    onSelectedFile: (item: microsoftFileType) => void
}) {
    const { app, db, currentUser, currentUserMicrosoftAccessToken } = UseAuth()
    const [usersTeams, setUsersTeams] = useState<TeamsGroupType[]>([])
    const [usersFiles, setUsersFies] = useState<microsoftFileType[]>([])
    const [microsoftPath, setMicrosoftPath] = useState<string>("https://graph.microsoft.com/v1.0/me/drive/root/children")
    const [selectedMicrosoftUploadMode, setSelectedMicrosoftUploadMode] = useState<MicrosoftUploadModeType>(MicrosoftUploadModeType.Personal)
    const [fileBackAvaliable, setFilesBackAvaliable] = useState<boolean>(false)
    const [shareLinkString, setShareLinkString] = useState<string>("")

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
                            parentPath: data["value"][index]["parentReference"]["path"]
                        })
                  } else {
                    newFiles.push(
                        {
                            name: data["value"][index]["name"], 
                            id: data["value"][index]["id"], 
                            lastModified: data["value"][index]["lastModifiedDateTime"], 
                            folder: true, 
                            parentDriveId: data["value"][index]["parentReference"]["driveId"],
                            parentPath: data["value"][index]["parentReference"]["path"]
                        })
                  }
              }
            }
            setUsersFies(newFiles)
          }
        })
    }

    async function getUserTeams() {
        fetch("https://graph.microsoft.com/v1.0/me/memberOf", {method: "Get", headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + currentUserMicrosoftAccessToken
        },})
        .then(response => response.json())
        .then(data => {
            console.log(data)
            if (data["error"] === undefined){
                const NewData: TeamsGroupType[] = []
                for(var index = 0; index < data["value"].length; index++){
                    if (data["value"][index] !== undefined){
                        NewData.push({TeamName: data["value"][index]["displayName"], TeamId: data["value"][index]["id"], TeamDescription: data["value"][index]["description"]})
                    }
                }
                setUsersTeams(NewData)
            }
        })
    }
    
    async function getShareFile(ShareLink: string) {
        console.log("This https://graph.microsoft.com/v1.0/shares/" + ShareLink + "/driveItem?$select=content.downloadUrl")
        fetch("https://graph.microsoft.com/v1.0/shares/" + ShareLink + "/driveItem?$select=content.downloadUrl", {method: "Get", headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + currentUserMicrosoftAccessToken
            },})
            .then(response => response.json())
            .then(data => {
                console.log(data)
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
                                    <button onClick={() => {
                                        onSelectedFile(file)
                                    }}>
                                        <Stack direction='horizontal'>
                                            <FcDocument style={{display: "block"}} />
                                            <p style={{display: "block", padding: 0, margin: 0}}>{file.name}</p>
                                        </Stack>
                                    </button>
                                }
                            </div>))
                        }
                    </div>:null
                }
                { (selectedMicrosoftUploadMode === MicrosoftUploadModeType.ShareLink) ? 
                    <div>
                        <Form.Group className="mb-3">
                            <Form.Label>Share Link</Form.Label>
                            <Form.Control placeholder="Disabled input" value={shareLinkString} onChange={(e) => {setShareLinkString(e.target.value)}}/>
                        </Form.Group>
                        <Button onClick={() => {
                            var base64Value = btoa(shareLinkString)
                            base64Value.replace("/", "_")
                            base64Value.replace("+", "-")
                            base64Value.trimEnd()
                            base64Value = "u!" + base64Value
                            getShareFile(base64Value)
                        }}>
                            Submit
                        </Button>
                    </div>:null
                }
                { (selectedMicrosoftUploadMode === MicrosoftUploadModeType.Site) ? 
                    <div style={{height: "60vh", overflowY: "scroll"}}>
                        { usersTeams.map((team) => (
                            <div>
                                { (team.TeamName !== "Student Password Policy" && team.TeamName !== "St Paul's High School" && team.TeamName !== "Adobe_Student" && team.TeamName !== "O365 Student A3 License Assignment" && team.TeamName !== "Student") ?
                                    <div>
                                        {team.TeamName}
                                    </div>:null
                                }
                            </div>
                        )) 
                        }
                    </div>:null
                }
                </Card.Body>
            </Card>
        </div>
)}
