//Andrew Mainella
//Pauly
//October 3 2023
//
//types.ts
//Stores all of paulys types

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
  approved,
  unReviewed
}

export enum locationStateEnum {
  success,
  permissionDenied,
  notCloseEnough,
  mockedLocation,
  notStarted
}

export enum calendarMode {
  month,
  week,
  day
}

export enum resourceMode {
  home,
  sports,
  advancement,
  schoolEvents,
  annoucments,
  fitness,
  files
}

declare global {
  type addDataType = {
    data: object,
    urlOne: string,
    urlTwo?:string
    id: string
  }
  type assignmentTypeQuiz = {
    id: string
    title: string
    description: string
    assignmentEnum: number
    documentRef: string
    assignmentDuringClass: boolean
    selectedMonth?: number
    selectedDay?: number
    dueDate?: Date
  }
  type batchResponseType = {
    method: "GET"|"POST"
    id: string
    status: number
    headers: object | undefined
    body: object | undefined
  }
  type calendarCourseType = {
    name: String
    semester: number
    dayA: number
    dayB: number
    dayC: number
    dayD: number
    noClass: noClassType[]
    year: number
    assignments: assignmentTypeQuiz[]
  }
  type channelType = {
    id: string,
    displayName: string,
    selected: boolean,
    loading: boolean,
    error: boolean,
    description?: string
  }
  type classType = {
    name: string
    id: string
    room: roomType
    schoolYearId: string
    semester: semesters
    periods: number[]
  }
  type commissionType = {
    itemId: string
    title: string
    timed: boolean
    points: number
    hidden: boolean
    maxNumberOfClaims: number
    allowMultipleSubmissions: boolean
    submissionsCount: number
    claimCount: number
    reviewedCount: number
    commissionId: string
    value: commissionTypeEnum
    startDate?: string
    endDate?: string
    proximity?: number
    coordinateLat?: number
    coordinateLng?: number
    postData?: {
      teamId: string
      channelId: string
      postId: string
    }
  }
  type dressCodeIncentiveType = {
    name: string,
    description: string,
    requirementsDescription: string,
    id: string
  }
  type dressCodeDataType = {
    name: string,
    description: string,
    id: string
  }
  type dressCodeType = {
    name: string,
    id: string,
    dressCodeData: dressCodeDataType[],
    dressCodeIncentives: dressCodeIncentiveType[]
  }
  type dateProperty = {
    Date: number
    ColorName?: string
    SchoolDay?: string
    Value?: number
  }
  type groupType = {
    name: string,
    id: string
  }  
  type governmentRosterType = {
    name: string
    id: string
    listItemId?: string
    position?: string
    playerNumber?: string
    posts?: string[]
  }
  type locationCoords = {
    latCoordinate: number
    lngCoordinate: number
  }
  type monthDataType = {
    id: string,
    showing: boolean,
    dayData: number,
    events: eventType[]
  }
  type microsoftUserType = {
    id: string
    displayName: string
  }
  type resourceDataType = {
    teamId: string
    conversationId: string
    id: string // message id
    body: string
    html: boolean //if false is text
    attachments?: resourceType[]

  }
  type resourceFollowType = {
    teamId: string
    channelId: string
  }
  type roomType = {
    name: string,
    id: string
  }
  type rosterType = {
    name: string
    id: string
    position: string
    playerNumber?: string
    posts?: string[]
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
  type schoolDayType = {
    name: string,
    shorthand: string
    id: string,
    order: number     
  }
  type submissionType = {
    userName: string
    submissionTime: string
    id: string
    itemId: string
    approved: boolean
    reviewed: boolean
    submissionImage?: string
  }
  type sportType = {
    name: string
    id: string
  }
  type sportTeamType = {
    teamName: string
    season: number
    teamId: string
  }
  type taskType = {
    name: string
    id: string
    importance: taskImportanceEnum,
    status: taskStatusEnum,
    excess: boolean
  }
  type paulyEventTypes = "schoolDay" | "schoolYear"
  type eventType = {
    id: string
    name: string
    startTime: string
    endTime: string //This is held in iso format
    eventColor: string //This is held in iso format
    microsoftEvent: boolean,
    allDay: boolean
    paulyEventType?: paulyEventTypes
    paulyEventData?: string
    microsoftReference?: string
    schoolDayData?: {
      schoolDayData: schoolDayType,
      schedule: scheduleType,
      dressCode: dressCodeDataType,
      semester: semesters
      dressCodeIncentiveId?: string
    }
  }
  type noClassType = {
    day: number
    Month: number
    Year: number
  }
  type scheduleType = {
    properName:string
    descriptiveName: string
    periods: periodType[]
    id: string,
    color: string
  }
  type periodType = {
    startHour: number
    startMinute: number
    endHour: number
    endMinute: number
    id: string
  }
  type teamsGroupType = {
    TeamName: string
    TeamId: string
    TeamDescription: string
  }
  type timetableStringType = {
    name: string,
    id: string
  }
  type timetableType = {
    name: string,
    id: string,
    schedules: scheduleType[],
    days: schoolDayType[],
    dressCode: dressCodeType
  }
  type microsoftFileType = {
    name: string
    id: string
    lastModified: string
    folder: boolean
    parentDriveId: string
    parentPath: string
    itemGraphPath: string,
    callPath: string
  }
  type paulyDataType = {
    message: string
    animationSpeed: number
    powerpointBlob: string
    powerpointShare: string
    paulyDataState: loadingStateEnum
  }
  type paulyListType =  {
    siteId: string, 
    commissionListId: string,
    commissionSubmissionsListId: string
    paulyDataListId: string,
    scheduleListId: string,
    sportsListId: string,
    sportsApprovedSubmissionsListId: string,
    sportsSubmissionsListId: string,
    timetablesListId: string,
    resourceListId: string,
    dressCodeListId: string,
    eventTypeExtensionId: string,
    eventDataExtensionId: string,
    classExtensionId: string,
    resourceExtensionId: string,
    roomListId: string
  }
  type sportPost = {
    caption: string,
    fileID: string,
    fileType: dataContentTypeOptions
  }
  type resourceType = {
    webUrl: string,
    id: string,
    title: string,
    type: string
  }
  type insightResult = {
    userState: loadingStateEnum,
    trendingState: loadingStateEnum,
    userData: resourceType[],
    trendingData: resourceType[]
  }
  type listColumnType = {
    columnGroup: string
    description: string
    displayName: string
    enforceUniqueValues: boolean
    hidden: boolean
    id: string
    indexed: boolean
    name: string
    readOnly: boolean
    required: boolean
  }
  type mediaSubmissionType = {
    Title: string
    user: string
    submissionId: string
    accepted: boolean
    reviewed: boolean
    selectedSportId: string
    selectedTeamId: string
    fileId: string
    itemID: string
  }
}