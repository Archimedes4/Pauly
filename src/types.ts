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

declare global {
  type taskType = {
    name: string
    id: string
    importance: taskImportanceEnum,
    status: taskStatusEnum
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
}