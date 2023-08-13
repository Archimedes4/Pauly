import { AccountInfo, IPublicClientApplication } from "@azure/msal-browser"
import { siteID } from "../PaulyConfig"
import store from "../Redux/store"
import callMsGraph from "./microsoftAssets"
import { loadingStateEnum } from "../types"

export default async function getCurrentPaulyData(accessToken: string, instance: IPublicClientApplication, accounts: AccountInfo[]): Promise<{result: loadingStateEnum, data?: {powerpointId: string, message: string, animationSpeed: number}}> {
    const result = await callMsGraph(accessToken, "https://graph.microsoft.com/v1.0/sites/" + siteID + "/lists/" + store.getState().paulyList.paulyDataListId + "/items/1/fields", instance, accounts)//TO DO fix list ids
    if (result.ok){
        const data = await result.json()
        console.log(data)
        if (data["value"][0]["fields"]["animationSpeed"] !== undefined && data["value"][0]["fields"]["message"] !== undefined && data["value"][0]["fields"]["powerpointId"] !== undefined) {
            return {result: loadingStateEnum.success, data: {powerpointId: data["value"][0]["fields"]["powerpointId"], message: data["value"][0]["fields"]["message"], animationSpeed: data["value"][0]["fields"]["animationSpeed"]}}
        } else {
            return {result: loadingStateEnum.failed}
        }
    } else {
        return {result: loadingStateEnum.failed}
    }
}