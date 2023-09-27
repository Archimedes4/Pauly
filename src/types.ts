export enum loadingStateEnum {
  loading,
  success,
  failed,
  notStarted,
  cannotStart,
  offline
}

export enum dataContentTypeOptions {
  video,
  image,
  pdf,
  unknown
}

export enum taskImportanceEnum {
  low,
  normal,
  high
}

export enum taskStatusEnum {
  notStarted,
  inProgress,
  completed,
  waitingOnOthers,
  deferred
}

export enum resourceResponce {
  found,
  notFound,
  failed
}


export enum commissionTypeEnum {
  Issued,
  Location,
  Image,
  ImageLocation,
  QRCode
}

export enum paulyEventType {
  personal,
  regular,
  schoolDay,
  schoolYear,
  studentCouncil
}

export enum recurringType {
  daily,
  weekly,
  monthly,
  yearly
}

export enum semesters {
  semesterOne,
  semesterTwo
}

export enum submissionTypeEnum {
  all,
  unApproved,
  approved
}

export enum locationStateEnum {
  success,
  permissionDenied,
  notCloseEnough,
  mockedLocation,
  notStarted
}

declare global {
  type groupType = {
    name: string,
    id: string
  }  
  type taskType = {
    name: string
    id: string
    importance: taskImportanceEnum,
    status: taskStatusEnum,
    excess: boolean
  }
  type schoolDayDataCompressedType = {
    schoolDayId: string,
    scheduleId: string,
    dressCodeId: string,
    semester: semesters,
    dressCodeIncentiveId: string,
    schoolYearEventId: string
  }
  type schoolDayDataType = {
    schoolDay: schoolDayType,
    schedule: scheduleType,
    dressCode: dressCodeDataType,
    semester: semesters,
    dressCodeIncentive?: dressCodeIncentiveType
  }
  type channelType = {
    id: string,
    displayName: string,
    selected: boolean,
    loading: boolean,
    error: boolean,
    description?: string
  }
  type resourceDataType = {
    id: string,
    body: string
  }
  type submissionType = {
    userName: string
    submissionTime: Date
    id: string
    itemId: string
    approved: boolean
  }
  type locationCoords = {
    latCoordinate: number
    lngCoordinate: number
  }
}