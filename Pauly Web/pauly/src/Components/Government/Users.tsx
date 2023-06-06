import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Stack } from 'react-bootstrap'
import { useAuth } from '../../Contexts/AuthContext';
import { collection, query, where, getDocs, limit } from "firebase/firestore";

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
  const { db, currentUserMicrosoftAccessToken } = useAuth()
  const [users, setUsers] = useState<UserType[]>([])
  
  async function getMicrosoftUsers(nextLinkIn: string) {
    const result = await fetch(nextLinkIn, {method: "Get", headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + currentUserMicrosoftAccessToken
    },})
    const data = await result.json()
    const nextLink = data["@odata.nextLink"]
    console.log(nextLink)
  }

  async function syncMicrosoftUsers(){
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

            }}>
              Sync Users With Pauly
            </button>
        </Stack>
    </div>
  )
}
