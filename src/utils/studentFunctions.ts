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
import callMsGraph from '@utils/ultility/microsoftAssests';

export function checkIfStudent(role: string): {
  result: boolean;
  grade?: '9' | '10' | '11' | '12';
} {
  if (role !== null && role.length >= 20) {
    const reversed = role.split('').reverse().join('');
    const domainName: string = process.env.EXPO_PUBLIC_DOMAINNAME ?? '';
    const domainLength = domainName.length;
    const slice = reversed.slice(0, domainLength);
    if (slice === domainName.split('').reverse().join('')) {
      const getMonth = new Date().getMonth();
      let schoolYear = new Date().getFullYear();
      if (schoolYear.toString().length >= 4) {
        // Month greater than july goes to next year
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
        if (
          reversed.slice(domainLength, domainLength + 2) === reverseYearTwelve
        ) {
          return { result: true, grade: '12' };
        }
        if (
          reversed.slice(domainLength, domainLength + 2) === reverseYearEleven
        ) {
          return { result: true, grade: '11' };
        }
        if (reversed.slice(domainLength, domainLength + 2) === reverseYearTen) {
          return { result: true, grade: '10' };
        }
        if (
          reversed.slice(domainLength, domainLength + 2) === reverseYearNine
        ) {
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

// This is the number of blocks in a row in the student page.
export function getNumberOfBlocks(width: number) {
  return Math.floor(width / 190) !== 0
    ? Math.floor(width % 190 >= 0.75 ? width / 190 : (width + 190) / 190)
    : 1;
}

export async function getUsers(
  nextLink?: string,
  search?: string,
): Promise<
  | {
      result: loadingStateEnum.success;
      data: microsoftUserType[];
      nextLink?: string;
    }
  | {
      result: loadingStateEnum.failed;
    }
> {
  const filter =
    search !== '' && search !== undefined
      ? `&$search="displayName:${search}"`
      : '';
  const result = await callMsGraph(
    nextLink ||
      `https://graph.microsoft.com/v1.0/users?$top=10&$select,id,displayName&$orderby=displayName${filter}`,
    'GET',
    undefined,
    [
      {
        key: 'ConsistencyLevel',
        value: 'eventual',
      },
    ],
  );
  if (result.ok) {
    const data = await result.json();
    const newUsers: microsoftUserType[] = [];
    for (let index = 0; index < data.value.length; index += 1) {
      newUsers.push({
        id: data.value[index].id,
        displayName: data.value[index].displayName,
      });
    }
    return {
      result: loadingStateEnum.success,
      data: newUsers,
      nextLink: data['@odata.nextLink'],
    };
  }
  return {
    result: loadingStateEnum.failed,
  };
}
