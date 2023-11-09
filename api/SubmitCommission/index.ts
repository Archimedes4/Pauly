import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import validateAndGetAccessTokens from "../CommonFunctions/validateAndGetAccessTokens";
import getPaulyList from "../CommonFunctions/getPaulyList";
import callMsGraph from "../CommonFunctions/callMsGraph";
import create_UUID from "../CommonFunctions/create_UUID";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  try {
    const accessTokens = await validateAndGetAccessTokens(context, req)
    const paulyListResult = await getPaulyList(context, req, accessTokens.onBehalfOfAccessToken)
    if (paulyListResult === undefined || accessTokens === undefined) {return}

    const commissionId = (req.query.commissionId || (req.body && req.body.commissionId));
    if (commissionId === undefined || commissionId === "") {context.res = {status: 400, body: "Error: The CommissionId needs to be supplied"}; return}
    if (typeof commissionId !== "string") {context.res = {status: 400, body: "Error: The CommissionId needs to be a string"}; return}

    const commissionResult = await callMsGraph(accessTokens.onBehalfOfAccessToken, "https://graph.microsoft.com/v1.0/sites/" + paulyListResult.siteId + "/lists/" + paulyListResult.commissionListId + `/items?expand=fields&$filter=fields/commissionID%20eq%20'${commissionId}'`) //TO DO check for sql injection
    if (!commissionResult.ok){context.res = {status: 500, body: "Internal Error: Unable To Get Commission (This doesn't mean that the commission does not exist)"}; return}
    
    const commissionResultData = await commissionResult.json()
    if (commissionResultData["value"].length !== 1){
      if (commissionResultData["value"].length !== 0) {
        context.res = {status: 400, body: "Error: The CommissionId supplied doesn't have any asociated commissions attached to it"}; return
      } else {
        context.res = {status: 500, body: "Internal Error: The CommissionId supplied has mutiple commissions. Please submit a bug report"}; return
      }
    }
``
    const maxNumberOfClaims =  commissionResultData["value"][0]["fields"]["maxNumberOfClaims"]
    const allowMultipleSubmissions =  commissionResultData["value"][0]["fields"]["allowMultipleSubmissions"]
    const value = commissionResultData["value"][0]["fields"]["value"]
    
    // 1. Approved by issuer
    // 2. Location
    // 3. Image
    // 4. Image and Location
    // 5. QR Code
    var resultSubmissionData: any = {}
    if (value === 2 || value === 4) {
      const latCoordinate = (req.query.latCoordinate || (req.body && req.body.latCoordinate));
      if (latCoordinate === undefined || latCoordinate === "") {context.res = {status: 400, body: "Error: A lat coordinaten needs to be supplied"}; return}
      const lngCoordinate = (req.query.lngCoordinate || (req.body && req.body.lngCoordinate));
      if (lngCoordinate === undefined || lngCoordinate === "") {context.res = {status: 400, body: "Error: A lng coordinaten needs to be supplied"}; return}
      resultSubmissionData["location"]["lat"] = latCoordinate
      resultSubmissionData["location"]["lng"] = lngCoordinate
    }
    if (value === 3 || value === 4) {
      const imageShare = (req.query.imageShare || (req.body && req.body.imageShare));
      if (imageShare === undefined || imageShare === "") {context.res = {status: 400, body: "Error: The ImageShare needs to be supplied"}; return}
      //TO DO validate share link
      resultSubmissionData["image"] = imageShare
    }
    
    const getUserResult = await callMsGraph(accessTokens.onBehalfOfAccessToken, "https://graph.microsoft.com/v1.0/me")
    if (!getUserResult.ok) {context.res = {status: 500, body: "Internal Error: Could Not Get User"}; return}
    const getUserData = await getUserResult.json()

    var nextUrl =  `https://graph.microsoft.com/v1.0/sites/${paulyListResult.siteId}/lists/${paulyListResult.commissionSubmissionsListId}/items?expand=fields&$filter=fields/userId%20eq%20'${getUserData["id"]}'%20and%20fields/submissionApproved%20eq%20true%20and%20fields/commissionId%20eq%20'${commissionId}'`
    var claimsCount = 0
    var reachedMaxNumberOfClaims: boolean = false
    while (nextUrl !== ""){
      const submissionResultClaimed = await callMsGraph(accessTokens.onBehalfOfAccessToken, nextUrl)
      if (!submissionResultClaimed.ok) {context.res = {status: 500, body: "Internal Error: Could Not Get Submissions"}; return}
      const submissionResultClaimedData = await submissionResultClaimed.json()
      if (submissionResultClaimedData["value"] !== undefined){
        claimsCount += submissionResultClaimedData["value"].length
      }
      if (claimsCount >= maxNumberOfClaims) {
        nextUrl = ""
        reachedMaxNumberOfClaims = true
      } else {
        if (submissionResultClaimedData["@odata.nextLink"] !== undefined) {
          nextUrl = submissionResultClaimedData["@odata.nextLink"]
        } else {
          nextUrl = ""
        }
      }
    }

    if (reachedMaxNumberOfClaims) {context.res = {status: 400, body: "Reached max number of claims"}; return}
    
    const submissionResultUnClaimed = await callMsGraph(accessTokens.onBehalfOfAccessToken, "https://graph.microsoft.com/v1.0/sites/" + paulyListResult.siteId + `/lists/${paulyListResult.commissionSubmissionsListId}/items?expand=fields&$filter=fields/userId%20eq%20'${getUserData["id"]}'%20and%20fields/submissionApproved%20eq%20false%20and%20fields/commissionId%20eq%20'${commissionId}'` )
    const submissionResultUnclaimedData = await submissionResultUnClaimed.json()
    if (!submissionResultUnClaimed.ok) {context.res = {status: 500, body: "Internal Error: Could Not Get Submissions"}; return}

    if (submissionResultUnclaimedData["value"] !== undefined) {
      if (submissionResultUnclaimedData["value"].count >= 1) {
        if (!allowMultipleSubmissions) {context.res = {status: 400, body: "Reached max number of submissions"}; return}
      }
    }

    const submissionId = create_UUID()
    const submissionData = {
      "fields": {
        "Title":submissionId,
        "submittedTime":new Date().toISOString(),
        "userId":getUserData["id"],
        "submissionId":submissionId,
        "submissionApproved":false,
        "submissionReviewed":false,
        "commissionId":commissionId,
        "submissionData":JSON.stringify(resultSubmissionData)
      }
    }
    console.log(submissionData)
    const submitResult = await callMsGraph(accessTokens.clientCredentialsAccessToken, `https://graph.microsoft.com/v1.0/sites/${paulyListResult.siteId}/lists/${paulyListResult.commissionSubmissionsListId}/items`, "POST", JSON.stringify(submissionData))
    if (!submitResult.ok) {context.res = {status: 500, body: "Internal Error: Unable to create submission"}; return}
    console.log("submission Sent")
    
    context.res = {status: 200, body: "Ok"}; return
  } catch (e) {
    console.log("This is the error", e)
    context.res = {
      status: 500,
      body: "Something has gone wrong"
    };
  }
};

export default httpTrigger;