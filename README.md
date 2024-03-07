# <img src="./assets/images/PaulyLogo.png" height="28px" alt="logo"/> Pauly
READ ME Last updated March 5 2023 \
Pauly is a hub for all things school-related. \
Build by Andrew Mainella \
Saint Paul's High School Student Council 2023-2024

> [!IMPORTANT]
> Functions repo can be found at https://github.com/Archimedes4/Pauly-Functions

## Table of Contents
* [General Reference](#general-reference)
* [Functions](#functions)
* [About the app](#about-the-app)
* [Dependencies](#dependencies)
* [Setup and mantiance](#setup)

# General Reference

## Technologies
Power by expo using expo router at its core. Application also uses redux for storage.

## Backend
Pauly uses Microsoft graph and SharePoint lists as a database.

## Endpoints

Microsoft Graph Permissions see [Permissions](#graph-permissions)

> [!NOTE]
> If an endpoint appears both in regular and government mode. It will only be under the regular mode unless the methods are different. Different methods appear in government

|Endpoint|Methods|Referenece|
|--------|------|----------|
|/me|Get|https://learn.microsoft.com/en-us/graph/api/user-get?view=graph-rest-1.0&tabs=http|
|/me/photo/$value|GET|https://learn.microsoft.com/en-us/graph/api/profilephoto-get?view=graph-rest-1.0&tabs=http
|/me/joinedTeams | GET | https://learn.microsoft.com/en-us/graph/api/user-list-joinedteams?view=graph-rest-1.0&tabs=http |
|/me/calendarView | GET | https://learn.microsoft.com/en-us/graph/api/user-list-calendarview?view=graph-rest-1.0&tabs=http
|/me/insights/used | GET | https://learn.microsoft.com/en-us/graph/api/insights-list-used?view=graph-rest-1.0&tabs=http
|/me/insights/trending | GET |https://learn.microsoft.com/en-us/graph/api/insights-list-trending?view=graph-rest-1.0&tabs=http
|/sites/{siteId}/lists/{listId}/items | GET | https://learn.microsoft.com/en-us/graph/api/listitem-list?view=graph-rest-1.0&tabs=http
|/users/{userId}/photos/$value | GET | https://learn.microsoft.com/en-us/graph/api/profilephoto-get?view=graph-rest-1.0&tabs=http |
|/$batch | POST | https://learn.microsoft.com/en-us/graph/json-batching |
|/groups/{groupId} | GET | https://learn.microsoft.com/en-us/graph/api/group-get?view=graph-rest-1.0&tabs=http |
|/groups/{groupId}/calendar/events | GET | https://learn.microsoft.com/en-us/graph/api/calendar-list-events?view=graph-rest-1.0&tabs=http |
|/shares/{shareLink}/driveItem | GET | https://learn.microsoft.com/en-us/graph/api/shares-get?view=graph-rest-1.0&tabs=http |
|/search/query | POST | https://learn.microsoft.com/en-us/graph/api/search-query?view=graph-rest-1.0&tabs=http
|/teams/{teamId}/channels/{channelId}/messages/{messageId} | GET | https://learn.microsoft.com/en-us/graph/api/chatmessage-get?view=graph-rest-1.0&tabs=http |
|/teams/{teamId}/channels/{channelId}/filesFolder | GET | https://learn.microsoft.com/en-us/graph/api/channel-get-filesfolder?view=graph-rest-1.0&tabs=http |
| /drives/{driveId}/items/{itemId} | GET | https://learn.microsoft.com/en-us/graph/api/driveitem-get?view=graph-rest-1.0&tabs=http |

Government
|Endpoint|Methods|Referenece|
|--------|------|----------|
|/sites/{siteId}/lists|POST|https://learn.microsoft.com/en-us/graph/api/list-create?view=graph-rest-1.0&tabs=http
|/sites/{siteId}/lists/{listId}/items|POST, DELETE|https://learn.microsoft.com/en-us/graph/api/listitem-create?view=graph-rest-1.0&tabs=http|
|/sites/{siteId}/lists/{listId}/items/{itemId}/fields |PATCH|
|/sites/{siteId}/lists/{listId}/columns/{columnId} | PATCH, GET |https://learn.microsoft.com/en-us/graph/api/columndefinition-get?view=graph-rest-1.0&tabs=http |
|/groups | GET, POST| https://learn.microsoft.com/en-us/graph/api/group-post-groups?view=graph-rest-1.0&tabs=http
|/groups/{groupId} | DELETE | https://learn.microsoft.com/en-us/graph/api/group-delete?view=graph-rest-1.0&tabs=http
|/groups/{groupId}/calendar/events | DELETE, POST | https://learn.microsoft.com/en-us/graph/api/group-post-events?view=graph-rest-1.0&tabs=http |
|/groups/{groupId}/calendar/events/{eventId} | PATCH | https://learn.microsoft.com/en-us/graph/api/group-update-event?view=graph-rest-1.0&tabs=http |
|/schemaExtensions | GET | https://learn.microsoft.com/en-us/graph/extensibility-schema-groups?tabs=http
|/teams/{teamId} | GET | https://learn.microsoft.com/en-us/graph/api/team-get?view=graph-rest-1.0&tabs=http
|/teams/{teamId}/members | GET | https://learn.microsoft.com/en-us/graph/api/team-get?view=graph-rest-1.0&tabs=http
|/teams/{teamId}/allChannels | GET | https://learn.microsoft.com/en-us/graph/api/team-get?view=graph-rest-1.0&tabs=http
| /drives/{driveId}/items/{itemId}/createLink | POST| https://learn.microsoft.com/en-us/graph/api/driveitem-createlink?view=graph-rest-1.0&tabs=http |
| /me/drive/root/children | GET | https://learn.microsoft.com/en-us/graph/api/driveitem-list-children?view=graph-rest-1.0&tabs=http |
|/teams/{teamId}/channels/{channelId}/messages|GET|https://learn.microsoft.com/en-us/graph/api/channel-list-messages?view=graph-rest-1.0&tabs=http |


Youtube Iframe and data

|Endpoint|Methods|Referenece|
|--------|------|----------|
|https://www.googleapis.com/youtube/v3/playlistItems | GET |https://developers.google.com/youtube/v3/docs/playlistItems/list|
| https://www.youtube.com/iframe_api | GET | https://developers.google.com/youtube/iframe_api_reference |

Randrop api
|Endpoint|Methods|Referenece|
|--------|------|----------|
|https://api.raindrop.io/rest/v1/raindrops|GET|https://developer.raindrop.io/|

Pauly Functions
[See in functions](#functions)

## File Structure

> [!IMPORTANT]
> The public folder needs pdfjs to run and the code in components -> pdf -> index.web needs to be updated.

- tests: Holds tests
- assets: Holds images and fonts
- public: Holds manifest, well-known and pdfjs to remove a need for a cdn.
- src: holds apps code
  - app: file structure for expo router
  - components: rendered functions that aren;t a page.
  - hooks: hooks
  - redux: storage reducers and actions
  - utils: functions that aren't rendered
  - constants: holds types, colors, and some constants
- rest: config files env files readme

## Env

## Oddities
Some things were needed in order to get things working without errors. Here is a list of them please check that these patches are actually needed.

1. React Native Reanimated
Expo is compatable with React Native Reanimated 3.3. 

Error: requestAnimationFrame is not defined

Issue: https://github.com/expo/router/issues/718
Patch: https://gist.github.com/javascripter/4e4e20e9024a33592437648b718c763d

2. Expo Fonts
Expo fonts and React Native Paper aren't playing nice. Taking over the 3 second threshold to load.


Issue: https://github.com/expo/expo/issues/12382
Patch: Inside Issue very simple chaning the timout

## Graph Permissions
> **Reference**
> https://learn.microsoft.com/en-us/graph/permissions-reference

> **Why Consent Is Needed**
> https://learn.microsoft.com/en-us/graph/api/resources/consentrequests-overview?view=graph-rest-1.0

All permissions are Delegated permissions
### Regular Users Permissions
| Permission                | Admin Consent Required | Description |
| ------------------------- | ---------------------- | ----------- |
| User.Read                 | NO                     | Allows users to sign-in to the app, and allows the app to read the profile of signed-in users. It also allows the app to read basic company information of signed-in users. |
| User.ReadBasic.All        | NO                     | Allows the app to read a basic set of profile properties of other users in your organization on behalf of the signed-in user. This includes display name, first and last name, email address, open extensions and photo. Also allows the app to read the full profile of the signed-in user. |
| ChannelMessage.Read.All   | YES                    | Allows an app to read a channel's messages in Microsoft Teams, on behalf of the signed-in user. |
| Channel.ReadBasic.All     | NO                     | Read channel names and channel descriptions, on behalf of the signed-in user. |
| Calendars.ReadWrite       | YES                    | Allows the app to create, read, update, and delete events in user calendars. |
| Team.ReadBasic.All        | NO                     | Read the names and descriptions of teams, on behalf of the signed-in user. |
| Tasks.ReadWrite           | NO                     | Allows the app to create, read, update, and delete the signed-in user's tasks and task lists, including any shared with the user. |
| Sites.Read.All            | NO                     | Allows the app to read documents and list items in all site collections on behalf of the signed-in user. |
| Group.ReadWrite.All       | YES                    | Allows the app to create groups and read all group properties and memberships on behalf of the signed-in user. Also allows the app to read and write calendar, conversations, files, and other group content for all groups the signed-in user can access. Additionally allows group owners to manage their groups and allows group members to update group content. |

### Government Permissions
This also has the regular permissions these are just extra.
| Permission                | Admin Consent Required | Description |
| ------------------------- | ---------------------- | ----------- |
| Application.ReadWrite.All | YES                    | Allows the app to create, read, update and delete applications and service principals on behalf of the signed-in user. |
| Sites.Manage.All          | YES                    | Allows the app to manage and create lists, documents, and list items in all site collections on behalf of the signed-in user. |
| TeamMember.Read.All       | YES                    | Read the members of teams, on behalf of the signed-in user. |
| TeamSettings.ReadWrite.All| YES                    | Read and change all teams' settings, on behalf of the signed-in user. |


# Functions
SubmitCommission - Used to generate a valid commission submission. Because users cannot write to Pauly the function firsts validates the commissions submission and adds data like the date. Doing all this with the users credentials. Then users an application adds the submission.

SyncCalendarOrchestator - A durable function composed of activities that sync a iCalendar with Paulys Calendar. The function is mostly idempotent and uses apis that have the same output no matter when called.

Known limitations: 
1. For loops, find and some are used throught the code. Therefore, if many thousands of events were to be tracked the function would fail. 
2. As for being idempotent, if the function was called many times at once and had to create events, the function would create multiple events. This is because the function looks for events that exist and then creates them, but all the orchestrates would have calculated that an event needs to be created and therefore would create events. As long as the orcestrator is not spammed and called many times while other orcestrations are running it will work. It also does not matter when azure decideds to run the function, if the function is run well after it is called it still works. The only limitation in that regard is the token expiering and therefore, the function would fail and could be run again without issue.

# About the app 
## Calendar
The calendar is organized into documents of years containing collections of months. These months are formatted as a number based on January being 1. Inside each collection documents of days are inside. Each day contains the day, month, and year. As well as the school day and schedule id. If the schedule does not have a value it is schedule one (default schedule).
## Commissions
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

## Dashboard
The notifcations page has a board, a message, insigts (used and trending) and tasks. The tasks are from microsoft graph using the todo api. The insights are from microsoft graph the.

Refrences \
TODO: https://learn.microsoft.com/en-us/graph/api/resources/todo-overview?view=graph-rest-1.0 \
Insights (used, trending): https://learn.microsoft.com/en-us/graph/api/resources/officegraphinsights?view=graph-rest-1.0 \
Board: https://learn.microsoft.com/en-us/graph/api/driveitem-get-content-format?view=graph-rest-1.0&tabs=http

## Resources
The resource page takes teams posts and displays them. It has access to files and sections. Resource has a news section powered by the wordpress api. Resources has a scholarship database powered by the raindrop api.

## Sports
This is the sports page that shows sport highlights and has team rosters. The sports page has embeded youtube videos from the Saint Paul's High School youtube page. It also as videos and images uploaded through government.

## Colors
| Name           | Value     |
| -------------- | --------- |
| white          | `#ffffff` |
| light gray     | `#ededed` |
| dark gray      | `#444444` |
| maroon         | `#793033` |
| warning orange | `#FF6700` |
| blue gray      | `#6699CC` |
## Extensions
> **NOTE**
> Extensions are automatically setup in the initialization process
```
{
  id: 'paulyClass',
  description: 'Pauly Class Data',
  targetTypes: ['Group'],
  owner: CLIENT_ID,
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
      name: 'homeroom',
      type: 'Boolean'
    }
  ],
}
```

# Dependencies
| Dependency                | Main Version | Reason |
| ------------------------- | ---------------------- | ----------- |
| @azure/msal-browser | 2 | Core auth api for web |
| @azure/msal-react | 1 | Core auth api for web |
| @expo/config-plugins | 7 |  |
| @react-google-maps/api | 2 | |
| @react-native-async-storage/async-storage | 1 |
| @react-native-community/datetimepicker | 7 |
| @react-native-community/slider | 4 |
| @reduxjs/toolkit | 1 |
| @types/node" | 20 |
| @types/pdfjs-dist | 2 |
| @types/react | 18 |
| expo | sdk 50 | Core api |
| expo-auth-session | 5 | Core auth api for native |
| expo-av | 13 |
| expo-build-properties | 0 |
| expo-clipboard | 5 |
| expo-constants | 15 |
| expo-crypto | 12 |
| expo-dev-client | 3 | Dev cliant for testing without the use of expo go |
| expo-font | 11 | Used to load fonts into the application |
| expo-image | 1 |
| expo-image-picker | 14 |
| expo-linking | 6 |
| expo-location | 16 | Used to get location in commissions |
| expo-network | 5 | Used to make such connection is avaliable |
| expo-print | 12 | Used in commissions to print QR code |
| expo-router | 3 | Holds navigations and linking for the project |
| expo-splash-screen | 0.26 |
| expo-status-bar | 1 |
| expo-web-browser | 12 |
| geolib | 3 | used to calculated distance in commission |
| metro | 0 | 
| patch-package | 8 | Used to fix some of the intricisies with the packages the reasons for which are documenent in the oddities section |
| pdfjs-dist | 3 | 
| postinstall-postinstall | 2 |
| react | 18 | Core api for the project |
| react-art | 18 |
| react-dom | 18 | A peer dependancy for expo router |
| react-native | 73 | Core api for the project |
| react-native-gesture-handler | 2 | gesuture handler used as a peer depency and in places such as home view. |
| react-native-maps | 1 | Used in government commission comonent for native apps |
| react-native-paper | 5 | Needed for react-native-paper-dates |
| react-native-paper-dates | 0 | Main components used to set time. |
| react-native-qrcode-svg | 6 |
| react-native-reanimated | 3 |
| react-native-safe-area-context | 4 |
| react-native-screens | 3 |
| react-native-svg | 14 | used for svgs, svgs can be found in [src -> components -> icons](/src/components/Icons/index.tsx) |
| react-native-vector-icons | 10 |
| react-native-webview | 13 |
| react-quill | 2 |
| react-redux | 8 | Core store api |
| react-refresh | 0
| react-router-native | 6 |
| react-test-renderer | 18 |
| reanimated-color-picker | 3 | Used in schedules to pick the schedule color |
| redux | 4 |
| typescript | 5 |

# Setup
How to setup Pauly
### Step #1

Commands to setup Azure services

```
  az login
```

https://learn.microsoft.com/en-us/cli/azure/ad/app?view=azure-cli-latest#az-ad-app-create \
Save appId for use later
```
  az ad app create --display-name Pauly   
```

https://learn.microsoft.com/en-us/cli/azure/ad/signed-in-user?view=azure-cli-latest \
Save userId for use later
```
  az ad signed-in-user show
```

https://learn.microsoft.com/en-us/cli/azure/ad/app/owner?view=azure-cli-latest#az-ad-app-owner-add
```
  az ad app owner add --id {appId} --owner-object-id {userId}
```

https://learn.microsoft.com/en-us/cli/azure/ad/app?view=azure-cli-latest#az-ad-app-update \
update azure ad app
```
  az rest --method patch --uri 'https://graph.microsoft.com/v1.0/applications/{id}' --headers 'Content-Type=application/json' --body "{"spa":{"redirectUris":["http://localhost:19006/auth","https://paulysphs.ca","https://www.paulysphs.ca"]},"publicClientApplication":{"redirectUris":["com.Archimedes4.Pauly://auth"]},"signInAudience":"AzureADMyOrg","api":{"oauth2PermissionScopes":[{"adminConsentDescription":"All the scopes required to claim commissions in Pauly. This is to access the main function of the commissions api.","adminConsentDisplayName":"claim commission","id":"c62762bd-6568-4f5f-b9d5-eb0eae3882cf","isEnabled":true,"type":"User","userConsentDescription":null,"userConsentDisplayName":null,"value":"commissions"}]}}"
```

#### Create Static Web App

https://learn.microsoft.com/en-us/azure/static-web-apps/get-started-cli?tabs=vanilla-javascript \
Note: The resource group that you use will be tied to the web app. Some other resource group can be used but this method is preferable.
##### Create Resouce Group
```
  az group create \
  --name Pauly-SWA \
  --location "eastus2"
```
##### Create static web app
```
  az staticwebapp create \
    --name Pauly-Static-Web-App \
    --resource-group Pauly-SWA \
    --source https://github.com/AMCanada16/Pauly.git \
    --location "eastus2" \
    --branch master \
    --app-location "/web-build" \
    --output-location "build" \
    --login-with-github
```

#### Create Azure Functions App and deploy functions
##### Create Function app and storage account
https://learn.microsoft.com/en-us/cli/azure/storage/account?view=azure-cli-latest#az-storage-account-create
```
  az storage account create --name paulystorage --resource-group Pauly-SWA
```

##### Create function app
https://learn.microsoft.com/en-us/cli/azure/functionapp?view=azure-cli-latest#az-functionapp-create
```
  az functionapp create --name Pauly-Functions --resource-group Pauly-SWA --storage-account paulystorage  --consumption-plan-location eastus2 --runtime node --functions-version 4
```
##### Allow cors for function app
https://learn.microsoft.com/en-us/cli/azure/functionapp/cors?view=azure-cli-latest \
Note: http://localhost:19006 is for development purposes and can be removed.
```
  az functionapp cors add -g Pauly-SWA -n Pauly-Functions --allowed-origins https://www.paulysphs.ca https://paulysphs.ca http://localhost:19006
```

##### Set Environment Variables
https://learn.microsoft.com/en-us/cli/azure/functionapp/config/appsettings?view=azure-cli-latest#az-functionapp-config-appsettings-set \
Replace the values in the command. To get the tenant id, client id and client secret go to portal.azure.com. \
-Microsoft Entra Id -> App Registrations -> Pauly \
Then copy the client Id and Tenant Id
![portal image](./documentation/READMEImages/PortalOverview.png)
Then navigate to Certificates & Secrets. Click "New Client Secret" the set the description to "Pauly Functions" or whatever. Press add and copy the newly created client secret and add it to this function.
![client secret](./documentation/READMEImages/PortalCert.png)
```
  az functionapp config appsettings set --name Pauly-Functions --resource-group Pauly-SWA --settings "CLIENTID={ClientId goes here (remove brakets)} TENANTID={TenantId goes here} CLIENTSECRET={client secret goes here}"
```

#### Attach to github workflow
https://learn.microsoft.com/en-us/cli/azure/functionapp/deployment/github-actions?view=azure-cli-latest

```
  az functionapp deployment github-actions add --resource-group Pauly-SWA --repo "https://github.com/AMCanada16/Pauly" --name Pauly-Functions --login-with-github --build-path "/api"
```

### Step #2
Login into pauly in government mode. Than go to governent -> graph -> groups. Look for Pauly, click on it can copy id. This is the org id for the group.
Pauly has a config file named PaulyConfig which contains three values these values need to be apart of the main config file inorder for Pauly to work.
  1. tenant id
  2. Client ID (the ID of Paulys application)
  3. org id (the id of Pauly's group)

### Step #3 Initilize Pauly
Go to the admin panel and initilize pauly. Code will break if Pauly is already initilized. If hard reseting Pauly delete Pauly group and Pauly extensions. This can all be done in the graph section of Government.
![Graph Permissions](./documentation/ReamMeImages/GraphPermissions.png)

### Step # 4 Give function permissions
Give the application the Sties.Selected permission. \

#### Give the Sites.Selected permission
Go to Azure then -> Microsoft Entra Id -> App Registrations -> Pauly -> Api Permissions \
looks like: \
![add site](./documentation/READMEImages/PickAddPerm.png)

Follow the images to add the permission.

![pick ms graph](./documentation/READMEImages/PickMsGraph.png)
![pick application](./documentation/READMEImages/PickApplicationPerm.png)
![pick site](./documentation/READMEImages/PickSitePerm.png)

#### Give the permission for Pauly's Site
go to https://developer.microsoft.com/en-us/graph/graph-explorer

get the site id
```
  https://graph.microsoft.com/v1.0/groups/{orgId}/sites/root?$select=id
```
Give the permission Sites.FullControl.All to ms graph. Do not consent on behalf of organization. \
set the method to POST and the url to
```
  https://graph.microsoft.com/v1.0/sites/{siteId}/permissions
```
body
```
{
    "roles": [
        "write"
    ],
    "grantedToIdentities": [
        {
            "application": {
                "id": clientId,
                "displayName": "Pauly"
            }
        }
    ]
}
```
![site permission image](./documentation/READMEImages/GraphSitePerms.png)

### Maintenance
Rotating client secrets after 160 days. Follow the steps in Set Environment Variables no need to change teant id and client id.
