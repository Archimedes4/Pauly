//The org wide group id is the id of a group (teams) that every user is apart of.
//This allows pauly to access calendar information that is common (an event that is set out by admin) among users.

export const orgWideGroupID: string = "cb666a12-455f-40a4-ba2e-cec2155b1b1c";

export const tenantId: string = "8ca607b2-50f9-456f-97ef-fde0d5fbdb62";
export const clientId: string = "6f1e349a-7320-4452-9f32-7e6633fe465b";

//DO NOT CHANGE SCOPES
//See README.md for more imformation about the scopes.
export const scopes = ["User.Read", "User.ReadBasic.All", "Sites.Read.All", "Sites.Manage.All", "ChannelMessage.Read.All", "Chat.ReadWrite", "Calendars.ReadWrite", "Team.ReadBasic.All", "Group.ReadWrite.All", "Tasks.ReadWrite", "Channel.ReadBasic.All", "Application.ReadWrite.All", "TeamMember.Read.All"];