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
import {
  loadingStateEnum,
  orgWideGroupID,
} from '../../CommonFunctions/constants';
import getClientCredential from '../../CommonFunctions/getClientCredential';

function isListResponse(
  response: listResponce | HttpResponseInit,
): response is listResponce {
  return (response as listResponce).siteId !== undefined;
}

export async function getCalendar(req: HttpRequest): Promise<HttpResponseInit> {
  try {
    const accessToken = await getClientCredential();
    if (accessToken === '') {
      return {
        status: 401,
        body: 'Unauthorized: something went wrong validating token',
      };
    }

    const paulyListResult = await getPaulyList(accessToken);
    if (!isListResponse(paulyListResult)) {
      return paulyListResult;
    }

    const calendarResult = await fetch(
      'https://outlook.office365.com/owa/calendar/5dfb514ed1aa43f690f07ea2fb13c3ba@stpauls.mb.ca/d66eed6769b94a0298b0dfa922ac9def7503571387303307179/calendar.ics',
    );
    if (!calendarResult.ok) {
      return {
        status: 500,
        body: 'Failed to fetch sync calendar.',
      };
    }

    const calendarData = await calendarResult.text();

    const events = calendarData.split('BEGIN:VEVENT');
    events.shift();
    const result = [];
    for (let index = 0; index < events.length; index += 1) {
      const eventData = events[index];
      const eventArray = eventData.split('\n');
      const resultObject = {};
      let uid = false;
      for (
        let eventIndex = 0;
        eventIndex < eventArray.length;
        eventIndex += 1
      ) {
        const eventSlice = eventArray[eventIndex].split(':');
        if (eventSlice.length == 2) {
          if (eventSlice[0] == 'SUMMARY') {
            resultObject.Name = eventSlice[1];
          } else if (eventSlice[0] === 'UID') {
            uid = true;
            resultObject.Id = eventSlice[1];
          } else if (eventSlice[0].slice(0, 7) === 'DTSTART') {
            resultObject.Start = eventSlice[1];
          } else if (eventSlice[0].slice(0, 5) === 'DTEND') {
            resultObject.End = eventSlice[1];
          }
        } else if (eventSlice.length == 1 && uid) {
          resultObject.Id += eventSlice[0];
          uid = false;
        }
      }
      result.push(resultObject);
    }

    // convert result to chunck for batch requests
    const resultChunck = [];
    for (let i = 0; i < result.length; i += 20) {
      resultChunck.push(result.slice(i, i + 20));
    }

    // Make batch requests from the chunks
    const batchRequests = [];
    for (let index = 0; index < resultChunck.length; index += 1) {
      // Prepare batch data
      const batchData = [];
      for (
        let batchIndex = 0;
        batchIndex < resultChunck[index].length;
        batchIndex += 1
      ) {
        batchData.push({
          id: batchIndex + 1,
          method: 'GET',
          url: `/groups/${orgWideGroupID}/calendar/events?$filter=singleValueExtendedProperties/Any(ep:%20ep/id%20eq%20'${paulyListResult.eventSyncIdExtensionId}'%20and%20ep/value%20eq%20'${resultChunck[index][batchIndex].uid}')`,
        });
      }
      batchRequests.push({
        requests: batchData,
      });
    }

    const batchPromises: Promise<Response>[] = [];
    for (let index = 0; index < batchRequests.length; index += 1) {
      batchPromises.push(
        fetch('https://graph.microsoft.com/v1.0/$batch', {
          method: 'POST',
          body: JSON.stringify(batchRequests[index]),
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }),
      );
    }
    const finalBatchRequests: Response[] = await Promise.all(batchPromises);
    for (let index = 0; index < finalBatchRequests.length; index += 1) {
      if (finalBatchRequests[index].ok) {
        const data = await finalBatchRequests[index].json();
        console.log(data);
      }
    }

    return { status: 200, body: 'Ok' };
  } catch (e) {
    console.log('This is the error', e);
    return { status: 500, body: 'Something has gone wrong' };
  }
}

app.http('getCalendar', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: getCalendar,
});
