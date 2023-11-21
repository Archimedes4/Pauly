import { Context, HttpRequest } from "@azure/functions";
import callMsGraph from "./callMsGraph";

declare global {
  type listResponce = {
    siteId: string,
    commissionListId: string,
    userExtensionId: string,
    commissionSubmissionsListId: string
  }
}

export default async function getPaulyList(context: Context, req: HttpRequest, accessToken: string): Promise<listResponce | undefined> {
    //Get Site Data
    const orgWideGroupId = (req.query.orgWideGroupId || (req.body && req.body.orgWideGroupId));
    if (orgWideGroupId === undefined){context.res = {status: 400,body: "Error: orgWideGroupId needs to be supplied"}; return}
    
    const getRootSiteIdResult = await callMsGraph(accessToken, "https://graph.microsoft.com/v1.0/groups/" + orgWideGroupId + "/sites/root")
    if (!getRootSiteIdResult.ok){context.res = {status: 500,body: "Internal Error: Unable To Get Site"}; return}
    const getRootSiteIdResultData = await getRootSiteIdResult.json()

    if (getRootSiteIdResultData["id"] === undefined) {context.res = {status: 500,body: "Internal Error: Unable To Get Site"}; return}
    const paulyListResult = await callMsGraph(accessToken, "https://graph.microsoft.com/v1.0/sites/" + getRootSiteIdResultData["id"] + "/lists/PaulyList/items?expand=fields")
    const paulyListResultData = await paulyListResult.json()
    if (!paulyListResult.ok){context.res = {status: 500, body: "Internal Error: Unable To Get Ids"}; return}
    try {
      if (paulyListResultData["value"].length !== 1) {context.res = {status: 500, body: "Internal Error: Unable To Get Ids"}; return}
    } catch {
      context.res = {status: 500, body: "Internal Error: Unable To Get Ids"}; return
    }

    return {
      siteId:  getRootSiteIdResultData["id"],
      commissionListId: paulyListResultData["value"][0]["fields"]["commissionListId"],
      userExtensionId: paulyListResultData["value"][0]["fields"]["userExtensionId"],
      commissionSubmissionsListId: paulyListResultData["value"][0]["fields"]["commissionSubmissionsListId"]
    }
}