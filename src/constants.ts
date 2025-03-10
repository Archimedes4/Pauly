/* 
  Pauly
  Andrew Mainella
  October 3 2023
  constants.ts
  Stores all of paulys types
*/
import { DefaultTheme, configureFonts } from 'react-native-paper';
import { ColorValue, Platform, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { MD3Type, ThemeProp } from 'react-native-paper/lib/typescript/types';
import { StoreType } from './redux/store';

// From https://getbootstrap.com/docs/5.0/layout/breakpoints/
export enum breakPointMode {
  xSmall, // <576px  ->0
  small, // ≥576px  ->1
  medium, // ≥768px  ->2
  large, // ≥992px  ->3
  xLarge, // ≥1200px ->4
}

export enum loadingStateEnum {
  loading,
  success,
  failed,
  notStarted,
  cannotStart,
  notFound,
}

export enum postType {
  microsoftFile,
  youtubeVideo,
}

export enum calendarViewingMode {
  full,
  fullRemoved,
  collapsed,
  collapsedRemoved
}

export enum dataContentTypeOptions {
  video,
  image,
  pdf,
  unknown,
}

export enum taskImportanceEnum {
  low,
  normal,
  high,
}
export enum resourceResponce {
  found,
  notFound,
  failed,
}
export enum commissionTypeEnum {
  Issued,
  Location,
  Image,
  ImageLocation,
  QRCode,
}
export enum paulyEventType {
  personal,
  regular,
  schoolDay,
  schoolYear,
  studentCouncil,
}

export enum recurringType {
  daily,
  weekly,
  monthly,
  yearly,
}

export enum semesters {
  semesterOne,
  semesterTwo,
}

export enum submissionTypeEnum {
  all,
  unApproved,
  approved,
  unReviewed,
}

export enum locationStateEnum {
  success,
  permissionDenied,
  notCloseEnough,
  mockedLocation,
  notStarted,
}

export enum calendarMode {
  month,
  week,
  day,
}

export enum resourceMode {
  home,
  sports,
  schoolEvents,
  annoucments,
  fitness,
  files,
  news,
  scholarships,
}

// 0 for indiviual, 1 for home, 2 for both
export enum commissionCompetitionType {
  individual,
  homeroom,
  both,
}

declare global {
  type grade = "9"|"10"|"11"|"12"
  type animatedCheckMarkColor =
    | ColorValue
    | Animated.SharedValue<ColorValue | undefined>
    | undefined;
  type addDataType = {
    data: object;
    urlOne: string;
    urlTwo?: string;
    id: string;
  };
  type assignmentTypeQuiz = {
    id: string;
    title: string;
    description: string;
    assignmentEnum: number;
    documentRef: string;
    assignmentDuringClass: boolean;
    selectedMonth?: number;
    selectedDay?: number;
    dueDate?: Date;
  };
  type attachment = {
    webUrl: string;
    id: string;
    title: string;
    type: string;
  };
  type batchResponseType = {
    method: 'GET' | 'POST';
    id: string;
    status: number;
    headers: object | undefined;
    body: any | undefined;
  };
  type batchRequest = {
    id: string;
    method: 'GET' | 'POST';
    url: string;
  };
  type calendarCourseType = {
    name: string;
    semester: number;
    dayA: number;
    dayB: number;
    dayC: number;
    dayD: number;
    noClass: noClassType[];
    year: number;
    assignments: assignmentTypeQuiz[];
  };
  type calendarSyncState = {
    startTime: string;
    endTime: string;
    invocationId: string;
    state: string;
    stage: string;
    nextPoll: string;
  };
  type channelType = {
    id: string;
    displayName: string;
    selected: boolean;
    loading: boolean;
    error: boolean;
    description?: string;
  };
  type classType = {
    name: string;
    id: string;
    room: roomType;
    schoolYearId: string;
    semester: semesters[];
    periods: number[];
    teamLink: string;
    isHomeroom: boolean;
  };
  type commissionQRCodeTimed =
    | {
        timed: true;
        startDate: string;
        endDate: string;
      }
    | {
        timed: false;
      };
  type commissionQRCode = commissionQRCodeTimed & {
    QRCodeId: string;
    maxNumberOfClaims: number | undefined;
    active: boolean;
    itemId: string;
  };
  type commissionTypeDefault = {
    itemId: string;
    title: string;
    points: number;
    hidden: boolean;
    maxNumberOfClaims: number;
    allowMultipleSubmissions: boolean;
    submissionsCount: number;
    claimCount: number;
    reviewedCount: number;
    commissionId: string;
    competitionType: commissionCompetitionType;
    commissionImageShareId?: string;
    commissionIcon?: vectorIconType
  };
  type commissionTypeTimed =
    | {
        timed: true;
        startDate: string;
        endDate: string;
      }
    | {
        timed: false;
      };
  type commissionTypeValue =
    | {
        value: commissionTypeEnum.ImageLocation | commissionTypeEnum.Location;
        proximity: number;
        coordinateLat: number;
        coordinateLng: number;
      }
    | {
        value: commissionTypeEnum.Issued | commissionTypeEnum.Image;
      }
    | {
        value: commissionTypeEnum.QRCode;
      };
  type commissionType = commissionTypeDefault &
    commissionTypeTimed &
    commissionTypeValue & {
      postData?: {
        teamId: string;
        channelId: string;
        postId: string;
      };
    };
  type commissionApiParams = {
    nextLink?: string;
    startDate?: { date: Date; filter: 'ge' | 'le' };
    endDate?: { date: Date; filter: 'ge' | 'le' };
    claimed?: boolean;
    store: StoreType;
  };
  type dressCodeIncentiveType = {
    name: string;
    description: string;
    requirementsDescription: string;
    id: string;
  };
  type dressCodeDataType = {
    name: string;
    description: string;
    id: string;
  };
  type dayEvent = {
    event: eventType;
    horizontalOffset: number;
  };
  type dressCodeType = {
    name: string;
    id: string;
    itemId: string;
    dressCodeData: dressCodeDataType[];
    dressCodeIncentives: dressCodeIncentiveType[];
  };
  type dateProperty = {
    Date: number;
    ColorName?: string;
    SchoolDay?: string;
    Value?: number;
  };
  type eventTypeBase = {
    id: string;
    name: string;
    startTime: string;
    endTime: string; // This is held in iso format
    eventColor: string; // This is held in iso format
    allDay: boolean;
    microsoftReference?: string;
  };
  type eventTypePauly =
    | {
        paulyEventType: 'schoolDay';
        schoolDayData: schoolDayDataType;
        microsoftEvent: true;
      }
    | {
        paulyEventType: 'schoolYear';
        timetableId: string;
        microsoftEvent: true;
        paulyId: string;
      }
    | {
        paulyEventType: 'personal';
        paulyEventData?: string;
        microsoftEvent: true;
      }
    | {
        paulyEventType: 'regular';
        eventData?: {
          mandatory: boolean,
          grade: "all"|grade[]
        }
        microsoftEvent: true;
      }
    | {
        paulyEventType: 'studentCouncil';
        paulyEventData?: string;
        microsoftEvent: true;
      }
    | {
        microsoftEvent: false;
        paulyEventType: 'studentSchedule';
      };
  type eventType = eventTypeBase & eventTypePauly;
  type getSubmissionsInput =
    | {
        commissionId: string;
        submissionType: submissionTypeEnum;
      }
    | {
        url: string;
      };
  type groupType = {
    name: string;
    id: string;
  };
  type governmentRosterType = {
    name: string;
    id: string;
    imageShareId?: string;
    listItemId?: string;
    position?: string;
    playerNumber?: string;
    posts?: string[];
  };
  type headerType = {
    key: string;
    value: string;
  };
  type locationCoords = {
    latCoordinate: number;
    lngCoordinate: number;
  };
  type largeBatchInput =
    | batchRequest[][]
    | {
        firstUrl: string;
        secondUrl: string;
        array: string[];
        method: 'GET' | 'POST';
      }
    | {
        firstUrl: string;
        secondUrl: string;
        map: Map<string, unknown>;
        method: 'GET' | 'POST';
      };
  type leaderboardUserType = {
    name: string;
    points: number;
    id: string;
  };
  type monthEventType = eventType & {
    height: number | undefined;
    order: number;
  };
  type monthDataType = {
    id: string;
    showing: boolean;
    dayData: number;
    hasEvents: boolean; // weather or not there are events on the day
  };
  type monthRowType = {
    height: number;
    events: monthEventType[];
    days: monthDataType[]; // the length of this array should always be seven
  };
  type microsoftUserType = {
    id: string;
    displayName: string;
  };
  type resourceDataType = {
    teamId: string;
    conversationId: string;
    id: string; // message id
    body: string;
    html: boolean; // if false is text
    attachments?: attachment[];
  };
  type resourceFollowType = {
    teamId: string;
    channelId: string;
  };
  type roomType = {
    name: string;
    id: string;
  };
  type rosterType = {
    name: string;
    id: string;
    imageShareId?: string;
    position?: string;
    playerNumber?: string;
    posts?: string[];
  };
  type safeAreaType = {
    top: string;
    bottom: string;
    isTopTransparent: boolean;
    isBottomTransparent: boolean;
    overflowHidden: boolean;
  };
  type scholarship = {
    title: string;
    note: string;
    link: string;
    cover: string;
    id: string;
  };
  type schoolDayDataCompressedType = {
    sdId: string; // school day Id
    sId: string; // schedule Id
    dcId: string; // dress code Id
    sem: semesters; // semester
    dciId: string; // dresscode incentive Id
    syeId: string; // school year event id
  };
  type schoolDayDataType = {
    schoolDay: schoolDayType;
    schedule: scheduleType;
    dressCode: dressCodeDataType;
    semester: semesters;
    schoolYearEventId: string;
    dressCodeIncentive?: dressCodeIncentiveType;
  };
  type schoolDayType = {
    name: string;
    shorthand: string;
    id: string;
    order: number;
  };
  type submissionType = {
    userName: string;
    submissionTime: string;
    id: string;
    itemId: string;
    approved: boolean;
    reviewed: boolean;
    submissionImage?: string;
  };
  type studentInformationType = {
    listId: string;
    driveId: string;
    selected: boolean;
    createdTime: string;
  };
  type sportType = {
    name: string;
    id: string;
    svgData: string;
  };
  type sportTeamType = {
    teamName: string;
    season: number;
    teamId: string;
  };
  type schoolUserType = {
    name: string;
    id: string;
    mail: string;
    role: string;
    grade?: '9' | '10' | '11' | '12';
    student: boolean;
    imageDownloadUrl: string;
    imageState: loadingStateEnum;
    imageDataUrl?: string;
  };
  type taskType = {
    name: string;
    id: string;
    importance: taskImportanceEnum;
    status: taskStatusEnum;
    excess: boolean;
    state: loadingStateEnum;
  };
  type taskStatusEnum =
    | 'notStarted'
    | 'inProgress'
    | 'completed'
    | 'waitingOnOthers'
    | 'deferred';

  type paulyEventTypes =
    | 'schoolDay'
    | 'schoolYear'
    | 'personal'
    | 'studentCouncil'
    | 'regular';
  type newsPost = {
    title: string;
    excerpt: string;
    content: string;
    id: number;
    url: string;
  };
  type noClassType = {
    day: number;
    Month: number;
    Year: number;
  };
  type scheduleType = {
    properName: string;
    descriptiveName: string;
    periods: periodType[];
    id: string;
    color: string;
  };
  type periodType = {
    startHour: number;
    startMinute: number;
    endHour: number;
    endMinute: number;
    id: string;
  };
  type taggedResource = {
    importance: number;
    category: resourceMode;
    tagId: string;
  };
  type teamsGroupType = {
    teamName: string;
    teamId: string;
    teamDescription: string;
  };
  type timetableStringType = {
    name: string;
    id: string;
  };
  type timetableType = {
    name: string;
    id: string;
    schedules: scheduleType[];
    days: schoolDayType[];
    dressCode: dressCodeType;
  };
  type microsoftFileType = {
    name: string;
    id: string;
    lastModified: string;
    folder: boolean;
    parentDriveId: string;
    parentPath: string;
    itemGraphPath: string;
    callPath: string;
    type: string;
  };
  type mediaSubmissionType = {
    Title: string;
    user: string;
    submissionId: string;
    accepted: boolean;
    reviewed: boolean;
    selectedSportId: string;
    selectedTeamId: string;
    fileId: string;
    fileType: postType;
    itemID: string;
  };
  type paulyDataType = {
    message: string;
    animationSpeed: number;
    powerpointBlob: string;
    powerpointShare: string;
    paulyDataState: loadingStateEnum;
  };
  type paulyListType = {
    siteId: string;
    commissionListId: string;
    commissionSubmissionsListId: string;
    commissionQRCodeListId: string;
    paulyDataListId: string;
    scheduleListId: string;
    timetablesListId: string;
    dressCodeListId: string;
    roomListId: string;
    eventTypeExtensionId: string;
    eventDataExtensionId: string;
    classExtensionId: string;
    calendarSyncStateListId: string;
  };
  type paulySettingsType = {
    calendarViewingMode: calendarViewingMode
  };
  type insightResult = {
    userState: loadingStateEnum;
    trendingState: loadingStateEnum;
    userData: attachment[];
    trendingData: attachment[];
  };
  type listColumnType = {
    columnGroup: string;
    description: string;
    displayName: string;
    enforceUniqueValues: boolean;
    hidden: boolean;
    id: string;
    indexed: boolean;
    name: string;
    readOnly: boolean;
    required: boolean;
  };
  type sportPost = {
    caption: string;
    data:
      | {
          fileId: string;
          postType: postType.microsoftFile;
          fileType: dataContentTypeOptions;
        }
      | {
          fileId: string;
          postType: postType.youtubeVideo;
        };
  };
  type usePaulyApiReturn =
    | string
    | loadingStateEnum.failed
    | loadingStateEnum.loading;
  type youtubeVideoType = {
    thumbnail: string;
    title: string;
    videoId: string;
  };
  type weekDayEvent = {
    events: eventType[];
    start: string;
    end: string;
  };
}

export class Colors {
  static white = '#ffffff';

  static maroon = '#793033';

  static lightGray = '#ededed';

  static darkGray = '#444444';

  static black = '#000000';

  static danger = 'red';

  static blueGray = '#6699CC';
}

const paperFonts: Record<string, MD3Type> = {
  customVariant: {
    fontFamily: Platform.select({
      web: 'Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
      ios: 'System',
      default: 'sans-serif',
    }),
    fontWeight: 'normal',
    letterSpacing: 0.5,
    lineHeight: 22,
    fontSize: 20,
  },
  labelMedium: {
    fontFamily: Platform.select({
      web: 'Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
      ios: 'System',
      default: 'sans-serif',
    }),
    fontWeight: 'normal',
    letterSpacing: 0.5,
    lineHeight: 22,
    fontSize: 20,
  },
  labelLarge: {
    fontFamily: Platform.select({
      web: 'Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
      ios: 'System',
      default: 'sans-serif',
    }),
    fontWeight: 'normal',
    letterSpacing: 0.5,
    lineHeight: 22,
    fontSize: 20,
  },
};

// constance
export const paperTheme: ThemeProp = {
  ...DefaultTheme,
  fonts: configureFonts({ config: paperFonts }),
  roundness: 2,
  colors: {
    // Primary
    primary: Colors.darkGray, // ALL G
    primaryContainer: Colors.maroon, // Selected Am Mode
    onPrimary: Colors.black, // This is special Text
    onPrimaryContainer: Colors.black,
    inversePrimary: Colors.white,

    secondary: Colors.black,
    secondaryContainer: Colors.lightGray, // Back box of selected time or hour
    onSecondary: Colors.black, // text like if hour or minute is selected
    onSecondaryContainer: Colors.black,

    // Tertiary
    tertiary: Colors.darkGray,
    tertiaryContainer: Colors.darkGray,
    onTertiary: Colors.darkGray,

    // Background
    surface: Colors.white, // ALL G
    surfaceVariant: Colors.lightGray, // ALL G this is the circle
    onSurfaceVariant: Colors.black, // This is am pm and title text
    background: Colors.lightGray,
    onSurface: Colors.black, // This is most text
    onBackground: Colors.black,
    backdrop: 'rgba(237, 237, 237, 0.77)',

    outline: Colors.black, // ALL G
    outlineVariant: Colors.black,

    shadow: Colors.black,
    scrim: Colors.black,
  },
};

// DO NOT CHANGE SCOPES
// See README.md for more imformation about the scopes.
export const scopes = [
  'User.ReadWrite',
  'User.ReadBasic.All',
  'ChannelMessage.Read.All',
  'Channel.ReadBasic.All',
  'Calendars.ReadWrite',
  'Team.ReadBasic.All',
  'Sites.Read.All',
  'Group.ReadWrite.All',
];

export const governmentScopes = [
  ...scopes,
  'Sites.Manage.All',
  'Application.ReadWrite.All',
  'TeamMember.Read.All',
  'TeamSettings.ReadWrite.All',
];

// styles
export const styles = StyleSheet.create({
  textInputStyle: {
    marginLeft: 15,
    marginRight: 15,
    padding: 10,
    borderRadius: 30,
    borderColor: 'black',
    borderWidth: 1,
  },
  listStyle: {
    marginLeft: 15,
    marginRight: 15,
    marginTop: 20,
  },
  headerText: {
    marginLeft: 'auto',
    marginRight: 'auto',
    fontFamily: 'Comfortaa-Regular',
    marginBottom: 5,
    fontSize: 25,
  },
});
