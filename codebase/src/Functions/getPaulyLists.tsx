import { AccountInfo, IPublicClientApplication } from "@azure/msal-browser";
import callMsGraph from "./microsoftAssets";
import { mainListID, siteID } from "../PaulyConfig";
import store from "../Redux/store";
import { paulyListSlice } from "../Redux/reducers/paulyListReducer";

export default async function getPaulyLists(accessToken: string, instance: IPublicClientApplication, accounts: AccountInfo[]) {
    const paulyListResult = await callMsGraph(accessToken, "https://graph.microsoft.com/v1.0/sites/" + siteID + "/lists/" + mainListID + "/items?expand=fields", instance, accounts)
    if (paulyListResult.ok){
        const paulyListResultData = await paulyListResult.json()
        console.log(paulyListResultData)
        store.dispatch(paulyListSlice.actions.setPaulyList({commissionListId: string, paulyDataListId: string, scheduleListId: string, sportsListId: string, sportsApprovedSubmissionsListId: string, sportsSubmissionsListId: string, timetablesListId: string}))
    } else {
        //TO DO THIS IS A BIG PROBLEM SHUT DOWN APP BC most of it don't work lost connection to server
    }
}