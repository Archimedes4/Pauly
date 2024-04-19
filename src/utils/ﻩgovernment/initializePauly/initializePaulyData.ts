export const paulyListData = {
  displayName: 'PaulyList',
  columns: [
    {
      name: 'commissionListId',
      text: {},
      required: true,
    },
    {
      name: 'commissionSubmissionsListId',
      text: {},
      required: true,
    },
    {
      name: 'commissionQRCodeListId',
      text: {},
      required: true,
    },
    {
      name: 'paulyDataListId',
      text: {},
      required: true,
    },
    {
      name: 'scheduleListId',
      text: {},
      required: true,
    },
    {
      name: 'timetablesListId',
      text: {},
      required: true,
    },
    {
      name: 'dressCodeListId',
      text: {},
      required: true,
    },
    {
      name: 'roomListId',
      text: {},
      required: true,
    },
    {
      name: 'classExtensionId',
      text: {},
      required: true,
    },
    {
      name: 'eventTypeExtensionId',
      text: {},
      required: true,
    },
    {
      name: 'eventDataExtensionId',
      text: {},
      required: true,
    },
    {
      name: 'eventSyncIdExtensionId',
      text: {},
      required: true,
    },
    {
      name: 'eventSyncModeExtensionId',
      text: {}, // every (both time and sync), time (only syncs time), subject (only syncs subject), checkedOut (no longer tracked)
      required: true,
    },
    {
      name: 'noClassListId',
      text: {},
      required: true,
    },
    {
      name: 'calendarSyncListId',
      text: {},
      required: true,
    },
    {
      name: 'calendarSyncStateListId',
      text: {},
      required: true,
    },
  ],
  list: {
    template: 'genericList',
  },
};
export const studentFilesData = {
  displayName: 'StudentFiles',
  columns: [
    {
      name: 'createdTime',
      text: {},
    },
    {
      name: 'itemId', // This is the item id not drive item id
      text: {},
      required: true,
    },
    {
      name: 'selected',
      boolean: {},
      required: true,
      indexed: true,
    },
    {
      name: 'userId',
      text: {},
      required: true,
      indexed: true,
    },
  ],
  list: {
    template: 'genericList',
  },
};
export const commissionsData = {
  displayName: 'Commissions',
  columns: [
    {
      name: 'startDate',
      text: {},
      indexed: true,
    },
    {
      name: 'endDate',
      text: {},
      indexed: true,
    },
    {
      name: 'timed',
      boolean: {},
      required: true,
    },
    {
      name: 'points',
      number: {},
      required: true,
    },
    {
      name: 'hidden',
      boolean: {},
      required: true,
    },
    {
      name: 'maxNumberOfClaims',
      number: {},
      required: true,
    },
    {
      name: 'allowMultipleSubmissions',
      boolean: {},
      required: true,
    },
    {
      name: 'commissionId',
      text: {},
      required: true,
      indexed: true,
      enforceUniqueValues: true,
    },
    {
      name: 'value',
      number: {},
      required: true,
    },
    {
      name: 'homeValue', // 0 for indiviual, 1 for home, 2 for both
      number: {},
      required: true,
    },
    {
      name: 'coordinateLat',
      number: {},
    },
    {
      name: 'coordinateLng',
      number: {},
    },
    {
      name: 'locationVisable',
      boolean: {},
    },
    {
      name: 'proximity',
      number: {},
    },
    {
      name: 'postTeamId',
      text: {},
    },
    {
      name: 'postChannelId',
      text: {},
    },
    {
      name: 'postId',
      text: {},
    },
  ],
  list: {
    template: 'genericList',
  },
};
export const commissionsSubmissionsData = {
  displayName: 'CommissionsSubmissions',
  columns: [
    {
      name: 'userId',
      text: {},
      required: true,
      indexed: true,
    },
    {
      name: 'submittedTime',
      required: true,
      text: {},
    },
    {
      name: 'submissionId',
      text: {},
      required: true,
      indexed: true,
      enforceUniqueValues: true,
    },
    {
      name: 'submissionApproved',
      boolean: {},
      required: true,
      indexed: true,
    },
    {
      name: 'submissionReviewed',
      boolean: {},
      required: true,
      indexed: true,
    },
    {
      name: 'commissionId',
      text: {},
      required: true,
      indexed: true,
    },
    {
      name: 'homeroomId',
      text: {},
      required: true,
      indexed: true,
    },
    {
      name: 'submissionData',
      text: { allowMultipleLines: true },
    },
  ],
  list: {
    template: 'genericList',
  },
};
export const commissionsQRCodeData = {
  displayName: 'CommissionsQRCode',
  columns: [
    {
      name: 'QRCodeStart',
      text: {},
    },
    {
      name: 'QRCodeEnd',
      text: {},
    },
    {
      name: 'timed',
      boolean: {},
      required: true,
    },
    {
      name: 'maxNumberOfClaims', // undefined is infinate
      number: {},
    },
    {
      name: 'timeout', // in ms, the number of ms before can be claimed again.
      number: {},
    },
    {
      name: 'userTimeout', // in ms, the number of ms before can be claimed again by the same user.
      number: {},
    },
    {
      name: 'active',
      boolean: {},
      required: true,
    },
    {
      name: 'QRCodeId',
      text: {},
      required: true,
      indexed: true,
    },
    {
      name: 'commissionId',
      text: {},
      required: true,
      indexed: true,
    },
  ],
  list: {
    template: 'genericList',
  },
};
export const paulyDataData = {
  displayName: 'PaulyData',
  columns: [
    {
      name: 'animationSpeed',
      number: {},
      required: true,
    },
    {
      name: 'message',
      text: {},
      required: true,
    },
    {
      name: 'powerpointId',
      text: {},
      required: true,
    },
  ],
  list: {
    template: 'genericList',
  },
};
export const scheduleData = {
  displayName: 'Schedule',
  columns: [
    {
      name: 'scheduleId',
      text: {},
      required: true,
      indexed: true,
      enforceUniqueValues: true,
    },
    {
      name: 'scheduleProperName',
      text: {},
      required: true,
    },
    {
      name: 'scheduleDescriptiveName',
      text: {},
      required: true,
    },
    {
      name: 'scheduleColor',
      text: { maxLength: 9 },
      required: true,
    },
    {
      name: 'scheduleData',
      text: { allowMultipleLines: true },
      required: true,
    },
  ],
  list: {
    template: 'genericList',
  },
};
export const timetablesData = {
  displayName: 'Timetables',
  columns: [
    {
      name: 'timetableName',
      text: {},
      required: true,
    },
    {
      name: 'timetableId',
      text: {},
      required: true,
      indexed: true,
      enforceUniqueValues: true,
    },
    {
      name: 'timetableDataDays',
      text: { allowMultipleLines: true },
      required: true,
    },
    {
      name: 'timetableDataSchedules',
      text: { allowMultipleLines: true },
      required: true,
    },
    {
      name: 'timetableDefaultScheduleId',
      text: {},
      required: true,
    },
    {
      name: 'timetableDressCodeId',
      text: {},
      required: true,
    },
  ],
  list: {
    template: 'genericList',
  },
};
export const dressCodeData = {
  displayName: 'DressCode',
  columns: [
    {
      name: 'dressCodeId',
      text: {},
      required: true,
      indexed: true,
    },
    {
      name: 'dressCodeName',
      text: {},
    },
    {
      name: 'dressCodeData',
      text: { allowMultipleLines: true },
      required: true,
    },
    {
      name: 'dressCodeIncentivesData',
      text: { allowMultipleLines: true },
      required: true,
    },
  ],
  list: {
    template: 'genericList',
  },
};
export const roomData = {
  displayName: 'Rooms',
  columns: [
    {
      name: 'roomId',
      text: {},
      required: true,
      indexed: true,
    },
    {
      name: 'roomName',
      text: {},
      required: true,
    },
  ],
  list: {
    template: 'genericList',
  },
};
export const noClassData = {
  displayName: 'No Class',
  columns: [
    {
      name: 'classGroupId',
      text: {},
      required: true,
      indexed: true,
    },
    {
      name: 'classDate',
      text: {},
      required: true,
      indexed: true,
    },
  ],
  list: {
    template: 'genericList',
  },
};
export const calendarSyncData = {
  displayName: 'Calendar Sync',
  columns: [
    {
      name: 'eventId',
      text: {},
      required: true,
      indexed: true,
    },
    {
      name: 'syncId',
      text: {},
      required: true,
      indexed: true,
    },
  ],
  list: {
    template: 'genericList',
  },
};
export const calendarSyncStateData = {
  displayName: 'Calendar Sync State',
  columns: [
    {
      name: 'startTime',
      text: {},
      required: true,
    },
    {
      name: 'endTime',
      text: {},
      required: true,
    },
    {
      name: 'invocationId',
      text: {},
      required: true,
      indexed: true,
    },
    {
      name: 'state',
      text: {},
      required: true,
    },
    {
      name: 'stage',
      text: {},
      required: true,
    },
    {
      name: 'nextPoll',
      text: {},
      required: true,
    },
  ],
  list: {
    template: 'genericList',
  },
};
export const paulyTagedResourceData = {
  displayName: 'Taged Resources',
  columns: [
    {
      name: 'teamId',
      text: {},
      required: true,
      indexed: true,
    },
    {
      name: 'channelId',
      text: {},
      required: true,
      indexed: true,
    },
    {
      name: 'postId',
      text: {},
      required: true,
      indexed: true,
    },
    {
      name: 'category',
      text: {},
      required: true,
      indexed: true,
    },
    {
      name: 'importance',
      number: {},
      required: true,
      indexed: true,
    },
  ],
  list: {
    template: 'genericList',
  },
};

