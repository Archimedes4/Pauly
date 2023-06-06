import React, {useState, useEffect} from 'react'
import HorizontalPicker from "../../UI/NavBar/NavBarHolder"
import {doc, getDoc, getDocs, collection} from "firebase/firestore"
import { useAuth } from '../../Contexts/AuthContext';
import { Stack, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

enum SelectedClassAddModeType{
  Class,
  Section,
  AddRoot,
  AddSection,
  ConnectTeams,
  EditClass
}

type TeamsGroupType = {
  TeamName: string
  TeamId: string
  TeamDescription: string
  Achived: boolean
  Class: boolean
}

export default function Class() {
  const {db,currentUserInfo, currentUserMicrosoftAccessToken} = useAuth()
  const [selectedGrade, setSelectedGrade] = useState<string>("9")
  const [selectedGradeClasses, setSelectedGradeClasses] = useState<string[]>([])
  const [selectedClassName, setSelectedClassName] = useState("")
  const [selectedGradeClassesSections, setSelectedGradeClassesSections] = useState<ClassSectionType[]>([])
  const [selectedClass, setSelectedClass] = useState<ClassType |  null>(null)
  const [usersTeams, setUsersTeams] = useState<TeamsGroupType[]>([])
  const [isShowingArchived, setIsShowingArchived] = useState<boolean>(false)

  //New Class Data
  const [selectedClassAddMode, setSelectedClassAddMode] = useState<SelectedClassAddModeType>(SelectedClassAddModeType.Class)
  const [newClassTeamId, setNewClassTeamId] = useState<string>("")

  async function getClass(grade: string, courseName: string, courseSection: string) {
    const docRef = doc(db, "Grade" + grade + "Courses", courseName, "Sections", courseSection);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const data = docSnap.data()
        setSelectedClass({CourseName: data["CourseName"],
            DayA: data["DayA"],
            DayB: data["DayB"],
            DayC: data["DayC"],
            DayD: data["DayD"],
            noClass: data["NoClass"],
            schoolYear: data["School Year"],
            section: data["Section"],
            Semester: data["Semester"],
            Teacher: data["Teacher"]
        })
        setSelectedClassAddMode(SelectedClassAddModeType.EditClass)
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
                const name: string = data["value"][index]["displayName"]
                
                if (name !== undefined){
                  if (name !== "Student Password Policy" && name !== "St Paul's High School" && name !== "Adobe_Student" && name !== "O365 Student A3 License Assignment" && name !== "Student"){
                    if (data["value"][index]["extension_fe2174665583431c953114ff7268b7b3_Education_Status"] !== undefined){
                      if (data["value"][index]["extension_fe2174665583431c953114ff7268b7b3_Education_Status"] === "Expired"){
                        NewData.push({TeamName: name, TeamId: data["value"][index]["id"], TeamDescription: data["value"][index]["description"], Achived: true, Class: true})
                      } else {
                        NewData.push({TeamName: name, TeamId: data["value"][index]["id"], TeamDescription: data["value"][index]["description"], Achived: false, Class: true})
                      }
                    } else {
                      NewData.push({TeamName: name, TeamId: data["value"][index]["id"], TeamDescription: data["value"][index]["description"], Achived: false, Class: false})
                    }
                  }
                }
            }
            setUsersTeams(NewData)
        }
    })
  }

  useEffect(() => {
    getUsersCourses(selectedGrade)
  }, [selectedGrade])

  useEffect(() => {
    getUserTeams()
  }, [])

  return (
    <div>
      Class
      <Link to="/government/"> Back </Link>
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
        setSelectedClassAddMode(SelectedClassAddModeType.Class)

      }} width='10%'>
          <p style={{margin: 0, marginTop: "4%", marginBottom: "3%"}}>9</p>
          <p style={{margin: 0, marginTop: "4%", marginBottom: "3%"}}>10</p>
          <p style={{margin: 0, marginTop: "4%", marginBottom: "3%"}}>11</p>
          <p style={{margin: 0, marginTop: "4%", marginBottom: "3%"}}>12</p>
      </HorizontalPicker>
      <div>
        { (selectedClassAddMode === SelectedClassAddModeType.Class) ?
          <div>
            {/* <button onClick={() => {setSelectedClassGovernmentClassMode(SelectedGovernmentClassModeType.ConnectTeams)}}>Connect To Teams</button> */}
            <Stack>
              { selectedGradeClasses.map((item) => (
                <button onClick={() => {setSelectedClassAddMode(SelectedClassAddModeType.Section); getUserSections(selectedGrade, item); setSelectedClassName(item)}}>
                  <p>{item}</p>
                </button>
              ))
              }
              <button onClick={() => {
                setSelectedClassAddMode(SelectedClassAddModeType.AddRoot)
              }}>
                Add Root
              </button>
            </Stack> 
          </div>:null
        }
        { (selectedClassAddMode === SelectedClassAddModeType.Section) ?
          <div>
            <Button onClick={() => {setSelectedClassAddMode(SelectedClassAddModeType.Class)}}>
              Back
            </Button>
            <Stack>
              {selectedGradeClassesSections.map((item) => (
                <button onClick={() => {getClass(selectedGrade, selectedClassName, item.id)}}>
                  <p>{item.Name}</p>
                </button>
              ))
              }
              <button onClick={() => {
                setSelectedClassAddMode(SelectedClassAddModeType.AddSection)
              }}>
                Add Section
              </button>
            </Stack>
          </div>:null
        }
        { (selectedClassAddMode === SelectedClassAddModeType.AddRoot) ?
          <div>
            <Button onClick={() => {setSelectedClassAddMode(SelectedClassAddModeType.Class)}}>
              Back
            </Button>
            <p>Add Root</p>
            <button>
              Add
            </button>
          </div>:null
        }
        { (selectedClassAddMode === SelectedClassAddModeType.AddSection) ?
          <div>
            <Button onClick={() => {setSelectedClassAddMode(SelectedClassAddModeType.Section); setNewClassTeamId("")}}>
              Back
            </Button>
            <p>Add Section</p>
            <button onClick={() => {
              setSelectedClassAddMode(SelectedClassAddModeType.ConnectTeams)
            }}>
              Connect To Teams
            </button>
            <button onClick={() => {}}>
              Add
            </button>
          </div>:null
        }
        { (selectedClassAddMode === SelectedClassAddModeType.ConnectTeams) ?
          <div>
            <p>Connect To Teams</p>
              <div style={{height: "60vh", overflowY: "scroll"}}>
                <p style={{padding: 0, margin: 0, marginTop: 10}}>Classes</p>
                { usersTeams.map((team) => (
                  <div>
                    { (team.Achived === false && team.Class === true) ?
                      <div>
                        <button onClick={() => {setNewClassTeamId(team.TeamId); setSelectedClassAddMode(SelectedClassAddModeType.AddSection)}}>
                          {team.TeamName}
                        </button>
                      </div>:null
                    }
                  </div>
                ))}
                { isShowingArchived ? 
                  <div>
                    <div style={{marginTop: 10}}>
                      <p style={{padding: 0, margin: 0, marginTop: 10, display: "inline"}}>Archived</p>
                      <button style={{display: "inline'"}} onClick={() => {setIsShowingArchived(false)}}>
                        Hide Archived
                      </button>
                    </div>
                    { usersTeams.map((team) => (
                      <div>
                        { (team.Achived === true) ?
                          <div>
                            <button>
                              {team.TeamName}
                            </button>
                        </div>:null
                        }
                      </div>
                      )) 
                    }
                    
                  </div>:
                  <button onClick={() => {setIsShowingArchived(true)}}>
                    Show Archived
                  </button>
                }
                <p style={{padding: 0, margin: 0, marginTop: 10}}>Clubs</p>
                { usersTeams.map((team) => (
                  <div>
                      { (team.Achived === false && team.Class === false) ?
                          <div>
                            <button>
                              {team.TeamName}
                            </button>
                          </div>:null
                      }
                  </div>
                )) 
                }
              </div>
          </div>:null
        }
        { (selectedClassAddMode === SelectedClassAddModeType.EditClass) ?
          <div>
            <Button onClick={() => {setSelectedClassAddMode(SelectedClassAddModeType.Section)}}>
              Back
            </Button>
            <p>{selectedClass.CourseName}</p>
            <p>School Year: {selectedClass.schoolYear} Section: {selectedClass.section} Semester: {selectedClass.Semester}</p>
            <p>{selectedClass.Teacher}</p>
          </div>:null
        }
      </div>
    </div>
  )
}
