import callMsGraph from "./microsoftAssets";
import { orgWideGroupID } from "../../PaulyConfig";
import store from "../../Redux/store";
import { paulyListSlice } from "../../Redux/reducers/paulyListReducer";

export default async function getPaulyLists() {
  const getRootSiteIdResult = await callMsGraph(`https://graph.microsoft.com/v1.0/groups/${orgWideGroupID}/sites/root?$select=id`, 'GET')
  if (getRootSiteIdResult.ok){
    const getRootSiteIdResultData = await getRootSiteIdResult.json()
    const paulyListResult = await callMsGraph(`https://graph.microsoft.com/v1.0/sites/${getRootSiteIdResultData["id"]}/lists/PaulyList/items?expand=fields&$select=id`, "GET")
    if (paulyListResult.ok){
      const paulyListResultData = await paulyListResult.json()
      //TO DO make the value secure meaning that others cannot add to the pauly list
      //store.dispatch(paulyListSlice.actions.setPaulyList({siteId: getRootSiteIdResultData["id"], commissionListId: paulyListResultData["fields"]["commissionListId"], paulyDataListId: paulyListResultData["fields"]["paulyDataListId"], scheduleListId: paulyListResultData["fields"]["scheduleListId"], sportsListId: paulyListResultData["fields"]["sportsListId"], sportsApprovedSubmissionsListId: paulyListResultData["fields"]["sportsApprovedSubmissionsListId"], sportsSubmissionsListId: paulyListResultData["fields"]["sportsSubmissionsListId"], timetablesListId: paulyListResultData["fields"]["timetablesListId"]}))
      store.dispatch(paulyListSlice.actions.setPaulyList({siteId: getRootSiteIdResultData["id"], studentFilesListId: paulyListResultData['value'][0]['fields']['studentFilesListId'], commissionListId: paulyListResultData["value"][0]["fields"]["commissionListId"], commissionSubmissionsListId: paulyListResultData["value"][0]["fields"]["commissionSubmissionsListId"], paulyDataListId: paulyListResultData["value"][0]["fields"]["paulyDataListId"], scheduleListId: paulyListResultData["value"][0]["fields"]["scheduleListId"], sportsListId: paulyListResultData["value"][0]["fields"]["sportsListId"], sportsApprovedSubmissionsListId: paulyListResultData["value"][0]["fields"]["sportsApprovedSubmissionsListId"], sportsSubmissionsListId: paulyListResultData["value"][0]["fields"]["sportsSubmissionsListId"], timetablesListId: paulyListResultData["value"][0]["fields"]["timetablesListId"], resourceListId: paulyListResultData["value"][0]["fields"]["resourceListId"], dressCodeListId: paulyListResultData["value"][0]["fields"]["dressCodeListId"], eventTypeExtensionId: paulyListResultData["value"][0]["fields"]["eventTypeExtensionId"], eventDataExtensionId: paulyListResultData["value"][0]["fields"]["eventDataExtensionId"], classExtensionId: paulyListResultData["value"][0]["fields"]["classExtensionId"], resourceExtensionId: paulyListResultData["value"][0]["fields"]["resourceExtensionId"], roomListId: paulyListResultData["value"][0]["fields"]["roomListId"]}))
    } else {
      const paulyListResultData = await paulyListResult.json()
      //TO DO THIS IS A BIG PROBLEM SHUT DOWN APP BC most of it don't work lost connection to server
    }
  } else {
    const getRootSiteIdResultData = await getRootSiteIdResult.json()
    //TO DO THIS IS A BIG PROBLEM SHUT DOWN APP BC most of it don't work lost connection to server
  }
}