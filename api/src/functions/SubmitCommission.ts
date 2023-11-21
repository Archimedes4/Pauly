import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import validateAndGetAccessTokens from '../../CommonFunctions/validateAndGetAccessTokens';
import getPaulyList from '../../CommonFunctions/getPaulyList';
import callMsGraph from '../../CommonFunctions/callMsGraph';
import createUUID from '../../CommonFunctions/createUUID';

function isListResponse(
  response: listResponce | HttpResponseInit,
): response is listResponce {
  return (response as listResponce).siteId !== undefined;
}

export async function ClaimCommission(
  req: HttpRequest,
): Promise<HttpResponseInit> {
  try {
    const accessTokens = await validateAndGetAccessTokens(req);
    if (accessTokens == undefined) {
      return {
        status: 401,
        body: 'Unauthorized: something went wrong validating token',
      };
    }
    const paulyListResult = await getPaulyList(
      accessTokens.onBehalfOfAccessToken,
    );

    if (!isListResponse(paulyListResult)) {
      return paulyListResult;
    }

    if (paulyListResult === undefined || accessTokens === undefined) {
      return { status: 400, body: 'Bad Request' };
    }

    const requestBody = await req.json();

    const commissionId =
      req.query.get('commissionId') || requestBody["commissionId"];
    if (commissionId === undefined || commissionId === '') {
      return {
        status: 400,
        body: 'Error: The CommissionId needs to be supplied',
      };
    }
    if (typeof commissionId !== 'string') {
      return {
        status: 400,
        body: 'Error: The CommissionId needs to be a string',
      };
    }

    const commissionResult = await callMsGraph(
      accessTokens.onBehalfOfAccessToken,
      `https://graph.microsoft.com/v1.0/sites/${paulyListResult.siteId}/lists/${paulyListResult.commissionListId}/items?expand=fields&$filter=fields/commissionID%20eq%20'${commissionId}'`,
    ); // TO DO check for sql injection
    if (!commissionResult.ok) {
      return {
        status: 500,
        body: "Internal Error: Unable To Get Commission (This doesn't mean that the commission does not exist)",
      };
    }

    const commissionResultData = await commissionResult.json();
    if (commissionResultData.value.length !== 1) {
      if (commissionResultData.value.length !== 0) {
        return {
          status: 400,
          body: "Error: The CommissionId supplied doesn't have any asociated commissions attached to it",
        };
      }
      return {
        status: 500,
        body: 'Internal Error: The CommissionId supplied has mutiple commissions. Please submit a bug report',
      };
    }
    ``;
    const { maxNumberOfClaims } = commissionResultData.value[0].fields;
    const { allowMultipleSubmissions } = commissionResultData.value[0].fields;
    const { value } = commissionResultData.value[0].fields;

    // 1. Approved by issuer
    // 2. Location
    // 3. Image
    // 4. Image and Location
    // 5. QR Code
    const resultSubmissionData: any = {};
    if (value === 2 || value === 4) {
      const latCoordinate =
        req.query.get('latCoordinate') ||
        (req.body && requestBody["latCoordinate"]);
      if (latCoordinate === undefined || latCoordinate === '') {
        return {
          status: 400,
          body: 'Error: A lat coordinaten needs to be supplied',
        };
      }
      const lngCoordinate =
        req.query.get('lngCoordinate') ||
        (req.body && requestBody["lngCoordinate"]);
      if (lngCoordinate === undefined || lngCoordinate === '') {
        return {
          status: 400,
          body: 'Error: A lng coordinaten needs to be supplied',
        };
      }
      resultSubmissionData.location.lat = latCoordinate;
      resultSubmissionData.location.lng = lngCoordinate;
    }
    if (value === 3 || value === 4) {
      const imageShare: string =
        req.query.get('imageShare') || (req.body && requestBody["imageShare"]);
      if (imageShare === undefined || imageShare === '') {
        return {
          status: 400,
          body: 'Error: The ImageShare needs to be supplied',
        };
      }
      // TO DO validate share link
      resultSubmissionData.image = imageShare;
    }

    const getUserResult = await callMsGraph(
      accessTokens.onBehalfOfAccessToken,
      'https://graph.microsoft.com/v1.0/me',
    );
    if (!getUserResult.ok) {
      return { status: 500, body: 'Internal Error: Could Not Get User' };
      return;
    }
    const getUserData = await getUserResult.json();

    let nextUrl = `https://graph.microsoft.com/v1.0/sites/${paulyListResult.siteId}/lists/${paulyListResult.commissionSubmissionsListId}/items?expand=fields&$filter=fields/userId%20eq%20'${getUserData.id}'%20and%20fields/submissionApproved%20eq%20true%20and%20fields/commissionId%20eq%20'${commissionId}'`;
    let claimsCount = 0;
    let reachedMaxNumberOfClaims: boolean = false;
    while (nextUrl !== '') {
      const submissionResultClaimed = await callMsGraph(
        accessTokens.onBehalfOfAccessToken,
        nextUrl,
      );
      if (!submissionResultClaimed.ok) {
        return {
          status: 500,
          body: 'Internal Error: Could Not Get Submissions',
        };
        return;
      }
      const submissionResultClaimedData = await submissionResultClaimed.json();
      if (submissionResultClaimedData.value !== undefined) {
        claimsCount += submissionResultClaimedData.value.length;
      }
      if (claimsCount >= maxNumberOfClaims) {
        nextUrl = '';
        reachedMaxNumberOfClaims = true;
      } else if (submissionResultClaimedData['@odata.nextLink'] !== undefined) {
        nextUrl = submissionResultClaimedData['@odata.nextLink'];
      } else {
        nextUrl = '';
      }
    }

    if (reachedMaxNumberOfClaims) {
      return { status: 400, body: 'Reached max number of claims' };
      return;
    }

    const submissionResultUnClaimed = await callMsGraph(
      accessTokens.onBehalfOfAccessToken,
      `https://graph.microsoft.com/v1.0/sites/${paulyListResult.siteId}/lists/${paulyListResult.commissionSubmissionsListId}/items?expand=fields&$filter=fields/userId%20eq%20'${getUserData.id}'%20and%20fields/submissionApproved%20eq%20false%20and%20fields/commissionId%20eq%20'${commissionId}'`,
    );
    const submissionResultUnclaimedData =
      await submissionResultUnClaimed.json();
    if (!submissionResultUnClaimed.ok) {
      return { status: 500, body: 'Internal Error: Could Not Get Submissions' };
      return;
    }

    if (submissionResultUnclaimedData.value !== undefined) {
      if (submissionResultUnclaimedData.value.count >= 1) {
        if (!allowMultipleSubmissions) {
          return { status: 400, body: 'Reached max number of submissions' };
          return;
        }
      }
    }

    const submissionId = createUUID();
    const submissionData = {
      fields: {
        Title: submissionId,
        submittedTime: new Date().toISOString(),
        userId: getUserData.id,
        submissionId,
        submissionApproved: false,
        submissionReviewed: false,
        commissionId,
        submissionData: JSON.stringify(resultSubmissionData),
      },
    };
    console.log(submissionData);
    const submitResult = await callMsGraph(
      accessTokens.clientCredentialsAccessToken,
      `https://graph.microsoft.com/v1.0/sites/${paulyListResult.siteId}/lists/${paulyListResult.commissionSubmissionsListId}/items`,
      'POST',
      JSON.stringify(submissionData),
    );
    if (!submitResult.ok) {
      return {
        status: 500,
        body: 'Internal Error: Unable to create submission',
      };
      return;
    }
    console.log('submission Sent');

    return { status: 200, body: 'Ok' };
  } catch (e) {
    console.log('This is the error', e);
    return { status: 500, body: 'Something has gone wrong' };
  }
}

app.http('SubmitCommission', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  handler: ClaimCommission,
});