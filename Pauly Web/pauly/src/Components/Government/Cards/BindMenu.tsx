import React, { useState, useEffect } from 'react'
import { Card, Stack, Button } from "react-bootstrap"
import styles from "./Cards.module.css"
import { collection, getDoc, getDocs, doc } from 'firebase/firestore'
import { useAuth } from '../../../Contexts/AuthContext';

enum SelectedCardBindModeType{
    Class,
    Sport,
    Commission
}
type CommissionsType = {
    Title: string
    Caption: string
}

enum SelectedSportViewModeType{
    sport,
    season,
    team
}

export default function BindMenu(
    {currentUserInfo, onSetIsShowingBindPage}:
    {
        currentUserInfo: UserType
        onSetIsShowingBindPage: (input: boolean) => void
    }
    ) {
    const [selectedCardBindMode, setSelectedCardBindMode] = useState<SelectedCardBindModeType>(SelectedCardBindModeType.Class)
    const { db } = useAuth()
    const [selectedGrade, setSelectedGrade] = useState<string>("9")
    const [selectedGradeClasses, setSelectedGradeClasses] = useState<string[]>([])
    const [selectedGradeClassesSections, setSelectedGradeClassesSections] = useState<string[]>([])
    const [isShowingSection, setIsShowingSection] = useState<boolean>(false)
    const [avaliableCommissions, setAvaliableCommissions] = useState<CommissionsType[]>([])
    const [avaliableSportsSports, setAvaliableSportsSports] = useState<string[]>([])
    const [avaliableSportsSeasons, setAvaliableSportsSeasons] = useState<string[]>([])
    const [avaliableSportsTeams, setAvaliableSportsTeams] = useState<string[]>([])
    const [selectedSportViewMode, setSelectedSportViewMode] = useState<SelectedSportViewModeType>(SelectedSportViewModeType.sport)

    async function getUserSections(grade: string, courseName: string){
        const querySnapshot = await getDocs(collection(db, "Grade" + grade + "Courses", courseName, "Sections"))
        var dataArray: string[] = []
        querySnapshot.forEach((doc) => {
            const data = doc.data()
            if (data["School Year"] === undefined){
                dataArray.push(data["CourseName"] + " " + data["Section"])
            } else {
                dataArray.push(data["CourseName"] + " " + data["Section"] + " " + data["School Year"])
            }
        })
        setSelectedGradeClassesSections(dataArray)
    }

    async function getUsersCourses(grade: string) {
        if (currentUserInfo.Permissions.includes(19)){
          if (currentUserInfo.ClassMode === 1){
            const querySnapshot = await getDocs(collection(db, "Grade" + grade + "Courses"));
            var dataArray: string[] = []
            querySnapshot.forEach((doc) => {
                // doc.data() is never undefined for query doc snapshots
                const data = doc.data()
                dataArray.push(data["CourseName"])
            });
            setSelectedGradeClasses(dataArray)
          } else if (currentUserInfo.ClassMode === 0){
            for(var index = 0; index < currentUserInfo.ClassPerms.length; index++){
              const classData: string = currentUserInfo.ClassPerms[index]
              const ClassDataArray = classData.split("-")
              if (ClassDataArray.length === 4){
                const docRef = doc(db, "Grade" + ClassDataArray[0] + "Courses", ClassDataArray[1], "Sections", ClassDataArray[2] + "-" + ClassDataArray[3]);
                const docSnap = await getDoc(docRef);
      
                if (docSnap.exists()) {
                  console.log("Document data:", docSnap.data());
                } else {
                  // docSnap.data() will be undefined in this case
                  console.log("No such document!");
                }
              } else {
                const docRef = doc(db, "Grade" + ClassDataArray[0] + "Courses", ClassDataArray[1], "Sections", ClassDataArray[2]);
                const docSnap = await getDoc(docRef);
      
                if (docSnap.exists()) {
                  console.log("Document data:", docSnap.data());
                } else {
                  // docSnap.data() will be undefined in this case
                  console.log("No such document!");
                }
              }
            }
          }
        }
    }
    
    async function getUsersCommissions() {
    if (currentUserInfo.Permissions.includes(18)){
        const querySnapshot = await getDocs(collection(db, "Commissions"));
        var newData: CommissionsType[] = []
        querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            if (doc.id !== "CommissionsCount"){
                console.log(doc.id, " => ", doc.data());
                const data = doc.data()
                newData.push({Title: data["Title"], Caption: data["Caption"]})
            }
        });
        setAvaliableCommissions(newData)
    }
    }

    async function getUsersSports() {
        if (currentUserInfo.Permissions.includes(15)){
            if (currentUserInfo.SportsMode === 0){
            for(var index = 0; index < currentUserInfo.SportsPerms.length; index++){
                const sportData: string = currentUserInfo.SportsPerms[index]
                const sportDataArray = sportData.split("-")
                const docRef = doc(db, "Sports", sportDataArray[0], "Sections", sportDataArray[1] + "Teams" + sportDataArray[2]);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                console.log("Document data:", docSnap.data());
                } else {
                // docSnap.data() will be undefined in this case
                console.log("No such document!");
                }
            }
            } else if (currentUserInfo.SportsMode === 1){
                const querySnapshot = await getDocs(collection(db, "Sports"));
                var newData: string[] = []
                querySnapshot.forEach((doc) => {
                    // doc.data() is never undefined for query doc snapshots
                    console.log(doc.id, " => ", doc.data());
                    const data = doc.data()
                    newData.push(data["Name"])
                });
                setAvaliableSportsTeams(newData)
            }
        }
    }

    useEffect(() => {
        getUsersCourses(selectedGrade)
    }, [selectedGrade])
    useEffect(() => {
        getUsersCommissions()
        getUsersSports()
    }, [])

    return (
    <div className={styles.ImageLibraryView}>
        <Card className={styles.ImageLibraryViewCard}>
            <Card.Title>
                <Stack direction='horizontal'>
                <h1 style={{textAlign: "left"}} className={styles.ImageLibraryViewTitle}>Bind</h1>
                <Button variant="primary" style={{display: "flex", alignContent: "right", marginLeft: "auto", marginRight: "3%"}} onClick={() => {onSetIsShowingBindPage(false)}}>Back</Button>
                </Stack>
            </Card.Title>
            <Card.Body>
                <Stack direction='horizontal'>
                { currentUserInfo.Permissions.includes(19) ? 
                    <Button onClick={() => {setSelectedCardBindMode(SelectedCardBindModeType.Class)}}>
                    Class
                    </Button>:null
                }
                { currentUserInfo.Permissions.includes(18) ?
                    <Button onClick={() => {setSelectedCardBindMode(SelectedCardBindModeType.Commission)}}>
                    Commission
                    </Button>:null
                }
                { currentUserInfo.Permissions.includes(15) ?
                    <Button onClick={() => {setSelectedCardBindMode(SelectedCardBindModeType.Sport)}}>
                    Sport
                    </Button>:null
                }
                </Stack>
                <Card>
                    { (selectedCardBindMode === SelectedCardBindModeType.Class) ? 
                    <>
                        <Stack direction='horizontal'>
                            <Button onClick={() => {setSelectedGrade("9"); setIsShowingSection(false)}}>
                                9
                            </Button>
                            <Button onClick={() => {setSelectedGrade("10"); setIsShowingSection(false)}}>
                                10
                            </Button>
                            <Button onClick={() => {setSelectedGrade("11"); setIsShowingSection(false)}}>
                                11
                            </Button>
                            <Button onClick={() => {setSelectedGrade("12"); setIsShowingSection(false)}}>
                                12
                            </Button>
                        </Stack>
                        { isShowingSection ? <div>
                            <Button onClick={() => {setIsShowingSection(false)}}>
                                Back
                            </Button>
                            <Stack>
                                {selectedGradeClassesSections.map((item) => (
                                <button onClick={() => {setIsShowingSection(true); getUserSections(selectedGrade, item)}}>
                                   <p>{item}</p>
                                    </button>
                                ))
                                }
                            </Stack>
                            </div>:<div>
                            <Stack>
                            { selectedGradeClasses.map((item) => (
                                <button onClick={() => {setIsShowingSection(true); getUserSections(selectedGrade, item)}}>
                                   <p>{item}</p>
                                </button>
                            ))
                            }
                            </Stack> 
                        </div>

                        }
                    </>:null
                    }
                    { (selectedCardBindMode === SelectedCardBindModeType.Commission) ? 
                    <>
                        {avaliableCommissions.map((item) => (
                        <div>
                            <button>
                                <p>{item.Title}</p>
                                <p>{item.Caption}</p>
                            </button>
                        </div>))
                        }
                    </>:null
                    }
                    { (selectedCardBindMode === SelectedCardBindModeType.Sport) ? 
                    <>
                        { (selectedSportViewMode === SelectedSportViewModeType.sport) ?
                            <div>
                                { avaliableSportsSports.map((item) => (<p>{item}</p>))
                                }
                            </div>:null
                        }
                        { (selectedSportViewMode === SelectedSportViewModeType.season) ?
                            <div>
                                { avaliableSportsSeasons.map((item) => (<p>{item}</p>))

                                }
                            </div>:null

                        }
                        { (selectedSportViewMode === SelectedSportViewModeType.team) ?
                            <div>
                                { avaliableSportsTeams.map((item) => (<p>{item}</p>))
                                    
                                }
                            </div>:null
                        }
                        <p>Sport</p>
                        { avaliableSportsTeams.map((item) => (
                        <button>{item}</button>))
                        }
                    </>:null
                    }
                </Card>
            </Card.Body>
        </Card>
    </div>
    )
}
