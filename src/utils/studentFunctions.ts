/*
  Pauly
  Andrew Mainella
  November 9 2023
  studentFunctions.ts
*/
import { loadingStateEnum } from '@constants';
import { studentSearchSlice } from '@redux/reducers/studentSearchReducer';
import store from '@redux/store';
import largeBatch from '@utils/ultility/batchRequest';
import callMsGraph from '@utils/ultility/microsoftAssets';

function checkIfStudent(role: string): {
  result: boolean;
  grade?: '9' | '10' | '11' | '12';
} {
  if (role !== null && role.length >= 20) {
    const reversed = role.split('').reverse().join('');
    // @ts-expect-error
    const domainName = process.env.EXPO_PUBLIC_DOMAINNAME
    const domainLength = domainName.length;
    const slice = reversed.slice(0, domainLength);
    if (slice === domainName.split('').reverse().join('')) {
      const getMonth = new Date().getMonth();
      let schoolYear = new Date().getFullYear();
      if (schoolYear.toString().length >= 4) {
        if (getMonth > 6) {
          schoolYear += 1;
        }
        const reverseYearTwelve = schoolYear
          .toString()
          .slice(2, 4)
          .split('')
          .reverse()
          .join('');
        schoolYear += 1;
        const reverseYearEleven = schoolYear
          .toString()
          .slice(2, 4)
          .split('')
          .reverse()
          .join('');
        schoolYear += 1;
        const reverseYearTen = schoolYear
          .toString()
          .slice(2, 4)
          .split('')
          .reverse()
          .join('');
        schoolYear += 1;
        const reverseYearNine = schoolYear
          .toString()
          .slice(2, 4)
          .split('')
          .reverse()
          .join('');
        if (reversed.slice(16, 17) === reverseYearTwelve) {
          return { result: true, grade: '12' };
        }
        if (reversed.slice(16, 17) === reverseYearEleven) {
          return { result: true, grade: '11' };
        }
        if (reversed.slice(16, 17) === reverseYearTen) {
          return { result: true, grade: '10' };
        }
        if (reversed.slice(16, 17) === reverseYearNine) {
          return { result: true, grade: '9' };
        }
        return { result: false };
      }
      return { result: false };
    }
    return { result: false };
  }
  return { result: false };
}

