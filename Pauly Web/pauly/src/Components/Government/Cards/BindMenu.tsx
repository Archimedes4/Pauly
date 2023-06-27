import React, { useState, useEffect } from 'react'
import { Card, Stack, Button } from "react-bootstrap"
import styles from "./Cards.module.css"
import { collection, getDoc, getDocs, doc, updateDoc } from 'firebase/firestore'
import { UseAuth } from '../../../Contexts/AuthContext';
import HorizontalPicker from "../../../UI/NavBar/NavBarHolder"
import { useCardContext } from "./Cards"

declare global {
    type CommissionsType = {
        Title: string
        Caption: string
    }
    
    type ClassSectionType = {
        Name: string,
        id: string
    }
}

enum SelectedClassViewType{
    Class,
    Section,
    Overview
}

enum SelectedCardBindModeType{
    Class,
    Sport,
    Commission,
    NoPermissions
}

enum SelectedSportViewModeType{
    sport,
    season,
    team
}


export default function BindMenu(
    { onSetIsShowingBindPage}:
    {
        onSetIsShowingBindPage: (input: boolean) => void
    }
    ) {
    const { selectedPage } = useCardContext()
    const [selectedCardBindMode, setSelectedCardBindMode] = useState<SelectedCardBindModeType>(SelectedCardBindModeType.Class)
    const { db, currentUserInfo } = UseAuth()
    const [avaliableCommissions, setAvaliableCommissions] = useState<CommissionsType[]>([])

    //Sports
    const [avaliableSportsSports, setAvaliableSportsSports] = useState<string[]>([])
    const [avaliableSportsSeasons, setAvaliableSportsSeasons] = useState<string[]>([])
    const [avaliableSportsTeams, setAvaliableSportsTeams] = useState<string[]>([])
    const [selectedSportViewMode, setSelectedSportViewMode] = useState<SelectedSportViewModeType>(SelectedSportViewModeType.sport)

    //Class
    const [selectedClassView, setSelectedClassView] = useState<SelectedClassViewType>(SelectedClassViewType.Class)
    const [selectedGrade, setSelectedGrade] = useState<string>("9")
    const [selectedGradeClasses, setSelectedGradeClasses] = useState<string[]>([])
    const [selectedClassName, setSelectedClassName] = useState("")
    const [selectedGradeClassesSections, setSelectedGradeClassesSections] = useState<ClassSectionType[]>([])
    const [selectedClass, setSelectedClass] = useState<ClassType |  null>(null)

    useEffect(() => {
        if (currentUserInfo.Permissions.includes(19)){ //Class
            setSelectedCardBindMode(SelectedCardBindModeType.Class)
        } else if (currentUserInfo.Permissions.includes(18)){ //Commision
            setSelectedCardBindMode(SelectedCardBindModeType.Commission)
        } else if (currentUserInfo.Permissions.includes(15)){ //Sport
            setSelectedCardBindMode(SelectedCardBindModeType.Sport)
        } else { //NO Permission
            setSelectedCardBindMode(SelectedCardBindModeType.NoPermissions)
        }
    }, [])

    async function getClass(grade: string, courseName: string, courseSection: string) {
        const docRef = doc(db, "Grade" + grade + "Courses", courseName, "Sections", courseSection);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data()
            setSelectedClass({
                courseName: data["CourseName"],
                dayA: data["DayA"],
                dayB: data["DayB"],
                dayC: data["DayD"],
                dayD: data["DayC"],
                noClass: data["NoClass"],
                schoolYear: data["School Year"],
                section: data["Section"],
                semester: data["Semester"],
                teacher: data["Teacher"],
                teacherArray: data["TeacherArray"],
                team: data["TeamID"],
                grade: parseInt(grade)
            })
            setSelectedClassView(SelectedClassViewType.Overview)
          } else {
            // docSnap.data() will be undefined in this case
            console.log("No such document!");
            //TO DO handel error
        }
    }

    async function getUserSections(grade: string, courseName: string){
        const querySnapshot = await getDocs(collection(db, "Grade" + grade + "Courses", courseName, "Sections"))
        var dataArray: ClassSectionType[] = []
        querySnapshot.forEach((doc) => {
            const data = doc.data()
            if (data["School Year"] === undefined){
                dataArray.push({Name: data["CourseName"] + " " + data["Section"], id: doc.id})
            } else {
                dataArray.push({Name: data["CourseName"] + " " + data["Section"] + " " + data["School Year"], id: doc.id})
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

    async function BindPage(value: string) {
        await updateDoc(doc(db, "Pages", selectedPage.firebaseID.toString()), {BindRef: value})
        //TO DO error handling
    }

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
                <div style={{height: "8%"}}>
                    <HorizontalPicker selectedIndex={0} onSelectedIndexChange={(value: number) => {
                        if (currentUserInfo.Permissions.includes(19) && currentUserInfo.Permissions.includes(18) && currentUserInfo.Permissions.includes(15)) {
                            if (value === 0) {
                                setSelectedCardBindMode(SelectedCardBindModeType.Class)
                            } else if (value === 1){
                                setSelectedCardBindMode(SelectedCardBindModeType.Commission)
                            } else if (value === 2){
                                setSelectedCardBindMode(SelectedCardBindModeType.Sport)
                            } 
                        } else if (currentUserInfo.Permissions.includes(19) && currentUserInfo.Permissions.includes(18)) {
                            if (value === 0) {
                                setSelectedCardBindMode(SelectedCardBindModeType.Class)
                            } else if (value === 1){
                                setSelectedCardBindMode(SelectedCardBindModeType.Commission)
                            }
                        } else if (currentUserInfo.Permissions.includes(19) && currentUserInfo.Permissions.includes(15)) {
                            if (value === 0) {
                                setSelectedCardBindMode(SelectedCardBindModeType.Class)
                            } else if (value === 1){
                                setSelectedCardBindMode(SelectedCardBindModeType.Sport)
                            }
                        } else if (currentUserInfo.Permissions.includes(18) && currentUserInfo.Permissions.includes(15)) {
                            if (value === 0) {
                                setSelectedCardBindMode(SelectedCardBindModeType.Commission)
                            } else if (value === 1){
                                setSelectedCardBindMode(SelectedCardBindModeType.Sport)
                            }
                        }
                    }} width='10%'>
                    { currentUserInfo.Permissions.includes(19) ? 
                    <p style={{margin: 0, marginTop: "4%", marginBottom: "3%"}}>Class</p>:null
                    }
                    { currentUserInfo.Permissions.includes(18) ?
                        <p style={{margin: 0, marginTop: "4%", marginBottom: "3%"}}>Commision</p>:null
                    }
                    { currentUserInfo.Permissions.includes(15) ?
                        <p style={{margin: 0, marginTop: "4%", marginBottom: "3%"}}>Sport</p>:null
                    }
                    </HorizontalPicker>
                </div>
                <Card>
                    { (selectedCardBindMode === SelectedCardBindModeType.Class) ? 
                    <>
                        <div style={{paddingLeft: "0.5%"}}>
                            <HorizontalPicker  selectedIndex={0} onSelectedIndexChange={(value: number) => {
                                if (value === 0) {
                                    setSelectedGrade("9")
                                } else if (value === 1){
                                    setSelectedGrade("10")
                                } else if (value === 2){
                                    setSelectedGrade("11")
                                } else if (value === 3){
                                    setSelectedGrade("12")
                                }
                                setSelectedClassView(SelectedClassViewType.Class)
                            }} width='10%'>
                                <p style={{margin: 0, marginTop: "4%", marginBottom: "3%"}}>9</p>
                                <p style={{margin: 0, marginTop: "4%", marginBottom: "3%"}}>10</p>
                                <p style={{margin: 0, marginTop: "4%", marginBottom: "3%"}}>11</p>
                                <p style={{margin: 0, marginTop: "4%", marginBottom: "3%"}}>12</p>
                            </HorizontalPicker>
                        </div>
                        { (selectedClassView === SelectedClassViewType.Class) ? 
                            <div> 
                                <Stack>
                                { selectedGradeClasses.map((item) => (
                                    <button onClick={() => {setSelectedClassView(SelectedClassViewType.Section); getUserSections(selectedGrade, item); setSelectedClassName(item)}}>
                                        <p>{item}</p>
                                    </button>
                                ))
                                }
                                </Stack> 
                            </div>:null
                        }
                        { (selectedClassView === SelectedClassViewType.Section) ? 
                            <div>
                                <Button onClick={() => {setSelectedClassView(SelectedClassViewType.Class)}}>
                                    Back
                                </Button>
                                <Stack>
                                    {selectedGradeClassesSections.map((item) => (
                                        <button onClick={() => {getClass(selectedGrade, selectedClassName, item.id)}}>
                                            <p>{item.Name}</p>
                                        </button>
                                    ))
                                    }
                                </Stack>
                            </div>:null
                        }
                        { (selectedClassView === SelectedClassViewType.Overview) ?
                            <div>
                                <Button onClick={() => {setSelectedClassView(SelectedClassViewType.Section)}}>
                                    Back
                                </Button>
                                <p>{selectedClass.courseName}</p>
                                <p>School Year: {selectedClass.schoolYear} Section: {selectedClass.section} Semester: {selectedClass.semester}</p>
                                <p>{selectedClass.teacher.FirstName} {selectedClass.teacher.LastName}</p>
                                <button onClick={() => {
                                    BindPage("Class-" + selectedGrade + "-" + selectedClassName + "-"  + selectedClass.section + ((selectedClass.section === 0) ? "":"-") + ((selectedClass.section === 0) ? "":selectedClass.schoolYear.toString()))
                                }}>
                                    Bind
                                </button>
                            </div>:null
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
                    { (selectedCardBindMode === SelectedCardBindModeType.NoPermissions) ? <p>You Don't have the necessary permissions to bind to anything.</p>:null

                    }
                </Card>
            </Card.Body>
        </Card>
    </div>
    )
}