// Extensions
export const paulyClassExtensionData = {
  id: 'paulyClass',
  description: 'Pauly Class Data',
  targetTypes: ['Group'],
  owner: process.env.EXPO_PUBLIC_CLIENTID,
  properties: [
    {
      name: 'className', // This property will be optional in the future
      type: 'String',
    },
    {
      name: 'schoolYearEventId',
      type: 'String',
    },
    {
      name: 'semesterId',
      type: 'String',
    },
    {
      name: 'roomId',
      type: 'String',
    },
    {
      name: 'periodData',
      type: 'String', // An Array as long as the number of days in the cycle
    },
    {
      name: 'isHomeroom',
      type: 'Boolean',
    },
  ],
};

// Add data array
export const addDataArray: addDataType[] = [
  {
    data: paulyClassExtensionData,
    urlOne: 'https://graph.microsoft.com/v1.0/schemaExtensions',
    id: 'classExtensionId',
  },
  {
    data: commissionsData,
    urlOne: 'https://graph.microsoft.com/v1.0/sites/',
    urlTwo: '/lists',
    id: 'commissionListId',
  },
  {
    data: commissionsSubmissionsData,
    urlOne: 'https://graph.microsoft.com/v1.0/sites/',
    urlTwo: '/lists',
    id: 'commissionSubmissionsListId',
  },
  {
    data: commissionsQRCodeData,
    urlOne: 'https://graph.microsoft.com/v1.0/sites/',
    urlTwo: '/lists',
    id: 'commissionQRCodeListId',
  },
  {
    data: scheduleData,
    urlOne: 'https://graph.microsoft.com/v1.0/sites/',
    urlTwo: '/lists',
    id: 'scheduleListId',
  },
  {
    data: timetablesData,
    urlOne: 'https://graph.microsoft.com/v1.0/sites/',
    urlTwo: '/lists',
    id: 'timetablesListId',
  },
  {
    data: dressCodeData,
    urlOne: 'https://graph.microsoft.com/v1.0/sites/',
    urlTwo: '/lists',
    id: 'dressCodeListId',
  },
  {
    data: roomData,
    urlOne: 'https://graph.microsoft.com/v1.0/sites/',
    urlTwo: '/lists',
    id: 'roomListId',
  },
  {
    data: noClassData,
    urlOne: 'https://graph.microsoft.com/v1.0/sites/',
    urlTwo: '/lists',
    id: 'noClassListId',
  },
  {
    data: calendarSyncData,
    urlOne: 'https://graph.microsoft.com/v1.0/sites/',
    urlTwo: '/lists',
    id: 'calendarSyncListId',
  },
  {
    data: calendarSyncStateData,
    urlOne: 'https://graph.microsoft.com/v1.0/sites/',
    urlTwo: '/lists',
    id: 'calendarSyncStateListId',
  },
];