export async function getUsers(url?: string, search?: string) {
  const filter = search ? `&$search="displayName:${search}"` : '';
  const result = await callMsGraph(
    url ||
      `https://graph.microsoft.com/v1.0/users?$select=displayName,id,mail${filter}`,
    'GET',
    undefined,
    search ? [{ key: 'ConsistencyLevel', value: 'eventual' }] : undefined,
  );
  if (result.ok) {
    // Getting user Ids from result
    const data = await result.json();
    const userIds: string[] = [];
    for (let index = 0; index < data.value.length; index += 1) {
      userIds.push(data.value[index].id);
    }
    console.log('Mark One');
    // Getting selected user images from student files list in a batch request.
    const batchResult = await largeBatch(undefined, {
      firstUrl: `/sites/${store.getState().paulyList.siteId}/lists/${
        store.getState().paulyList.studentFilesListId
      }/items?$expand=fields&$filter=fields/userId%20eq%20'`,
      secondUrl: "'%20and%20fields/selected%20eq%20true",
      method: 'GET',
      keys: { array: userIds },
    });
    const imagesIdsMap = new Map<string, string>(); // Key is userId, value is image data id
    const imageIdsArray: string[] = [];
    if (
      batchResult.result === loadingStateEnum.success &&
      batchResult.data !== undefined
    ) {
      console.log('Mark Two');
      for (
        let batchIndex = 0;
        batchIndex < batchResult.data.length;
        batchIndex += 1
      ) {
        console.log('Mark Three');
        if (batchResult.data[batchIndex].status === 200) {
          // TO DO OK
          if (batchResult.data[batchIndex].body.value.length === 1) {
            // Checking to make suare only one item is selected
            imagesIdsMap.set(
              batchResult.data[batchIndex].body.value[0].fields.userId,
              batchResult.data[batchIndex].body.value[0].fields.itemId,
            );
            imageIdsArray.push(
              batchResult.data[batchIndex].body.value[0].fields.itemId,
            );
          }
        } else {
          // Batch Response Failed
          store.dispatch(
            studentSearchSlice.actions.setUsersState(loadingStateEnum.failed),
          );
          return;
        }
      }
    } else {
      // Batch Failed
      store.dispatch(
        studentSearchSlice.actions.setUsersState(loadingStateEnum.failed),
      );
      return;
    }

    // Getting downloadUrls for images
    const batchResultDownloadUrls = await largeBatch(undefined, {
      firstUrl: `/sites/${store.getState().paulyList.siteId}/drive/items/`,
      secondUrl: '?$expand=thumbnails($select=c300x400_crop)&$select=id', // ?select=id,content.downloadUrl
      method: 'GET',
      keys: { array: imageIdsArray },
    });
    const imagesDownloadUrls = new Map<string, string>(); // Key is the item id on the sharepoint and value is the downlad url
    if (
      batchResultDownloadUrls.result === loadingStateEnum.success &&
      batchResultDownloadUrls.data !== undefined
    ) {
      for (
        let batchIndex = 0;
        batchIndex < batchResultDownloadUrls.data.length;
        batchIndex += 1
      ) {
        if (batchResultDownloadUrls.data[batchIndex].status === 200) {
          // TO DO OK
          imagesDownloadUrls.set(
            batchResultDownloadUrls.data[batchIndex].body.id,
            batchResultDownloadUrls.data[batchIndex].body.thumbnails[0]
              .c300x400_crop.url,
          );
        } else {
          // Get Image failed
          store.dispatch(
            studentSearchSlice.actions.setUsersState(loadingStateEnum.failed),
          );
          return;
        }
      }
    } else {
      // Getting images batch failed
      store.dispatch(
        studentSearchSlice.actions.setUsersState(loadingStateEnum.failed),
      );
      return;
    }

    const outputUsers: schoolUserType[] = [];
    for (let index = 0; index < data.value.length; index += 1) {
      const imageId = imagesIdsMap.get(data.value[index].id);
      if (imageId !== undefined) {
        const imageDownloadUrl = imagesDownloadUrls.get(imageId);
        if (imageDownloadUrl !== undefined) {
          outputUsers.push({
            name: data.value[index].displayName,
            id: data.value[index].id,
            mail: data.value[index].mail,
            role: data.value[index].mail,
            grade: checkIfStudent(data.value[index].mail).grade,
            student: checkIfStudent(data.value[index].mail).result,
            imageDownloadUrl,
            imageState: loadingStateEnum.notStarted,
          });
        } else {
          outputUsers.push({
            name: data.value[index].displayName,
            id: data.value[index].id,
            mail: data.value[index].mail,
            role: data.value[index].mail,
            grade: checkIfStudent(data.value[index].mail).grade,
            student: checkIfStudent(data.value[index].mail).result,
            imageDownloadUrl: 'noImage',
            imageState: loadingStateEnum.cannotStart,
          });
        }
      } else {
        outputUsers.push({
          name: data.value[index].displayName,
          id: data.value[index].id,
          mail: data.value[index].mail,
          role: data.value[index].mail,
          grade: checkIfStudent(data.value[index].mail).grade,
          student: checkIfStudent(data.value[index].mail).result,
          imageDownloadUrl: 'noImage',
          imageState: loadingStateEnum.cannotStart,
        });
      }
    }
    store.dispatch(studentSearchSlice.actions.setStudentUsers(outputUsers));
    store.dispatch(
      studentSearchSlice.actions.setNextLink(data['@odata.nextLink']),
    );
    store.dispatch(
      studentSearchSlice.actions.setUsersState(loadingStateEnum.success),
    );
  } else {
    // Getting users failed
    store.dispatch(
      studentSearchSlice.actions.setUsersState(loadingStateEnum.failed),
    );
  }
}

