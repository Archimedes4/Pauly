import { studentSearchSlice } from "../Redux/reducers/studentSearchReducer";
import store from "../Redux/store";
import { loadingStateEnum } from "../types";
import callMsGraph from "./Ultility/microsoftAssets";

function checkIfStudent(role: string): {result: boolean, grade?: "9"|"10"|"11"|"12"} {
  if (role.length >= 20) {
    const reversed = role.split("").reverse().join("");
    const slice = reversed.slice(0, 15);
    if (slice == "ac.sredasurcog@") {
      const getMonth = new Date().getMonth()
      var schoolYear = new Date().getFullYear()
      if (schoolYear.toString().length >= 4){
        if (getMonth > 6) {
          schoolYear++
        } 
        const reverseYearTwelve = schoolYear.toString().slice(2, 4).split("").reverse().join("");
        schoolYear++
        const reverseYearEleven = schoolYear.toString().slice(2, 4).split("").reverse().join("");
        schoolYear++
        const reverseYearTen = schoolYear.toString().slice(2, 4).split("").reverse().join("");
        schoolYear++
        const reverseYearNine = schoolYear.toString().slice(2, 4).split("").reverse().join("");
        if (reversed.slice(16, 17) === reverseYearTwelve) {
          return {result: true, grade: "12"}
        } else if (reversed.slice(16, 17) === reverseYearEleven) {
          return {result: true, grade: "11"}
        } else if (reversed.slice(16, 17) === reverseYearTen) {
          return {result: true, grade: "10"}
        } else if (reversed.slice(16, 17) === reverseYearNine) {
          return {result: true, grade: "9"}
        } else {
          return {result: false}
        }
      } else {
        return {result: false}
      }
    } else {
      return {result: false}
    }
  } else {
    return {result: false}
  }
}

export default async function getUsers(url?: string, search?: string) {
  const filter = search ? `&$search="displayName:${search}"`:""
  const headers = new Headers()
  headers.append("ConsistencyLevel", "eventual")
  const result = await callMsGraph(url ? url:`https://graph.microsoft.com/v1.0/users?$select=displayName,id,mail${filter}`, "GET", undefined, undefined, undefined, undefined, (search) ? headers:undefined)
  if (result.ok) {
    const data = await result.json()
    var outputUsers: schoolUserType[] = []
    for (var index = 0; index < data["value"].length; index++) {
      outputUsers.push({
        name: data["value"][index]["displayName"],
        id: data["value"][index]["id"],
        mail: data["value"][index]["mail"],
        role: data["value"][index]["mail"],
        grade: checkIfStudent(data["value"][index]["mail"]).grade,
        student: checkIfStudent(data["value"][index]["mail"]).result,
        imageId: ""
      })
    }
    store.dispatch(studentSearchSlice.actions.setStudentUsers(outputUsers))
    store.dispatch(studentSearchSlice.actions.setNextLink(data["@odata.nextLink"]))
    store.dispatch(studentSearchSlice.actions.setUsersState(loadingStateEnum.success))
  } else {
    const data = await result.json()
    store.dispatch(studentSearchSlice.actions.setUsersState(loadingStateEnum.failed))
  }
}