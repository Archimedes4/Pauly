import { clientId } from "../../PaulyConfig"

export const paulyListData = {
  "displayName": "PaulyList",
  // "name":"PaulyList",
  "columns": [
    {
      "name":"commissionListId",
      "text":{},
      "required": true
    },
    {
      "name":"commissionSubmissionsListId",
      "text":{},
      "required": true
    },
    {
      "name":"paulyDataListId",
      "text":{},
      "required": true
    },
    {
      "name":"scheduleListId",
      "text":{},
      "required": true
    },
    {
      "name":"sportsListId",
      "text":{},
      "required": true
    },
    {
      "name":"sportsApprovedSubmissionsListId",
      "text":{},
      "required": true
    },
    {
      "name":"sportsSubmissionsListId",
      "text":{},
      "required": true
    },
    {
      "name":"timetablesListId",
      "text":{},
      "required": true
    },
    {
      "name":"resourceListId",
      "text":{},
      "required":true
    },
    {
      "name":"dressCodeListId",
      "text":{},
      "required":true
    },
    {
      "name":"roomListId",
      "text":{},
      "required":true
    },
    {
      "name":"classExtensionId",
      "text":{},
      "required": true
    },
    {
      "name":"eventTypeExtensionId",
      "text":{},
      "required": true
    },
    {
      "name":"eventDataExtensionId",
      "text":{},
      "required": true
    },
    {
      "name":"resourceExtensionId",
      "text":{},
      "required": true
    },
    {
      "name":"userExtensionId",
      "text":{},
      "required": true
    }
  ],
  "list": {
    "template": "genericList"
  }
}
export const commissionsData = {
  "displayName": "Commissions",
  "columns": [
    {
      "name":"startDate",
      "text":{ }
    },
    {
      "name":"endDate",
      "text":{ }
    },
    {
      "name":"timed",
      "boolean":{},
      "required":true
    },
    {
      "name":"points",
      "number":{},
      "required": true
    },
    {
      "name":"hidden",
      "boolean":{},
      "required": true
    },
    {
      "name":"maxNumberOfClaims",
      "number":{},
      "required": true
    },
    {
      "name":"allowMultipleSubmissions",
      "boolean":{},
      "required": true
    },
    {
      "name":"commissionID",
      "text":{ },
      "required": true,
      "indexed": true,
      "enforceUniqueValues": true
    },
    {
      "name":"value",
      "number": {},
      "required":true
    },
    {
      "name":"coordinateLat",
      "number":{}
    },
    {
      "name":"coordinateLng",
      "number":{}
    },
    {
      "name":"proximity",
      "number":{}
    },
    {
      "name":"qrCodeData",
      "text":{"allowMultipleLines": true}
    }
  ],
  "list": {
    "template": "genericList"
  }
}
export const commissionsSubmissionsData = {
  "displayName": "CommissionsSubmissions",
  "columns": [
    {
      "name":"userId",
      "text":{ },
      "required": true,
      "indexed": true,
      "enforceUniqueValues": true
    },
    {
      "name":"claimedCommissions",
      "required": true,
      "text":{"allowMultipleLines": true}
    }
  ],
  "list": {
    "template": "genericList"
  }
}
export const paulyDataData = {
  "displayName": "PaulyData",
  "columns": [
    {
        "name":"animationSpeed",
        "number":{ },
        "required": true
    },
    {
        "name":"message",
        "text":{ },
        "required": true
    },
    {
        "name":"powerpointId",
        "text":{ },
        "required": true
    }
  ],
  "list": {
    "template": "genericList"
  }
}
export const scheduleData = {
  "displayName": "Schedule",
  "columns": [
    {
      "name":"scheduleId",
      "text":{ },
      "required": true,
      "indexed": true,
      "enforceUniqueValues": true
    },
    {
      "name":"scheduleProperName",
      "text":{ },
      "required": true
    },
    {
      "name":"scheduleDescriptiveName",
      "text":{ },
      "required": true
    },
    {
      "name":"scheduleData",
      "text":{"allowMultipleLines": true},
      "required": true
    }
  ],
  "list": {
    "template": "genericList"
  }
}
export const sportsData = {
  "displayName": "Sports",
  "columns": [
    {
      "name":"sportName",
      "text":{ },
      "required": true
    },
    {
      "name":"sportId",
      "text":{ },
      "required": true,
      "indexed": true,
      "enforceUniqueValues": true
    },
  ],
  "list": {
    "template": "genericList"
  }
}
export const sportsApprovedSubmissionsData = {
  "displayName": "SportsApprovedSubmissions",
  "columns": [
    {
      "name":"FileId",
      "text":{ },
      "required": true,
      "indexed": true,
      "enforceUniqueValues": true
    },
    {
      "name":"Caption",
      "text":{ },
      "required": true
    },
  ],
  "list": {
    "template": "genericList"
  }
}
export const sportsSubmissionsData = {
  "displayName": "SportsSubmissions",
  "columns": [
    {
      "name":"Accepted",
      "boolean":{ },
      "required": true
    },
    {
      "name":"User",
      "text":{ },
      "required": true
    },
    {
      "name":"TimeCreated",
      "text":{ },
      "required": true
    },
    {
      "name":"SubmissionID",
      "text":{ },
      "required": true,
      "indexed": true,
      "enforceUniqueValues": true
    },
    {
      "name":"FileId",
      "text":{ },
      "required": true
    },
  ],
  "list": {
    "template": "genericList"
  }
}
export const timetablesData = {
  "displayName": "Timetables",
  "columns": [
    {
      "name":"timetableName",
      "text":{ },
      "required": true
    },
    {
      "name":"timetableId",
      "text":{ },
      "required": true,
      "indexed": true,
      "enforceUniqueValues": true
    },
    {
      "name":"timetableDataDays",
      "text":{"allowMultipleLines": true},
      "required": true
    },
    {
      "name":"timetableDataSchedules",
      "text":{"allowMultipleLines": true},
      "required": true
    },
    {
      "name":"timetableDefaultScheduleId",
      "text":{ },
      "required": true
    },
    {
      "name":"timetableDressCodeId",
      "text":{ },
      "required": true
    }
  ],
  "list": {
    "template": "genericList"
  }
}
export const resourceData = {
  "displayName": "Resources",
  "columns": [
    {
      "name":"resourceGroupId",
      "text":{ },
      "required": true,
      "indexed": true
    },
    {
      "name":"resourceConversationId",
      "text":{ },
      "required": true,
      "indexed": true
    }
  ],
  "list": {
    "template": "genericList"
  }
}
export const dressCodeData = {
  "displayName": "DressCode",
  "columns": [
    {
      "name":"dressCodeId",
      "text":{ },
      "required": true,
      "indexed": true
    },
    {
      "name":"dressCodeName",
      "text":{ }
    },
    {
      "name":"dressCodeData",
      "text":{"allowMultipleLines": true},
      "required": true
    },
    {
      "name":"dressCodeIncentivesData",
      "text":{"allowMultipleLines": true},
      "required":true
    }
  ],
  "list": {
    "template": "genericList"
  }
}
export const roomData = {
  "displayName": "Rooms",
  "columns": [
    {
      "name":"roomId",
      "text":{ },
      "required": true,
      "indexed": true
    },
    {
      "name":"roomName",
      "text":{ },
      "required": true
    }
  ],
  "list": {
    "template": "genericList"
  }
}

