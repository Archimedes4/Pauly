# Pauly
Pauly is a hub for all things school-related.
# Backend
Pauly uses Microsoft graph and SharePoint lists as a database
## Structure 
### Calendar
The calendar is organized into documents of years containing collections of months. These months are formatted as a number based on January being 1. Inside each collection documents of days are inside. Each day contains the day, month, and year. As well as the school day and schedule id. If the schedule does not have a value it is schedule one (default schedule).
### Commissions
Commissions are organized into documents that are named with their commission id. In each document, there is a
1. Start date
2. End date
3. Hidden
4. Points (what the commission is worth)
5. Selected Page (which page is shown)
6. Value (the type of commission it is)
    1. Approved by issuer
    2. Location
    3. Image
    4. Image and Location
    5. QR Code
### Notifications

### Resources

### Sports

## Setup
Pauly has a config file named PaulyConfig which contains three values 
  1. tenant id
  2. Client ID (the ID of Paulys application)
  3. org id (the id of Pauly's group)

Commands to setup Azure services

https://learn.microsoft.com/en-us/cli/azure/ad/app?view=azure-cli-latest#az-ad-app-create

```
    az ad app create --display-name Pauly   
```

https://learn.microsoft.com/en-us/cli/azure/ad/signed-in-user?view=azure-cli-latest
```
    az ad signed-in-user show
```

https://learn.microsoft.com/en-us/cli/azure/ad/app/owner?view=azure-cli-latest#az-ad-app-owner-add

```
    az ad app owner add --id {app id} --owner-object-id {user id}
```

https://learn.microsoft.com/en-us/cli/azure/ad/app?view=azure-cli-latest#az-ad-app-update 
update azure ad app
```
    az rest `--method PATCH ` --uri 'https://graph.microsoft.com/v1.0/applications/{id}' `--headers 'Content-Type=application/json' ` --body "{spa:{redirectUris:['exp://172.20.10.3:8081/--/auth', 'http://localhost:19006/auth']}}"
```
### Extensions
> **NOTE**
> Extensions are automatically setup in the initialization process
```
{
    "id": "paulyEvents",
    "description": "Pauly Event Data",
    "targetTypes": [
        "Event"
    ],
    "owner": {application id},
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
```

## Format
### Colors
| name           | value     |
| -------------- | --------- |
| white          | "white"   |
| light gray     | "#ededed" |
| dark gray      | "#444444" |
| maroon         | "#793033" |
| warning orange | "#FF6700" |

### Users
| Permission                | Admin Consent Required |
| ------------------------- | ---------------------- |
| User.Read                 | NO                     |
| User.ReadBasic.All        | NO                     |
| ChannelMessage.Read.All   | YES                    |
| Channel.ReadBasic.All     | NO                     |  
| Calendars.ReadWrite       | YES                    |
| Team.ReadBasic.All        | NO                     |
| Tasks.ReadWrite           | NO                     |
| Sites.Read.All            | NO                     |
| Group.ReadWrite.All       | YES                    |

### Government
| Permission                | Admin Consent Required |
| ------------------------- | ---------------------- |
| Application.ReadWrite.All | YES                    |
| Sites.Manage.All          | YES                    |
