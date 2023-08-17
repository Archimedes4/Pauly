import callMsGraph from "./microsoftAssets";
import { orgWideGroupID } from "../PaulyConfig";
import store from "../Redux/store";
import { paulyListSlice } from "../Redux/reducers/paulyListReducer";

export default async function getPaulyLists(authToken?: string) {
    const getRootSiteIdResult = await callMsGraph("https://graph.microsoft.com/v1.0/groups/" + orgWideGroupID + "/sites/root")
    if (getRootSiteIdResult.ok){
        const getRootSiteIdResultData = await getRootSiteIdResult.json()
        const paulyListResult = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + getRootSiteIdResultData["id"] + "/lists/PaulyList/items?expand=fields", "GET", false, undefined, undefined, authToken)
        if (paulyListResult.ok){
            const paulyListResultData = await paulyListResult.json()
            console.log(paulyListResultData)
            //TO DO make the value secure meaning that others cannot add to the pauly list
            store.dispatch(paulyListSlice.actions.setPaulyList({siteId: getRootSiteIdResultData["id"], commissionListId: paulyListResultData["value"][0]["fields"]["commissionListId"], paulyDataListId: paulyListResultData["value"][0]["fields"]["paulyDataListId"], scheduleListId: paulyListResultData["value"][0]["fields"]["scheduleListId"], sportsListId: paulyListResultData["value"][0]["fields"]["sportsListId"], sportsApprovedSubmissionsListId: paulyListResultData["value"][0]["fields"]["sportsApprovedSubmissionsListId"], sportsSubmissionsListId: paulyListResultData["value"][0]["fields"]["sportsSubmissionsListId"], timetablesListId: paulyListResultData["value"][0]["fields"]["timetablesListId"]}))
        } else {
            const paulyListResultData = await paulyListResult.json()
            console.log(paulyListResultData)
            console.log("Error")
            //TO DO THIS IS A BIG PROBLEM SHUT DOWN APP BC most of it don't work lost connection to server
        }
    } else {
        //TO DO THIS IS A BIG PROBLEM SHUT DOWN APP BC most of it don't work lost connection to server
    }
}