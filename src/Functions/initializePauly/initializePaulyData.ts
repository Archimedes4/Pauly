export const PaulyListData = {
    "displayName": "PaulyList",
    "name":"PaulyList",
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
        "name":"StartDate",
        "text":{ },
        "required": true
      },
      {
        "name":"EndDate",
        "text":{ },
        "required": true
      },
      {
        "name":"Points",
        "number":{},
        "required": true
      },
      {
        "name":"Proximity",
        "number":{}
      },
      {
        "name":"Hidden",
        "boolean":{},
        "required": true
      },
      {
        "name":"CoordinateLat",
        "number":{}
      },
      {
        "name":"CoordinateLng",
        "number":{}
      },
      {
        "name":"CommissionID",
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
      }
    ],
    "list": {
      "template": "genericList"
    }
}