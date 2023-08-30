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
      "name":"classExtensionId",
      "text":{},
      "required": true
    },
    {
      "name":"eventExtensionId",
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
      "text":{ },
      "required": true
    },
    {
      "name":"endDate",
      "text":{ },
      "required": true
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
      "name":"SportsName",
      "text":{ },
      "required": true
    },
    {
      "name":"SportsID",
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
      "name":"dressCodeData",
      "text":{"allowMultipleLines": true},
      "required": true
    },
    {
      "name":"dressCodeIncentives",
      "text":{"allowMultipleLines": true},
      "required":true
    }
  ],
  "list": {
    "template": "genericList"
  }
}

//Extensions
export const paulyEventExtentionData = {
  "id": "paulyEvents",
  "description": "Pauly Event Data",
  "targetTypes": [
    "Event"
  ],
  "owner": clientId,
  "properties": [
    {
      "name": "eventType",
      "type": "String"
    },
    {
      "name": "eventData",
      "type": "String"
    }
  ]
}

export const paulyClassExtentionData = {
  "id":"paulyClass",
  "description":"Pauly Class Data",
  "targetTypes": [
    "Group"
  ],
  "owner":clientId,
  "properties": [
    {
      "name":"className",
      "type":"String"
    },
    {
      "name":"teacherId",
      "type":"String"
    },
    {
      "name":"schoolYearEventId",
      "type":"String"
    },
    {
      "name":"periodData",
      "type":"String" //An Array as long as the number of days in the cycle
    }
  ]
}

export const paulyResourceExtentionData = {
  "id":"paulyResource",
  "description":"Pauly Resource Data",
  "targetTypes": [
    "Post"
  ],
  "owner":clientId,
  "properties": [
    {
      "name":"type",
      "type":"String"
    }
  ]
}