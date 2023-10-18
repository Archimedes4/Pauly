import { studentSearchSlice } from "../Redux/reducers/studentSearchReducer";
import store from "../Redux/store";
import { loadingStateEnum } from "../types";
import largeBatch from "./Ultility/batchRequest";
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

  const result = await callMsGraph(url ? url:`https://graph.microsoft.com/v1.0/users?$select=displayName,id,mail${filter}`, "GET", undefined, (search) ? [{key: "ConsistencyLevel", value: "eventual"}]:undefined)
  if (result.ok) {
    const data = await result.json()
    var userIds: string[] = []
    for (var index = 0; index < data["value"].length; index++) {
      userIds.push(data["value"][index]["id"])
    }
    const batchResult = await largeBatch(undefined, {
      firstUrl: `/sites/${store.getState().paulyList.siteId}/lists/${store.getState().paulyList.studentFilesListId}/items?$expand=fields&$filter=fields/userId%20eq%20'`,
      secondUrl: "'%20and%20fields/selected%20eq%20true",
      method: "GET",
      keys: {array: userIds}
    })
    var imagesIdsMap = new Map<string, string>() //Key is userId, value is image data id
    var imageIdsArray: string[] = []
    if (batchResult.result === loadingStateEnum.success && batchResult.data !== undefined) {
      for (var batchIndex = 0; batchIndex < batchResult.data.length; batchIndex++) {
        if (batchResult.data[batchIndex].status === 200) { //TO DO OK
          if (batchResult.data[batchIndex].body["value"].length === 1) {
            imagesIdsMap.set(batchResult.data[batchIndex].body["value"][0]["fields"]["userId"], batchResult.data[batchIndex].body["value"][0]["fields"]["itemId"])
            imageIdsArray.push(batchResult.data[batchIndex].body["value"][0]["fields"]["itemId"])
          }
        } else {
          store.dispatch(studentSearchSlice.actions.setUsersState(loadingStateEnum.failed))
          return
        }
      }
    } else {
      store.dispatch(studentSearchSlice.actions.setUsersState(loadingStateEnum.failed))
      return
    }
    const batchResultDownloadUrls = await largeBatch(undefined, {
      firstUrl: `/sites/${store.getState().paulyList.siteId}/drive/items/`,
      secondUrl: "?select=id,content.downloadUrl",
      method: "GET",
      keys: {array: imageIdsArray}
    })
    var imagesDownloadUrls = new Map<string, string>() //Key is the item id on the sharepoint and value is the downlad url
    if (batchResultDownloadUrls.result === loadingStateEnum.success && batchResultDownloadUrls.data !== undefined) {
      for (var batchIndex = 0; batchIndex < batchResultDownloadUrls.data.length; batchIndex++) {
        if (batchResultDownloadUrls.data[batchIndex].status === 200) { //TO DO OK
          imagesDownloadUrls.set(batchResultDownloadUrls.data[batchIndex].body["id"], batchResultDownloadUrls.data[batchIndex].body["@microsoft.graph.downloadUrl"])
        } else {
          store.dispatch(studentSearchSlice.actions.setUsersState(loadingStateEnum.failed))
          return
        }
      }
    } else {
      store.dispatch(studentSearchSlice.actions.setUsersState(loadingStateEnum.failed))
      return
    }


    var outputUsers: schoolUserType[] = []
    for (var index = 0; index < data["value"].length; index++) {
      const imageId = imagesIdsMap.get(data["value"][index]["id"])
      if (imageId !== undefined) {
        const imageDownloadUrl = imagesDownloadUrls.get(imageId)
        if (imageDownloadUrl !== undefined) {
          outputUsers.push({
            name: data["value"][index]["displayName"],
            id: data["value"][index]["id"],
            mail: data["value"][index]["mail"],
            role: data["value"][index]["mail"],
            grade: checkIfStudent(data["value"][index]["mail"]).grade,
            student: checkIfStudent(data["value"][index]["mail"]).result,
            imageDownloadUrl: imageDownloadUrl,
            imageState: loadingStateEnum.notStarted
          })
        } else {
          outputUsers.push({
            name: data["value"][index]["displayName"],
            id: data["value"][index]["id"],
            mail: data["value"][index]["mail"],
            role: data["value"][index]["mail"],
            grade: checkIfStudent(data["value"][index]["mail"]).grade,
            student: checkIfStudent(data["value"][index]["mail"]).result,
            imageDownloadUrl: "noImage",
            imageState: loadingStateEnum.cannotStart
          })
        }
      } else {
        outputUsers.push({
          name: data["value"][index]["displayName"],
          id: data["value"][index]["id"],
          mail: data["value"][index]["mail"],
          role: data["value"][index]["mail"],
          grade: checkIfStudent(data["value"][index]["mail"]).grade,
          student: checkIfStudent(data["value"][index]["mail"]).result,
          imageDownloadUrl: "noImage",
          imageState: loadingStateEnum.cannotStart
        })
      }
    }

    store.dispatch(studentSearchSlice.actions.setStudentUsers(outputUsers))
    store.dispatch(studentSearchSlice.actions.setNextLink(data["@odata.nextLink"]))
    store.dispatch(studentSearchSlice.actions.setUsersState(loadingStateEnum.success))
  } else {
    store.dispatch(studentSearchSlice.actions.setUsersState(loadingStateEnum.failed))
  }
}

export async function getStudentData(userId: string): Promise<{result: loadingStateEnum, data?: studentInformationType[]}> {
  const result = await callMsGraph(`https://graph.microsoft.com/v1.0/sites/${store.getState().paulyList.siteId}/lists/${store.getState().paulyList.studentFilesListId}/items?$expand=fields&$filter=fields/userId%20eq%20'${userId}'`)
  if (result.ok) {
    const data = await result.json()
    var resultData: studentInformationType[] = []
    for (var index = 0; index < data["value"].length; index++) {
      resultData.push({
        listId: data["value"][index]["fields"]["id"],
        driveId: data["value"][index]["fields"]["itemId"],
        selected: data["value"][index]["fields"]["selected"],
        createdTime: data["value"][index]["fields"]["createdTime"]
      })
    }
    return {result: loadingStateEnum.success, data: resultData}
  } else {
    return {result: loadingStateEnum.failed}
  }
}