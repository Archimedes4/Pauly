import React, { useEffect, useReducer, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Form, Stack } from 'react-bootstrap'
import { UseAuth } from '../../Contexts/AuthContext';
import { collection, query, where, getDocs, limit, getCountFromServer, startAfter, doc, DocumentReference, DocumentData, QuerySnapshot, QueryDocumentSnapshot, startAt, orderBy, or, and } from "firebase/firestore";
import { getFunctions, httpsCallable } from 'firebase/functions';
import { title } from 'process';
import UserQuery from '../../Functions/UserQuery';

declare global{
  type UserType = {
    FirstName: string
    LastName: string
    Permissions: number[] | null
    ClassMode: number | null
    ClassPerms: string[] | null
    SportsMode: number | null
    SportsPerms: string[] | null
    Classses: string[] | null
    CompletedCommissions: number[] | null
    SubmittedCommissions: number[] | null
    ElectionsVoted: string[] | null
    Email: string
    Grade: number | null
    Groups: string[] | null
    MemberGroups: string[] | null
    NotificationToken: string
    Score: string | null
    Section: number
    Title: string
    uid: string,
    MicrosoftID: string
  }
}

enum SelectedSearchModeType {
  Staff,
  Student,
  All
}

export default function Users() {
  const { db, app,  currentUserMicrosoftAccessToken } = UseAuth()
  const getQuery = UserQuery()
  const [users, setUsers] = useState<UserType[]>([])
  const [selctedUser, setSelectedUser] = useState<UserType | null>(null)
  const [userCount, setUserCount] = useState<number>(0)
  const [microsoftUserCount, setMicrosoftUserCount] = useState<number>(0)
  const userContainerRef = useRef(null)

  const [currentPage, setCurrentPage] = useState<string | null>(null)
  const [searchText, setSearchText] = useState<string>("")
  const [selectedSearchMode, setSelectedSearchMode] = useState<SelectedSearchModeType>(SelectedSearchModeType.All)
  const [selectedGrade, setSelectedGrade] = useState<undefined | number>(undefined)
  const [selectedSection, setSelectedSection] = useState(undefined)
  const [searchCount, setSearchCount] = useState(null)
  
  async function getMicrosoftUsers(nextLinkIn: string) {
    const result = await fetch(nextLinkIn, {method: "Get", headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + currentUserMicrosoftAccessToken
    },})
    const data = await result.json()
    const nextLink = data["@odata.nextLink"]
    return {
      Link: nextLink,
      Data: data["value"]
    }
  }

  async function syncMicrosoftUsers(){
    var continueOn: boolean = true
    var link: string = "https://graph.microsoft.com/v1.0/users"
    const functions = getFunctions(app);
    // connectFunctionsEmulator(functions, "localhost", 5001);
    while (continueOn){
      const result = await getMicrosoftUsers(link)
      if (result.Link === undefined) {
        continueOn = false
      } else {
        link = result.Link
      }
      var userArray = []
      for (var index = 0; index < result.Data.length; index++) {
        userArray.push({userName: result.Data[index]["userPrincipalName"], displayName: result.Data[index]["displayName"], externalId: result.Data[index]["id"]})
      }
      const addMessage = httpsCallable(functions, 'addMicrosoftUser');

      if (result.Data.length >= 4){
        const quarter = Math.ceil(userArray.length / 4);
        const array1 = userArray.slice(0, quarter);
        const array2 = userArray.slice(quarter, quarter * 2);
        const array3 = userArray.slice(quarter * 2, quarter * 3);
        const array4 = userArray.slice(quarter * 3);

  
        const resultOut = await addMessage({ Body: array1 })
        const data: any = resultOut.data as any;
        const sanitizedMessage: string = data["Result"]
        console.log(sanitizedMessage)
  
        const resultOut1 = await addMessage({ Body:  array2  })
        const data1: any = resultOut1.data as any;
        const sanitizedMessage1: string = data1["Result"]
        console.log(sanitizedMessage1)

        const resultOut2 = await addMessage({ Body:  array3  })
        const data2: any = resultOut2.data as any;
        const sanitizedMessage2: string = data2["Result"]
        console.log(sanitizedMessage2)

        const resultOut3 = await addMessage({ Body:  array4  })
        const data3: any = resultOut3.data as any;
        const sanitizedMessage3: string = data3["Result"]
        console.log(sanitizedMessage3)
      } else {
        const resultOut1 = await addMessage({ Body:  userArray  })
        const data1: any = resultOut1.data as any;
        const sanitizedMessage1: string = data1["Result"]
        console.log(sanitizedMessage1)
      }
    }
  }

  async function getMembership(id: string){
    const result = await fetch("https://graph.microsoft.com/v1.0/users/" + id + "/memberOf", {method: "Get", headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + currentUserMicrosoftAccessToken
    },})
    const data = await result.json()
    return data
  }

  async function syncMicrosoftUsersData(){
    var continueOn: boolean = true
    var link: string = "https://graph.microsoft.com/v1.0/users"
    const functions = getFunctions(app);
    // connectFunctionsEmulator(functions, "localhost", 5001);
    while (continueOn){
      const result = await getMicrosoftUsers(link)
      if (result.Link === undefined) {
        continueOn = false
      } else {
        link = result.Link
      }
      var userArray = []
      for (var index = 0; index < result.Data.length; index++) {
        const teams = await getMembership(result.Data[index]["id"])
        const year = new Date().getFullYear() 
        const month = new Date().getMonth()
        var schoolGraduationYear = 2024
        if (month <= 5){
          schoolGraduationYear = year
        } else {
          schoolGraduationYear = year + 1
        }
        const schoolGraduationYearSuffixString: string = schoolGraduationYear.toString().slice(-2)
        const schoolGraduationYearSuffixInt: number = parseInt(schoolGraduationYearSuffixString)
        var staff = false
        var student = false
        var Grade = 9
        var TeamIdsRan = ""
        console.log(teams["value".length])
        for (var teamIndex = 0; teamIndex < teams["value"].length; teamIndex++){
          TeamIdsRan += teams["value"][teamIndex]["id"] + " "
          if (teams["value"][teamIndex]["id"] === "067182cf-aede-45f8-8e2a-8c817b11e978" || teams["value"][teamIndex]["id"] === "104f886b-08e0-4415-a694-fc4e3203c6e0"){
            staff = true
            console.log("THIS IS A STAFF MEMBER")
          }
        }
        if (result.Data[index]["userPrincipalName"].includes((schoolGraduationYearSuffixInt + 3) + "@gocrusaders.ca")){
          //Grade 9
          student = true
          Grade = 9
        } else if (result.Data[index]["userPrincipalName"].includes((schoolGraduationYearSuffixInt + 2) + "@gocrusaders.ca")) {
          //Grade 10
          student = true
          Grade = 10
        } else if (result.Data[index]["userPrincipalName"].includes((schoolGraduationYearSuffixInt + 1) + "@gocrusaders.ca")) {
          //Grade 11
          student = true
          Grade = 11
        } else if (result.Data[index]["userPrincipalName"].includes((schoolGraduationYearSuffixInt) + "@gocrusaders.ca")){
          //Grade 12
          student = true
          Grade = 12
        }
        if (staff){
          userArray.push({Grade: null, Title: "Staff", userName: result.Data[index]["userPrincipalName"], surname: result.Data[index]["surname"], givenName: result.Data[index]["givenName"], displayName: result.Data[index]["displayName"], externalId: result.Data[index]["id"]})
        } else if (student) {
          userArray.push({Grade: Grade, Title: "Student", userName: result.Data[index]["userPrincipalName"], surname: result.Data[index]["surname"], givenName: result.Data[index]["givenName"], displayName: result.Data[index]["displayName"], externalId: result.Data[index]["id"]})
        } else {
          console.log(result.Data[index]["displayName"])
          console.log(teams)
          console.log("length", teams["value"].length)
          console.log(TeamIdsRan)
          userArray.push({Grade: null, Title: "", userName: result.Data[index]["userPrincipalName"], surname: result.Data[index]["surname"], givenName: result.Data[index]["givenName"], displayName: result.Data[index]["displayName"], externalId: result.Data[index]["id"]})
        }
      }
      const addMessage = httpsCallable(functions, 'addUserDataMicrosoft');

      if (result.Data.length >= 4){
        const quarter = Math.ceil(userArray.length / 4);
        const array1 = userArray.slice(0, quarter);
        const array2 = userArray.slice(quarter, quarter * 2);
        const array3 = userArray.slice(quarter * 2, quarter * 3);
        const array4 = userArray.slice(quarter * 3);

  
        const resultOut = await addMessage({ Body: array1 })
        const data: any = resultOut.data as any;
        const sanitizedMessage: string = data["Result"]
        console.log(sanitizedMessage)
  
        const resultOut1 = await addMessage({ Body:  array2  })
        const data1: any = resultOut1.data as any;
        const sanitizedMessage1: string = data1["Result"]
        console.log(sanitizedMessage1)

        const resultOut2 = await addMessage({ Body:  array3  })
        const data2: any = resultOut2.data as any;
        const sanitizedMessage2: string = data2["Result"]
        console.log(sanitizedMessage2)

        const resultOut3 = await addMessage({ Body:  array4  })
        const data3: any = resultOut3.data as any;
        const sanitizedMessage3: string = data3["Result"]
        console.log(sanitizedMessage3)
      } else {
        const resultOut1 = await addMessage({ Body:  userArray  })
        const data1: any = resultOut1.data as any;
        const sanitizedMessage1: string = data1["Result"]
        console.log(sanitizedMessage1)
      }
    }
  }

  async function getUsers(searchMode: SelectedSearchModeType, newSearch: boolean, page?: string, search?: string){
    console.log(selectedGrade)
    var q = await getQuery({newSearch: newSearch, search: search, page: page, grade: selectedGrade, section: undefined, staff: (searchMode === SelectedSearchModeType.Staff) ? true:false, student: (searchMode === SelectedSearchModeType.Student) ? true:false})
    setCurrentPage(q.NextPage)
    if (newSearch){
      setUsers(q.value)
    } else {
      setUsers([...users, ...q.value])
    }
    if (q.Count !== null){
      setSearchCount(q.Count)
    }
  }

  async function getMicrosoftUserCount() {
    const result = await fetch("https://graph.microsoft.com/v1.0/users/$count", {method: "Get", headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + currentUserMicrosoftAccessToken,
      "consistencylevel":"eventual" 
    },})
    const data = await result.json()
    setMicrosoftUserCount(data)
  }

  async function getUserCount() {
    const coll = collection(db, "Users");
    const snapshot = await getCountFromServer(coll);
    setUserCount(snapshot.data().count)
  }

  const handleScroll = () => {
    const { scrollTop, scrollHeight, clientHeight, offsetHeight, offsetWidth } = userContainerRef.current;
    const hasOverflowingChildren = offsetHeight < scrollHeight
    const bottom = scrollHeight - scrollTop === clientHeight;
    if (bottom && hasOverflowingChildren) { 
      console.log("This is page", currentPage)
      getUsers(selectedSearchMode, false,  currentPage)
    }
  }

  useEffect(() => {
    getUserCount()
  }, []) 

  useEffect(() => {
    setUsers([])
    getUsers(selectedSearchMode, true, currentPage)
  }, [selectedSearchMode])

  useEffect(() => {
    console.log("This", selectedGrade)
    setUsers([])
    getUsers(selectedSearchMode, true, currentPage)
  }, [selectedGrade])

  return (
    <div>
        { selctedUser ?
          <div>
            <button onClick={() => {
              setSelectedUser(null)
            }}>
              Back
            </button>
            <p>User</p>
            <p>{selctedUser.FirstName} {selctedUser.LastName}</p>
            <p>{selctedUser.Title}</p>
            <p>Email: {selctedUser.Email}</p>
            <p>Score: {selctedUser.Score}</p>
            <p>UID: {selctedUser.uid}</p>
          </div>:
            <Stack>
              <Link to='/government/'>Back</Link>
              <p>User Count: {userCount} Microsoft User Count: {microsoftUserCount}</p>
              <button onClick={() => {setCurrentPage(""); setSelectedSearchMode(SelectedSearchModeType.Staff); setSelectedGrade(undefined); setSelectedSection(undefined)}}>
                Teachers
              </button>
              <button onClick={() => {setCurrentPage(""); setSelectedSearchMode(SelectedSearchModeType.Student)}}>
                Students
              </button>
              <button onClick={() => {setSelectedSearchMode(SelectedSearchModeType.All); setSelectedGrade(undefined); setSelectedSection(undefined)}}>
                All Users
              </button>
              { (selectedSearchMode === SelectedSearchModeType.Student) ? 
                <div>
                  <p>Student</p>
                  <p>Grade</p>
                  <select value={selectedGrade} onChange={(e) => {
                    console.log(parseInt(e.currentTarget.value))
                    setCurrentPage("");
                    setSelectedGrade(parseInt(e.currentTarget.value))}}>
                    <option value={undefined}>No Selection</option>
                    <option value={9}>Grade 9</option>
                    <option value={10}>Grade 10</option>
                    <option value={11}>Grade 11</option>
                    <option value={12}>Grade 12</option>
                  </select>
                </div>:null
              }
              <Form onSubmit={(e) => {
                e.preventDefault()
                getUsers(selectedSearchMode, true, currentPage, searchText)
                userContainerRef.current.scrollTo({
                  top: 0,
                });
              }} style={{backgroundColor:  "#793033", width: "80vw"}}>
                <Form.Group id="email">
                  <Form.Control  value={searchText} onChange={(e) => {
                    e.preventDefault()
                    setSearchText(e.currentTarget.value)
                  }} />
                </Form.Group>
              </Form>
              {(searchCount !== null) ?
                <p>Search Result Count: {searchCount}</p>:null
              }
              <div style={{height: "50vh"}} >
                <div ref={userContainerRef} onScroll={() => handleScroll()} style={{overflow: "scroll", height: "50vh"}}>
                  { users.map((user) => (
                    <div>
                      <button onClick={() => {
                        setSelectedUser(user)
                      }}>
                        {user.FirstName} {user.LastName}
                      </button>
                    </div>))
                  }
                </div>
              </div>
              <button>
                  Create Users
              </button>
              <button onClick={() => {
                getMicrosoftUsers("https://graph.microsoft.com/v1.0/users")
              }}>
                Show Microsoft Users
              </button>
              <button onClick={() => {
                syncMicrosoftUsers()
              }}>
                Sync Users With Pauly
              </button>
              <button onClick={async () => {
                const functions = getFunctions(app);
                // connectFunctionsEmulator(functions, "localhost", 5001);
                const addMessage = httpsCallable(functions, 'deleteAnonymousUsers');
                await addMessage({})
              }}>
                delete
              </button>
              <button onClick={() => {
                syncMicrosoftUsersData()
              }}>
                Sync User Data With Microsoft
              </button>
              <button onClick={() => {
                setUsers([])
              }}>
                Clear
              </button>
            </Stack>
        }
    </div>
  )
}