export async function getStudentData(
  userId: string,
): Promise<{ result: loadingStateEnum; data?: studentInformationType[] }> {
  const result = await callMsGraph(
    `https://graph.microsoft.com/v1.0/sites/${
      store.getState().paulyList.siteId
    }/lists/${
      store.getState().paulyList.studentFilesListId
    }/items?$expand=fields&$filter=fields/userId%20eq%20'${userId}'`,
  );
  if (result.ok) {
    const data = await result.json();
    const resultData: studentInformationType[] = [];
    for (let index = 0; index < data.value.length; index += 1) {
      resultData.push({
        listId: data.value[index].fields.id,
        driveId: data.value[index].fields.itemId,
        selected: data.value[index].fields.selected,
        createdTime: data.value[index].fields.createdTime,
      });
    }
    return { result: loadingStateEnum.success, data: resultData };
  }
  return { result: loadingStateEnum.failed };
}

export async function changeStudentSelection(
  listItemId: string,
  selectedFileListId: string,
  fileData: studentInformationType[],
  fileIndex: number,
): Promise<{ result: loadingStateEnum; fileData?: studentInformationType[] }> {
  if (selectedFileListId !== '') {
    const unselectedIndex = fileData.findIndex(e => {
      return e.listId === selectedFileListId;
    });
    if (unselectedIndex !== -1) {
      const newFileData = fileData;
      newFileData[fileIndex].selected = false;
      const unselectListData = {
        fields: {
          selected: false,
        },
      };
      const result = await callMsGraph(
        `https://graph.microsoft.com/v1.0/sites/${
          store.getState().paulyList.siteId
        }/lists/${
          store.getState().paulyList.studentFilesListId
        }/items/${selectedFileListId}`,
        'PATCH',
        JSON.stringify(unselectListData),
      );
      if (result.ok) {
        const selectListData = {
          fields: {
            selected: true,
          },
        };
        const secondResult = await callMsGraph(
          `https://graph.microsoft.com/v1.0/sites/${
            store.getState().paulyList.siteId
          }/lists/${
            store.getState().paulyList.studentFilesListId
          }/items/${listItemId}`,
          'PATCH',
          JSON.stringify(selectListData),
        );
        if (secondResult.ok) {
          newFileData[fileIndex].selected = true;
          return { result: loadingStateEnum.success, fileData: newFileData };
        }
        return { result: loadingStateEnum.failed };
      }
      return { result: loadingStateEnum.failed, fileData: [...newFileData] };
    }
    return { result: loadingStateEnum.failed };
  }
  const selectListData = {
    fields: {
      selected: true,
    },
  };
  const secondResult = await callMsGraph(
    `https://graph.microsoft.com/v1.0/sites/${
      store.getState().paulyList.siteId
    }/lists/${
      store.getState().paulyList.studentFilesListId
    }/items/${listItemId}`,
    'PATCH',
    JSON.stringify(selectListData),
  );
  if (secondResult.ok) {
    const newFileData = fileData;
    newFileData[fileIndex].selected = true;
    return { result: loadingStateEnum.success, fileData: [...newFileData] };
  }
  return { result: loadingStateEnum.failed };
}

export async function removeStudentSelection(
  listItemId: string,
  fileIndex: number,
  fileData: studentInformationType[],
): Promise<{ result: loadingStateEnum; fileData?: studentInformationType[] }> {
  const selectListData = {
    fields: {
      selected: false,
    },
  };
  const result = await callMsGraph(
    `https://graph.microsoft.com/v1.0/sites/${
      store.getState().paulyList.siteId
    }/lists/${
      store.getState().paulyList.studentFilesListId
    }/items/${listItemId}`,
    'PATCH',
    JSON.stringify(selectListData),
  );
  if (result.ok) {
    const newFileData = fileData;
    newFileData[fileIndex].selected = false;
    return { result: loadingStateEnum.success, fileData: [...newFileData] };
  }
  return { result: loadingStateEnum.failed };
}

// This is the number of blocks in a row in the student page.
export function getNumberOfBlocks(width: number) {
  return Math.floor(width / 190) !== 0
    ? Math.floor(width % 190 >= 0.75 ? width / 190 : (width + 190) / 190)
    : 1;
}
