import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Stack } from 'react-bootstrap'
import { useAuth } from '../../Contexts/AuthContext';
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator, httpsCallable } from 'firebase/functions';

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
    Grade: number
    Groups: string[] | null
    MemberGroups: string[] | null
    NotificationToken: string
    Score: string | null
    Section: number
    Title: string
    uid: string
  }
}

export default function Users() {
  const { db, app,  currentUserMicrosoftAccessToken } = useAuth()
  const [users, setUsers] = useState<UserType[]>([])
  
  async function getMicrosoftUsers(nextLinkIn: string) {
    const result = await fetch(nextLinkIn, {method: "Get", headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + currentUserMicrosoftAccessToken
    },})
    const data = await result.json()
    const nextLink = data["@odata.nextLink"]
    console.log(data)
    return {
      Link: nextLink,
      Data: data["value"]
    }
  }

  // function divideArrayIntoQuarters(array) {
  //   const length = array.length;
  //   const quarter = Math.floor(length / 4);
  
  //   for (let i = 0; i < length; i += quarter) {
  //     const slice = array.slice(i, i + quarter);
  //     result.push(slice);
  //   }
  
  //   return result;
  // }

  async function syncMicrosoftUsers(){
    var continueOn: boolean = true
    var link: string = "https://graph.microsoft.com/v1.0/users"
    const functions = getFunctions(app);
    connectFunctionsEmulator(functions, "localhost", 5001);
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

  async function getUsers(){
    const q = query(collection(db, "Users"), limit(100));

    const querySnapshot = await getDocs(q);
    var newUsers: UserType[] = []
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      console.log(doc.id, " => ", doc.data());
      const data = doc.data()
      newUsers.push({
        FirstName: data["First Name"],
        LastName: data["Last Name"],
        Permissions: data["Permissions"],
        ClassMode: data["ClassMode"],
        ClassPerms: data["ClassPerms"],
        SportsMode: data["SportsMode"],
        SportsPerms: data["SportsPerms"],
        Classses: data["Classses"],
        CompletedCommissions: data["CompletedCommissions"],
        SubmittedCommissions: data["SubmittedCommissions"],
        ElectionsVoted: data["ElectionsVoted"],
        Email: data["Email"],
        Grade: data["Grade"],
        Groups: data["Groups"],
        MemberGroups: data["MemberGroups"],
        NotificationToken: data["NotificationToken"],
        Score: data["Score"],
        Section: data["Section"],
        Title: data["Title"],
        uid: data["uid"]
      })
    });
    setUsers(newUsers)
  }

  useEffect(() => {
    getUsers()
  }, [])
  

  return (
    <div>
        <Stack>
            Users
            <Link to='/government/'>Back</Link>
            { users.map((user) => (
              <div>
                <p>{user.FirstName} {user.LastName}</p>
              </div>))

            }
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
              connectFunctionsEmulator(functions, "localhost", 5001);
              const addMessage = httpsCallable(functions, 'deleteAnonymousUsers');
              await addMessage({  })
            }}>
              delete
            </button>
        </Stack>
    </div>
  )
}
