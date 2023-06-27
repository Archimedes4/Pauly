import { collection, query, where, getDocs, limit, getCountFromServer, startAfter, doc, DocumentReference, DocumentData, QuerySnapshot, QueryDocumentSnapshot, startAt, orderBy, or, and, Query } from "firebase/firestore";
import { UseAuth } from '../Contexts/AuthContext';
import { useEffect } from "react";

export default function UserQuery() {
  const { db } = UseAuth()

  const getQuery = async function({ newSearch, search, page, grade, section, staff, student }:{newSearch: boolean, search: string, page: string, grade: number | undefined, section: number | undefined, staff: boolean, student: boolean }): Promise<{ value: Query<DocumentData>; Count: null | number; }> {
    console.log("Running", "Student", student, "Staff", staff)
    if (staff){
      if (page !== "" && !newSearch){
        if (search !== undefined && search !== "") {
          return {
            value: query(collection(db, "Users"), orderBy("Last Name"), orderBy("uid"), startAfter(page), where("Last Name", ">=", search), where("Title", "==", "Staff"), limit(100)),
            Count: null
          }
        } else {
          return {
            value: query(collection(db, "Users"), orderBy("Last Name"), orderBy("uid"), startAfter(page), where("Title", "==", "Staff"), limit(100)),
            Count: null
          }
        }
      } else {
        if (search !== undefined && search !== "") {
          const result = await getCountFromServer(query(collection(db, "Users"), orderBy("Last Name"), orderBy("uid"), where("Last Name", ">=", search), where("Title", "==", "Staff")))
          return {
            value: query(collection(db, "Users"), orderBy("Last Name"), orderBy("uid"), where("Last Name", ">=", search), where("Title", "==", "Staff"), limit(100)),
            Count: result.data().count
          }
        } else {
          const result = await getCountFromServer(query(collection(db, "Users"), orderBy("Last Name"), orderBy("uid"), where("Title", "==", "Staff")))
          return {
            value:  query(collection(db, "Users"), orderBy("Last Name"), orderBy("uid"), where("Title", "==", "Staff"), limit(100)),
            Count: result.data().count
          }
        }
      }
    } else if (student) {
      console.log("Student Grade:", grade)
      if (page !== "" && !newSearch){
        if (search !== undefined && search !== "") {
          if (grade !== undefined && section !== undefined){
            return {
              value: query(collection(db, "Users"), orderBy("Last Name"), orderBy("uid"), startAfter(page), where("Last Name", ">=", search), where("Title", "==", "Student"), where("Grade", "==", grade), where("Section", "==", section.toString()), limit(100)),
              Count: null
            }
          } else if (grade !== undefined){
            return {
              value: query(collection(db, "Users"), orderBy("Last Name"), orderBy("uid"), startAfter(page), where("Last Name", ">=", search), where("Title", "==", "Student"), where("Grade", "==", grade), limit(100)),
              Count: null
            }
          } else if (section !== undefined){
            return {
              value: query(collection(db, "Users"), orderBy("Last Name"), orderBy("uid"), startAfter(page), where("Last Name", ">=", search), where("Title", "==", "Student"), where("Section", "==", section),  limit(100)),
              Count: null
            }
          } else {
            return {
              value: query(collection(db, "Users"), orderBy("Last Name"), orderBy("uid"), startAfter(page), where("Last Name", ">=", search), where("Title", "==", "Student"), limit(100)),
              Count: null
            }
          }
        } else {
          console.log("THis is happening on line 62")
          if (grade !== undefined && section !== undefined){
            return {
              value: query(collection(db, "Users"), orderBy("Last Name"), orderBy("uid"), startAfter(page), where("Title", "==", "Student"), where("Grade", "==", grade), where("Section", "==", section),  limit(100)),
              Count: null
            }
          } else if (grade !== undefined){
            return {
              value: query(collection(db, "Users"), orderBy("Last Name"), orderBy("uid"), startAfter(page), where("Title", "==", "Student"), where("Grade", "==", grade), limit(100)),
              Count: null
            }
          } else if (section !== undefined){
            return {
              value: query(collection(db, "Users"), orderBy("Last Name"), orderBy("uid"), startAfter(page), where("Title", "==", "Student"), where("Section", "==", section),  limit(100)),
              Count: null
            }
          } else {
            return {
              value: query(collection(db, "Users"), orderBy("Last Name"), orderBy("uid"), startAfter(page), where("Title", "==", "Student"), limit(100)),
              Count: null
            }
          }
        }
      } else {
        if (search !== undefined && search !== "") {
          if (grade !== undefined && section !== undefined){
            const result = await getCountFromServer( query(collection(db, "Users"), orderBy("Last Name"), orderBy("uid"), where("Last Name", ">=", search), where("Title", "==", "Student"), where("Grade", "==", grade), where("Section", "==", section)))
            return {
              value: query(collection(db, "Users"), orderBy("Last Name"), orderBy("uid"), where("Last Name", ">=", search), where("Grade", "==", grade), where("Title", "==", "Student"), where("Section", "==", section),  limit(100)),
              Count: result.data().count
            }
          } else if (grade !== undefined){
            const result = await getCountFromServer(query(collection(db, "Users"), orderBy("Last Name"), orderBy("uid"), where("Last Name", ">=", search), where("Title", "==", "Student"), where("Grade", "==", grade)))
            return {
              value: query(collection(db, "Users"), orderBy("Last Name"), orderBy("uid"), where("Last Name", ">=", search), where("Title", "==", "Student"), where("Grade", "==", grade),  limit(100)),
              Count: result.data().count
            }
          } else if (section !== undefined){
            const result = await getCountFromServer(query(collection(db, "Users"), orderBy("Last Name"), orderBy("uid"), where("Last Name", ">=", search), where("Title", "==", "Student"), where("Section", "==", section)))
            return {
              value: query(collection(db, "Users"), orderBy("Last Name"), orderBy("uid"), where("Last Name", ">=", search), where("Title", "==", "Student"), where("Section", "==", section), limit(100)),
              Count: result.data().count
            }
          } else {
            const result = await getCountFromServer(query(collection(db, "Users"), orderBy("Last Name"), orderBy("uid"), where("Last Name", ">=", search), where("Title", "==", "Student")))
            return {
              value: query(collection(db, "Users"), orderBy("Last Name"), orderBy("uid"), where("Last Name", ">=", search), where("Title", "==", "Student"), limit(100)),
              Count: result.data().count
            }
          }
        } else {
          console.log("THis is happening on line 93")
          if (grade !== undefined && section !== undefined){
            const result = await getCountFromServer(query(collection(db, "Users"), orderBy("Last Name"), orderBy("uid"), where("Title", "==", "Student"), where("Grade", "==", grade),  where("Section", "==", section)))
            return {
              value: query(collection(db, "Users"), orderBy("Last Name"), orderBy("uid"), where("Title", "==", "Student"), where("Grade", "==", grade),  where("Section", "==", section), limit(100)),
              Count: result.data().count
            }
          }  else if (grade !== undefined){
            const result = await getCountFromServer(query(collection(db, "Users"), orderBy("Last Name"), orderBy("uid"), where("Title", "==", "Student"), where("Grade", "==", grade)))
            return {
              value: query(collection(db, "Users"), orderBy("Last Name"), orderBy("uid"), where("Title", "==", "Student"), where("Grade", "==", grade),  limit(100)),
              Count: result.data().count
            }
          } else if (section !== undefined){
            const result = await getCountFromServer(query(collection(db, "Users"), orderBy("Last Name"), orderBy("uid"), where("Title", "==", "Student"), where("Section", "==", section)))
            return {
              value: query(collection(db, "Users"), orderBy("Last Name"), orderBy("uid"), where("Title", "==", "Student"), where("Section", "==", section), limit(100)),
              Count: result.data().count
            }
          } else {
            const result = await getCountFromServer(query(collection(db, "Users"), orderBy("Last Name"), orderBy("uid"), where("Title", "==", "Student")))
            return {
              value: query(collection(db, "Users"), orderBy("Last Name"), orderBy("uid"), where("Title", "==", "Student"), limit(100)),
              Count: result.data().count
            }
          }
        }
      }
    } else {
      if (page !== "" && !newSearch){
        if (search !== undefined && search !== "") {
          return {
            value: query(collection(db, "Users"), orderBy("Last Name"), orderBy("uid"), startAfter(page), where("Last Name", ">=", search), limit(100)),
            Count: null
          }
        } else {
          return {
            value: query(collection(db, "Users"), orderBy("Last Name"), orderBy("uid"), startAfter(page), limit(100)),
            Count: null
          }
        }
      } else {
        if (search !== undefined && search !== "") {
          const result = await getCountFromServer(query(collection(db, "Users"), orderBy("Last Name"), orderBy("uid"), where("Last Name", ">=", search)))
          return {
            value: query(collection(db, "Users"), orderBy("Last Name"), orderBy("uid"), where("Last Name", ">=", search), limit(100)),
            Count: result.data().count
          }
        } else {
          const result = await getCountFromServer(query(collection(db, "Users"), orderBy("Last Name"), orderBy("uid")))
          return {
            value: query(collection(db, "Users"), orderBy("Last Name"), orderBy("uid"), limit(100)),
            Count: result.data().count
          }
        }
      }
    }
  }

  async function getUsers({ newSearch, search, page, grade, section, staff, student }:{newSearch: boolean, search: string, page: string, grade: number | undefined, section: number | undefined, staff: boolean, student: boolean }): Promise<{ value: UserType[]; NextPage: string | null; Count: number | null; }> {
    var q = await getQuery({newSearch: newSearch, search: search, page: page, grade: grade, section: section, staff: staff, student: student})
    console.log(q.Count)
    const querySnapshot = await getDocs(q.value);
    var newUsers: UserType[] = []
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
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
        uid: data["uid"],
        MicrosoftID: data["MicrosoftID"]
      })
    });
    var currentPage = null
    try{
      currentPage = querySnapshot.docs[querySnapshot.docs.length-1].get("uid")
    } catch {
      currentPage = null
    }
    // if (search === undefined || search === "") {
    //   setUsers([... users, ...newUsers])
    // } else {
    //   setUsers(newUsers)
    // }
    return {
      value: newUsers,
      NextPage: currentPage,
      Count: q.Count
    }
  }

  return getUsers
}
