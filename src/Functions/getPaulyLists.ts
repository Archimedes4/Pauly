import callMsGraph from "./microsoftAssets";
import { orgWideGroupID } from "../PaulyConfig";
import store from "../Redux/store";
import { paulyListSlice } from "../Redux/reducers/paulyListReducer";

export default async function getPaulyLists(authToken?: string) {
    const getRootSiteIdResult = await callMsGraph("https://graph.microsoft.com/v1.0/groups/" + orgWideGroupID + "/sites/root")
    if (getRootSiteIdResult.ok){
        const getRootSiteIdResultData = await getRootSiteIdResult.json()
        const paulyListFindResult = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + getRootSiteIdResultData["id"] + "/lists?$filter=startswith(displayName,'PaulyList')", "GET", false, undefined, undefined, authToken)
        if (paulyListFindResult.ok){
            const paulyListFindResultData = await paulyListFindResult.json()
            const paulyListResult = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + getRootSiteIdResultData["id"] + "/lists/" + paulyListFindResultData["value"][0]["id"] + "/items?expand=fields")
            if (paulyListResult.ok){
                console.log("All systems a go")
                const paulyListResultData = await paulyListResult.json()
                console.log(paulyListResultData)
                //TO DO make the value secure meaning that others cannot add to the pauly list
                store.dispatch(paulyListSlice.actions.setPaulyList({siteId: getRootSiteIdResultData["id"], commissionListId: paulyListResultData["value"][0]["fields"]["commissionListId"], paulyDataListId: paulyListResultData["value"][0]["fields"]["paulyDataListId"], scheduleListId: paulyListResultData["value"][0]["fields"]["scheduleListId"], sportsListId: paulyListResultData["value"][0]["fields"]["sportsListId"], sportsApprovedSubmissionsListId: paulyListResultData["value"][0]["fields"]["sportsApprovedSubmissionsListId"], sportsSubmissionsListId: paulyListResultData["value"][0]["fields"]["sportsSubmissionsListId"], timetablesListId: paulyListResultData["value"][0]["fields"]["timetablesListId"]}))
            } else {
                
            }
        } else {
            const paulyListResultData = await paulyListFindResult.json()
            console.log(paulyListResultData)
            console.log("Error Thhis")
            //TO DO THIS IS A BIG PROBLEM SHUT DOWN APP BC most of it don't work lost connection to server
        }
    } else {
        //TO DO THIS IS A BIG PROBLEM SHUT DOWN APP BC most of it don't work lost connection to server
    }
}