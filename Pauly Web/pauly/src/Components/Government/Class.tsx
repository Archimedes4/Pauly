import React, {useState, useEffect, useRef} from 'react'
import HorizontalPicker from "../../UI/NavBar/NavBarHolder"
import {doc, getDoc, getDocs, collection, setDoc} from "firebase/firestore"
import { UseAuth } from '../../Contexts/AuthContext';
import { Stack, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import UserQuery from '../../Functions/UserQuery';
import { get } from 'http';
import { Archive } from 'react-bootstrap-icons';

enum SelectedClassAddModeType{
  Class,
  Section,
  AddRoot,
  AddSection,
  ConnectTeams,
  EditClass
}

declare global{
  type TeamsGroupType = {
    TeamName: string
    TeamId: string
    TeamDescription: string
    Archived: boolean
    Class: boolean
  }
}

function TeacherList({onSelectTeacher}:{onSelectTeacher: (item: UserType) => void}) {
  const [currentPage, setCurrentPage] = useState("")
  const [users, setUsers] = useState<UserType[]>([])
  const getQuery = UserQuery()
  const userContainerRef = useRef(null)
  async function getUsers(newSearch: boolean, page?: string, search?: string){
    var q = await getQuery({newSearch: newSearch, search: search, page: page, grade: undefined, section: undefined, staff: true, student: false})
    setCurrentPage(q.NextPage)
    if (newSearch){
      setUsers(q.value)
    } else {
      setUsers([...users, ...q.value])
    }
  }
  const handleScroll = () => {
    const { scrollTop, scrollHeight, clientHeight, offsetHeight, offsetWidth } = userContainerRef.current;
    const hasOverflowingChildren = offsetHeight < scrollHeight
    const bottom = scrollHeight - scrollTop === clientHeight;
    if (bottom && hasOverflowingChildren) { 
      console.log("This is page", currentPage)
      getUsers(false,  currentPage)
    }
  }
  useEffect(() => {
    setUsers([])
    getUsers(true, currentPage)
  }, [])
  return (
    <div ref={userContainerRef} onScroll={() => handleScroll()} style={{overflow: "scroll", height: "50vh"}}>
    { users.map((user) => (
      <div>
        <button onClick={() => {
          onSelectTeacher(user)
        }}>
          {user.FirstName} {user.LastName}
        </button>
      </div>))
    }
    </div>
  )
}

function EditClass({selectedClass, onSetSelectedClass, onBack, onSelectTeam, selectedTeam}:{selectedClass: ClassType, onSetSelectedClass: (item: ClassType) => void, onBack: () => void, onSelectTeam: () => void, selectedTeam?: TeamsGroupType}) {
  const {db} = UseAuth()
  const [isShowingSelectTeacher, setIsShowingSelectTeacher] = useState<boolean>(false)
  async function updateClass(updateClass: ClassType) {
    try{
      var teacherUIDArray = []
      if (updateClass.teacherArray){
        for (var index = 0; index < updateClass.teacherArray.length; index++) {
          teacherUIDArray.push(updateClass.teacherArray[index].uid)
        }
      } 
      await setDoc(doc(db, "Grade" + updateClass.grade + "Courses", updateClass.courseName, "Sections", (updateClass.section === 0) ? updateClass.section.toString():updateClass.section + "-" + updateClass.schoolYear), {
        CourseName: updateClass.courseName,
        DayA: updateClass.dayA,
        DayB: updateClass.dayB,
        DayC: updateClass.dayC,
        DayD: updateClass.dayD,
        NoClass: updateClass.noClass,
        "School Year": updateClass.schoolYear,
        "Section": updateClass.section,
        Semester: updateClass.semester,
        Teacher: updateClass.teacher.uid,
        TeacherArray: (updateClass.teacherArray) ? teacherUIDArray:null,
        TeamID: (updateClass.team) ? updateClass.team.TeamId:null
      }, {merge: true})
    } catch (error) {
      console.log("An Error has Occured", error) //TO DO Handle this error
    }
  }

  useEffect(() => {
    if (selectedTeam !== undefined){
      var selectedClassChange = selectedClass
      selectedClassChange.team = selectedTeam
      onSetSelectedClass(selectedClassChange)
    }
  }, [])
  useEffect(() => {
    console.log(selectedClass.team)
  }, [selectedClass])

  return (
    <div>
      <Button onClick={() => {onBack()}}>
        Back
      </Button>
      <p>{selectedClass.courseName}</p>
      <p>School Year: {selectedClass.schoolYear} Section: {selectedClass.section} Semester: {selectedClass.semester}</p>
      { (selectedClass.teacher !== undefined) ?
        <p>{selectedClass.teacher.FirstName} {selectedClass.teacher.LastName}</p>:null
      }
      {isShowingSelectTeacher ?
        <div>
          <p>Select Teacher</p>
          <div style={{height: "50vh"}}>
            <TeacherList onSelectTeacher={(e) => {
              var selectedClassChange = selectedClass
              selectedClassChange.teacher = e
              onSetSelectedClass(selectedClassChange)
              console.log("Dome", selectedClassChange)
            }}/>
          </div>
          <button onClick={() => {
            setIsShowingSelectTeacher(false)
          }}>
            Cancel
          </button>
        </div>:
        <div>
          <button onClick={() => {setIsShowingSelectTeacher(true)}}>
            Select Teacher
          </button>
        </div>
      }
      {(selectedClass.team !== undefined && selectedClass.team !== null) ? 
        <div>
          <p>{selectedClass.team.TeamName}</p>
          <p>{selectedClass.team.TeamDescription}</p>
          <button onClick={() => {onSelectTeam()}}>
            Select Different Team
          </button>
        </div>:
        <div>
          <button onClick={() => {onSelectTeam()}}>
            Select Team
          </button>
        </div>
      }
      <Button onClick={() => {updateClass(selectedClass)}}>
        Confirm Changes
      </Button>
    </div>
  )
}

function ConnectToTeams({usersTeams, onSelectTeam, onBack}:{usersTeams: TeamsGroupType[], onSelectTeam: (item: TeamsGroupType) => void, onBack: () => void }){
  const [isShowingArchived, setIsShowingArchived] = useState<boolean>(false)
  return(
    <div>
      <p>Connect To Teams</p>
      <div style={{height: "60vh", overflowY: "scroll"}}>
        <p style={{padding: 0, margin: 0, marginTop: 10}}>Classes</p>
        { usersTeams.map((team) => (
          <div>
            { (team.Archived === false && team.Class === true) ?
              <div>
                <button onClick={() => {
                  onSelectTeam(team)}}>
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
                { (team.Archived === true) ?
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
              { (team.Archived === false && team.Class === false) ?
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
    </div>
  )
}

export default function Class() {
  const {db,currentUserInfo, currentUserMicrosoftAccessToken} = UseAuth()
  const [selectedGrade, setSelectedGrade] = useState<string>("9")
  const [selectedGradeClasses, setSelectedGradeClasses] = useState<string[]>([])
  const [selectedClassName, setSelectedClassName] = useState("")
  const [selectedGradeClassesSections, setSelectedGradeClassesSections] = useState<ClassSectionType[]>([])
  const [selectedClass, setSelectedClass] = useState<ClassType |  null>(null)
  const [usersTeams, setUsersTeams] = useState<TeamsGroupType[]>([])
  const [selectedClassAddMode, setSelectedClassAddMode] = useState<SelectedClassAddModeType>(SelectedClassAddModeType.Class)
  const [selectedClassAddModeBack, setSelectedClassAddModeBack] = useState<SelectedClassAddModeType>(SelectedClassAddModeType.Class)
  const [selectedTeam, setSelectedTeam] = useState<TeamsGroupType | null>(null)

  async function getClass(grade: string, courseName: string, courseSection: string) {
    const docRef = doc(db, "Grade" + grade + "Courses", courseName, "Sections", courseSection);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const data = docSnap.data()
        const teacherDocRef = doc(db, "Users", data["Teacher"])
        const teacherDocSnap = await getDoc(teacherDocRef);
        if (teacherDocSnap.exists()){
          const teacherData = teacherDocSnap.data()
          //To Do get less data for the user type
          const teacherUserData: UserType = {
            FirstName: teacherData["First Name"],
            LastName: teacherData["Last Name"],
            Permissions: teacherData["Permissions"],
            ClassMode: teacherData["ClassMode"],
            ClassPerms: teacherData["ClassPerms"],
            SportsMode: teacherData["SportsMode"],
            SportsPerms: teacherData["SportsPerms"],
            Classses: teacherData["Classes"],
            CompletedCommissions: teacherData["CompletedCommissions"],
            SubmittedCommissions: teacherData["SubmittedCommissions"],
            ElectionsVoted: teacherData["ElectionsVoted"],
            Email: teacherData["Email"],
            Grade: null,
            Groups: teacherData["Groups"],
            MemberGroups: teacherData["MemberGroups"],
            NotificationToken: teacherData["NotificationToken"],
            Score: null,
            Section: teacherData["Section"],
            Title: teacherData["Title"],
            uid: teacherData["uid"],
            MicrosoftID: teacherData["MicrosoftID"]
          }
          
          var teamTeamsGroup: TeamsGroupType = undefined
          if (data["TeamID"] !== null){
            const response = await fetch("https://graph.microsoft.com/v1.0/teams/"+data["TeamID"], {method: "Get", headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer " + currentUserMicrosoftAccessToken
              },})
            const teamData = await response.json()
            console.log("Microsoft Message", teamData)
            if (teamData["specialization"] === "educationClass"){
              teamTeamsGroup = {
                TeamName: teamData["displayName"],
                TeamId: teamData["id"],
                TeamDescription: teamData["description"],
                Archived: teamData["isArchived"],
                Class: true
              }
            } else {

            }
          } else {

          }
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
            teacher: teacherUserData,
            teacherArray: data["TeacherArray"],
            team: teamTeamsGroup,
            grade: parseInt(grade)
          })
          setSelectedClassAddMode(SelectedClassAddModeType.EditClass)
        } else {
          //To do handle error
          //This error sould never happen this error should cause the system to understand why this does not work
        }
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
                        NewData.push({TeamName: name, TeamId: data["value"][index]["id"], TeamDescription: data["value"][index]["description"], Archived: true, Class: true})
                      } else {
                        NewData.push({TeamName: name, TeamId: data["value"][index]["id"], TeamDescription: data["value"][index]["description"], Archived: false, Class: true})
                      }
                    } else {
                      NewData.push({TeamName: name, TeamId: data["value"][index]["id"], TeamDescription: data["value"][index]["description"], Archived: false, Class: false})
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
            <Button onClick={() => {setSelectedClassAddMode(SelectedClassAddModeType.Section)}}>
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
            <ConnectToTeams onBack={() => {setSelectedClassAddMode(selectedClassAddModeBack)}} usersTeams={usersTeams} onSelectTeam={(team) => {setSelectedTeam(team); setSelectedClassAddMode(SelectedClassAddModeType.EditClass)}}/>
          </div>:null
        }
        { (selectedClassAddMode === SelectedClassAddModeType.EditClass) ?
          <div>
            <EditClass selectedClass={selectedClass} onSetSelectedClass={setSelectedClass} onBack={() => {setSelectedClassAddMode(SelectedClassAddModeType.Section)}} onSelectTeam={() => {setSelectedClassAddModeBack(SelectedClassAddModeType.EditClass); setSelectedClassAddMode(SelectedClassAddModeType.ConnectTeams)}} selectedTeam={selectedTeam}/>
          </div>:null
        }
      </div>
    </div>
  )
}