// base 64 jpeg pauly logo
export const url =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQIAHAAcAAD/4RQ0RXhpZgAASUkqAAgAAAAKAAABBAABAAAAAAQAAAEBBAABAAAAAAQAAAIBAwADAAAAhgAAABIBAwABAAAAAQAAABoBBQABAAAAjAAAABsBBQABAAAAlAAAACgBAwABAAAAAwAAADEBAgANAAAAnAAAADIBAgAUAAAAqgAAAGmHBAABAAAAvgAAANwAAAAIAAgACAAcAAAAAQAAABwAAAABAAAAR0lNUCAyLjEwLjMyAAAyMDIzOjA0OjE2IDEzOjQzOjA5AAIAAqAEAAEAAAAABAAAA6AEAAEAAAAABAAAAAAAAAkA/gAEAAEAAAABAAAAAAEEAAEAAAAAAQAAAQEEAAEAAAAAAQAAAgEDAAMAAABOAQAAAwEDAAEAAAAGAAAABgEDAAEAAAAGAAAAFQEDAAEAAAADAAAAAQIEAAEAAABUAQAAAgIEAAEAAADXEgAAAAAAAAgACAAIAP/Y/+AAEEpGSUYAAQEAAAEAAQAA/9sAQwAIBgYHBgUIBwcHCQkICgwUDQwLCwwZEhMPFB0aHx4dGhwcICQuJyAiLCMcHCg3KSwwMTQ0NB8nOT04MjwuMzQy/9sAQwEJCQkMCwwYDQ0YMiEcITIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIy/8AAEQgBAAEAAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/aAAwDAQACEQMRAD8A82ooornPdCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiimxM1zci1tIZru5bpBbxmRz+AoFKSirtjqK6rT/hh451JN66PFZofum9uApP/AAFckfjW5bfA3xVLn7Vq2kwenlpJJ/PFVyMweKpLqec0V2eufCbxhocL3MUdrq1unJFoSsoHrsbr+BJriY5FlXcueuCCMEHuCOxpOLRpTrQqfCx9FFFI0CiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKRmCqWYgAckmlrS8JweH9R8VxQeJNRhtdMt8SPHITm4cn5U4HTuaaV2Z1aipx5mdL4A+GN340jXU9TkmstEJ/dKnyy3XuD/Cnv1Ne96F4a0fw3aC10jT4LSMdfLX5m92bqT9a04Yo4YUjiRUjRQqqowAOwAp9bJWPJnOU3eQUUUUyAr5h+KOlto/xLv8wrFBqKLcwbOjHG1/ocjNfT1eJ/tBWsfl+G7wAectzJFnvtKgn+VKSujWjJxqJo8jooorA9gKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiir+gaBqfivWl0nSIwZAA09w4/d26f3m9/Qd6aVyZzUFzSM9d81zHa28MlxdSnEcEKlnc+wFesfD34SalFr1prviaC2iitx5kFlu3v5nG1nPTjnjnnFejeDfh/o3gu1Is4vOvpAPPvZhmSQ/wBB7CurrWMUjzK2IlU02QUUUVRzhXGeNPiTpXgq6trS6tru7up0MgitgpKoONxLEDrXZ15L8SvhdqXiHVLjxFpmpB7tYFRbKaP5WVcnarDoScn6mh+RUbX97YytZ/aB8q1L6T4dn3Lyz30qqAPYKSSfxrhPHHjef4ga1aXSQtb6ZZJ+5jY8vIwG5j/IfT3rnBsuYcSR98MjjoQeQfoRUoGBgVk5vY9CnhYqSkndBRRRUHWFFFFA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AADAbP/hDmdodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+Cjx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDQuNC4wLUV4aXYyIj4KIDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+CiAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIgogICAgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIKICAgIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIKICAgIHhtbG5zOkdJTVA9Imh0dHA6Ly93d3cuZ2ltcC5vcmcveG1wLyIKICAgIHhtbG5zOnRpZmY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vdGlmZi8xLjAvIgogICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIgogICB4bXBNTTpEb2N1bWVudElEPSJnaW1wOmRvY2lkOmdpbXA6Y2EzODJhMWItYzAxYi00NmM3LTk1ZGYtNDE5MWNhYWYzNjgyIgogICB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOmNiMmMyNTUxLWEzM2QtNDYwOC1hZmY1LTU4ZGY1YjlmYTg0MyIKICAgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjk4NmJjYjJhLTg3OTUtNDUyYS05NjJmLWRiNTU2MWE3ZTcwNyIKICAgZGM6Rm9ybWF0PSJpbWFnZS9wbmciCiAgIEdJTVA6QVBJPSIyLjAiCiAgIEdJTVA6UGxhdGZvcm09Ik1hYyBPUyIKICAgR0lNUDpUaW1lU3RhbXA9IjE2ODE2NzA1OTU0OTg1MTUiCiAgIEdJTVA6VmVyc2lvbj0iMi4xMC4zMiIKICAgdGlmZjpPcmllbnRhdGlvbj0iMSIKICAgeG1wOkNyZWF0b3JUb29sPSJHSU1QIDIuMTAiCiAgIHhtcDpNZXRhZGF0YURhdGU9IjIwMjM6MDQ6MTZUMTM6NDM6MDktMDU6MDAiCiAgIHhtcDpNb2RpZnlEYXRlPSIyMDIzOjA0OjE2VDEzOjQzOjA5LTA1OjAwIj4KICAgPHhtcE1NOkhpc3Rvcnk+CiAgICA8cmRmOlNlcT4KICAgICA8cmRmOmxpCiAgICAgIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiCiAgICAgIHN0RXZ0OmNoYW5nZWQ9Ii8iCiAgICAgIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6MWI2NmU3ZDktOTMzYy00YTA1LWExN2UtZDBkMmY2ZmQxNTY5IgogICAgICBzdEV2dDpzb2Z0d2FyZUFnZW50PSJHaW1wIDIuMTAgKE1hYyBPUykiCiAgICAgIHN0RXZ0OndoZW49IjIwMjMtMDQtMTZUMTM6Mjc6MTEtMDU6MDAiLz4KICAgICA8cmRmOmxpCiAgICAgIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiCiAgICAgIHN0RXZ0OmNoYW5nZWQ9Ii8iCiAgICAgIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6NTliM2ZjNzEtOWRjYi00ZjRkLTk3MjQtNTEwNDRjMjlkNjQ2IgogICAgICBzdEV2dDpzb2Z0d2FyZUFnZW50PSJHaW1wIDIuMTAgKE1hYyBPUykiCiAgICAgIHN0RXZ0OndoZW49IjIwMjMtMDQtMTZUMTM6NDM6MTUtMDU6MDAiLz4KICAgIDwvcmRmOlNlcT4KICAgPC94bXBNTTpIaXN0b3J5PgogIDwvcmRmOkRlc2NyaXB0aW9uPgogPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg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';
