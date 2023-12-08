/*
  Pauly
  Andrew Mainella
  21 October 2023
  See README.md for more information about the setup process and what to put in each of these values
*/
// The org wide group id is the id of a group (teams) that every user is apart of.
// This allows pauly to access calendar information that is common (an event that is set out by admin) among users.

export const orgWideGroupID: string = 'd2c0dd90-a426-4539-882c-aa87e5787a92';

export const tenantId: string = '551df04d-543a-4d61-955e-e4294c4cf950';
export const clientId: string = '08624b03-1aa6-40c4-8fb3-149c39026dff';

export const domainName: string = '@8td1tk.onmicrosoft.com';
export const paulyDomain: string =
  'https://polite-plant-0871d590f.4.azurestaticapps.net';

// DO NOT CHANGE SCOPES
// See README.md for more imformation about the scopes.
export const scopes = [
  'User.Read',
  'User.ReadBasic.All',
  'Sites.Read.All',
  'Sites.Manage.All',
  'ChannelMessage.Read.All',
  'Chat.ReadWrite',
  'Calendars.ReadWrite',
  'Team.ReadBasic.All',
  'Group.ReadWrite.All',
  'Tasks.ReadWrite',
  'Channel.ReadBasic.All',
  'Application.ReadWrite.All',
  'TeamMember.Read.All',
];

export const youtubeDataKey = 'AIzaSyCO1po5qtWDKRQ7koQd07Xo6u13Yp-hPEE';

export const youtubeUploadsId = 'UU8HbRWjbR0xjOeE6OlQ1sLA';

export const raindropToken = '8ea167d6-0792-4b10-a3a1-e8571743c3e6';
