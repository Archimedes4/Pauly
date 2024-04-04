/*
  Pauly
  Andrew Mainella
  November 9 2023
  microsoftFilePickerFunctions.ts
  functions for src/components/MicorosftFilePicker.tsx
*/
import { loadingStateEnum } from '@constants';
import callMsGraph from '@utils/ultility/microsoftAssests';

export async function getUserMicrosoftFiles(
  path: string,
): Promise<{ result: loadingStateEnum; data?: microsoftFileType[] }> {
  const result = await callMsGraph(path);
  if (result.ok) {
    const data = await result.json();
    const newFiles: microsoftFileType[] = [];
    for (let index = 0; index < data.value.length; index += 1) {
      newFiles.push({
        name: data.value[index].name,
        id: data.value[index].id,
        lastModified: data.value[index].lastModifiedDateTime,
        folder: data.value[index].folder !== undefined,
        parentDriveId: data.value[index].parentReference.driveId,
        parentPath: data.value[index].parentReference.path,
        itemGraphPath: data.value[index].folder === undefined ? path : 'FOLDER',
        callPath: `https://graph.microsoft.com/v1.0/me/drives/${data.value[index].parentReference.driveId}/items/${data.value[index].id}`,
        type:
          data.value[index].folder === undefined
            ? data.value[index].file.mimeType
            : 'folder',
      });
    }
    return { result: loadingStateEnum.success, data: newFiles };
  }
  return { result: loadingStateEnum.failed };
}

export async function getUserTeams(): Promise<
  | { result: loadingStateEnum.success; data: teamsGroupType[] }
  | { result: loadingStateEnum.failed }
> {
  const result = await callMsGraph(
    'https://graph.microsoft.com/v1.0/me/joinedTeams',
  ); // TODO make sure this works on live tenancy
  if (result.ok) {
    const data = await result.json();
    const newData: teamsGroupType[] = [];
    for (let index = 0; index < data.value.length; index += 1) {
      if (data.value[index] !== undefined) {
        newData.push({
          teamName: data.value[index].displayName,
          teamId: data.value[index].id,
          teamDescription: data.value[index].description,
        });
      }
    }
    return { result: loadingStateEnum.success, data: newData };
  }
  return { result: loadingStateEnum.failed };
}
