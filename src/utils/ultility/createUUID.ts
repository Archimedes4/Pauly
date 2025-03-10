import { loadingStateEnum } from '@constants';

export default function createUUID() {
  let dt = new Date().getTime();
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
    /[xy]/g,
    function (c) {
      const r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16);
    },
  );
  return uuid;
}

/**
 *  Get text from a loadingStateEnum
 * @param state The state to check
 * @param labels The different labels to return. If none provided generic label will be returned
 * @returns
 */
export function getTextState(
  state: loadingStateEnum,
  labels?: {
    cannotStart?: string;
    notStarted?: string;
    failed?: string;
    loading?: string;
    offline?: string;
    success?: string;
  },
): string {
  if (state === loadingStateEnum.cannotStart) {
    return labels?.cannotStart ? labels.cannotStart : 'Cannot Start';
  }
  if (state === loadingStateEnum.notStarted) {
    return labels?.notStarted ? labels.notStarted : 'Start';
  }
  if (state === loadingStateEnum.failed) {
    return labels?.failed ? labels.failed : 'Failed';
  }
  if (state === loadingStateEnum.loading) {
    return labels?.loading ? labels.loading : 'Loading';
  }
  if (state === loadingStateEnum.success) {
    return labels?.success ? labels.success : 'Success';
  }
  return 'Something Went Wrong';
}