//Extensions
export const paulyClassExtensionData = {
  "id":"paulyClass",
  "description":"Pauly Class Data",
  "targetTypes": [
    "Group"
  ],
  "owner":clientId,
  "properties": [
    {
      "name":"className",//This property will be optional in the future
      "type":"String"
    },
    {
      "name":"teacherId",//TO DO This property will be removed in the future when class data added
      "type":"String"
    },
    {
      "name":"schoolYearEventId",
      "type":"String"
    },
    {
      "name":"semesterId",
      "type":"String"
    },
    {
      "name":"roomId",
      "type":"String"
    },
    {
      "name":"periodData",
      "type":"String" //An Array as long as the number of days in the cycle
    }
  ]
}

export const paulyResourceExtensionData = {
  "id":"paulyResource",
  "description":"Pauly Resource Data",
  "targetTypes": [
    "post"
  ],
  "owner":clientId,
  "properties": [
    {
      "name":"type",
      "type":"String"
    }
  ]
}

export const paulyUserExtensionData = {
  "id":"paulyUser",
  "description":"Pauly User Data. Holds Commissions",
  "targetTypes": [
    "user"
  ],
  "owner":clientId,
  "properties": [
    {
      "name":"commissionData",
      "type":"String"
    }
  ]
}

declare global {
  type addDataType = {
    data: object,
    urlOne: string,
    urlTwo?:string
    id: string
  }
}

//Add data array
export const addDataArray: addDataType[] = [
  {
    data: paulyClassExtensionData,
    urlOne: "https://graph.microsoft.com/v1.0/schemaExtensions",
    id: "classExtensionId"
  },
  {
    data: paulyResourceExtensionData,
    urlOne: "https://graph.microsoft.com/v1.0/schemaExtensions",
    id: "resourceExtensionId"
  },
  {
    data: paulyUserExtensionData,
    urlOne: "https://graph.microsoft.com/v1.0/schemaExtensions",
    id: "userExtensionId"
  },
  {
    data: commissionsData,
    urlOne: "https://graph.microsoft.com/v1.0/sites/",
    urlTwo:  "/lists",
    id: "commissionListId"
  },
  {
    data: commissionsSubmissionsData,
    urlOne: "https://graph.microsoft.com/v1.0/sites/",
    urlTwo:  "/lists",
    id: "commissionSubmissionsListId"
  },
  {
    data: scheduleData,
    urlOne: "https://graph.microsoft.com/v1.0/sites/",
    urlTwo:  "/lists",
    id: "scheduleListId"
  },
  {
    data: sportsData,
    urlOne: "https://graph.microsoft.com/v1.0/sites/",
    urlTwo:  "/lists",
    id: "sportsListId"
  },
  {
    data: sportsApprovedSubmissionsData,
    urlOne: "https://graph.microsoft.com/v1.0/sites/",
    urlTwo:  "/lists",
    id: "sportsApprovedSubmissionsListId"
  },
  {
    data: sportsSubmissionsData,
    urlOne: "https://graph.microsoft.com/v1.0/sites/",
    urlTwo:  "/lists",
    id: "sportsSubmissionsListId"
  },
  {
    data: timetablesData,
    urlOne: "https://graph.microsoft.com/v1.0/sites/",
    urlTwo:  "/lists",
    id: "timetablesListId"
  },
  {
    data: resourceData,
    urlOne: "https://graph.microsoft.com/v1.0/sites/",
    urlTwo:  "/lists",
    id: "resourceListId"
  },
  {
    data: dressCodeData,
    urlOne: "https://graph.microsoft.com/v1.0/sites/",
    urlTwo:  "/lists",
    id: "dressCodeListId"
  },
  {
    data: roomData,
    urlOne: "https://graph.microsoft.com/v1.0/sites/",
    urlTwo:  "/lists",
    id: "roomListId"
  }
]