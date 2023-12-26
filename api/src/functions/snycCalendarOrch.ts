import { app, HttpHandler, HttpRequest, HttpResponse, HttpResponseInit, InvocationContext } from '@azure/functions';
import * as df from 'durable-functions';
import { ActivityHandler, OrchestrationContext, OrchestrationHandler, Task } from 'durable-functions';
import getPaulyList from '../../CommonFunctions/getPaulyList';
import getClientCredential from '../../CommonFunctions/getClientCredential';
import { orgWideGroupID } from '../../CommonFunctions/constants';
import convertICSToString from '../../calendarSync/convertICSToString';
import { chunkArrayInGroups } from '../../CommonFunctions/utility';
import { validateToken } from '../../CommonFunctions/validateAndGetAccessTokens';

type FunctionError = {
  status: number,
  message: string
}

type updateCalendarRootProps = {
  accessToken: string;
  paulyListResult: listResponce;
  chunck: updateCalendarProps[]
}

type syncCalendarResponce = {
  found: boolean;
  iCalendar: iCalendarData;
  eventId?: string;
} | "failed"

type updateCalendarProps = {
  iCalendar: iCalendarData;
  eventId: string;
}

type reportActivityParams = {
  accessToken: string;
  paulyListResult: listResponce;
  state: "running" | "success" | "failed"
  invocationId: string
}

declare global {
  type iCalendarData = {
    Id: string;
    Name: string;
    Start: string;
    End: string;
  }
  type snycCalendarParams = {
    accessToken: string;
    paulyListResult: listResponce;
    chunck: iCalendarData[]
  }
}

const getList: ActivityHandler = async (accessToken: string): Promise<listResponce | string> => {
  function isListResponse(
    response: listResponce | HttpResponseInit,
  ): response is listResponce {
    return (response as listResponce).siteId !== undefined;
  }
  
  const paulyListResult = await getPaulyList(
    accessToken,
  );
  if (!isListResponse(paulyListResult)) {
    return "Error"
  }
  return paulyListResult
}
df.app.activity('getList', { handler: getList });

const getCalendar: ActivityHandler = async function () {
  try {
    const calendarResult = await fetch('https://outlook.office365.com/owa/calendar/5dfb514ed1aa43f690f07ea2fb13c3ba@stpauls.mb.ca/d66eed6769b94a0298b0dfa922ac9def7503571387303307179/calendar.ics')
    if (!calendarResult.ok) {
      return 'Failed to fetch sync calendar.'
    }
    const calendarData = await calendarResult.text()
    
    let events = calendarData.split("BEGIN:VEVENT")
    events.shift();
    let result = []
    for (let index = 0; index < events.length; index += 1) {
      const eventData = events[index]
      const eventArray = eventData.split("\n")
      let resultObject = {}
      let uid = false
      for (let eventIndex = 0; eventIndex < eventArray.length; eventIndex += 1) {
        const eventSlice = eventArray[eventIndex].split(":");
        if (eventSlice.length == 2) {
          if (eventSlice[0] == 'SUMMARY') {
            resultObject["Name"] = eventSlice[1].replace("\r", "")
          } else if (eventSlice[0] === 'UID') {
            uid = true
            resultObject["Id"] = eventSlice[1].replace("\r", "")
          } else if (eventSlice[0].slice(0, 7) === 'DTSTART') {
            resultObject["Start"] = eventSlice[1].replace("\r", "")
          } else if (eventSlice[0].slice(0, 5) === 'DTEND') {
            resultObject["End"] = eventSlice[1].replace("\r", "")
          }
        } else if (eventSlice.length == 1 && uid) {
          resultObject["Id"] += eventSlice[0].replace("\r", "")
          uid = false
        }
      }
      result.push(resultObject)
    }

    //convert result to chunck for batch requests
    let resultChunck = []
    for (let i = 0; i < result.length; i += 20) {
      resultChunck.push(result.slice(i, i + 20))
    }

    return resultChunck;
  } catch (e) {
    return "error";
  }
}
df.app.activity('getCalendar', { handler: getCalendar });

//This updates the calendar of results that already exists
const snycCalendar: ActivityHandler = async (args: snycCalendarParams): Promise<string | syncCalendarResponce[]> => {
  const { chunck, paulyListResult, accessToken } = args;
  //Make batch requests from the chunks
  let batchData = []
  for (let batchIndex = 0; batchIndex < chunck.length; batchIndex += 1) {
    batchData.push({
      "id":chunck[batchIndex].Id, //batchIndex + 1
      "method":"GET",
      "url":`/sites/${paulyListResult.siteId}/lists/${paulyListResult.calendarSyncListId}/items?$expand=fields&$filter=fields/syncId%20eq%20'${chunck[batchIndex].Id}'`,
    })
  }

  const batchBody = {
    "requests": batchData
  }

  const result = await fetch('https://graph.microsoft.com/v1.0/$batch', {
    method: 'POST',
    body: JSON.stringify(batchBody),
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`
    }
  })
  if (result.ok) {
    const data = await result.json();
    const resultData: syncCalendarResponce[] = []
    for (let resIndex = 0; resIndex < data["responses"].length; resIndex += 1) {
      //TODO mark stue ok not just status 200
      if (data["responses"][resIndex]["status"] === 200) {
        if (data["responses"][resIndex]["body"]["value"].length === 0){
          //No event exists
          const calendar = chunck.find((e) => {return e.Id === data["responses"][resIndex]["id"]})
          if (calendar !== undefined) {
            resultData.push({
              found: false,
              iCalendar: calendar,
            })
          } else {
            return  "failed"
          }
        } else {
          //event exists need to check that data is accurate
          const calendar = chunck.find((e) => {return e.Id === data["responses"][resIndex]["id"]})
          if (calendar !== undefined) {
            resultData.push({
              found: true,
              iCalendar: calendar,
              eventId: data["responses"][resIndex]["body"]["value"][0]["id"]
            })
          } else {
            return  "failed"
          }
        }
      } else {
        return  "failed"
      }
    }
    return resultData;
  }
  return  "failed"
};
df.app.activity("sync", { handler: snycCalendar });


const updateEvents: ActivityHandler = async (args: updateCalendarRootProps) => {
  const { chunck, paulyListResult, accessToken } = args;
  //Make batch requests from the chunks
  let batchData = []
  for (let batchIndex = 0; batchIndex < chunck.length; batchIndex += 1) {
    batchData.push({
      "id":chunck[batchIndex].iCalendar, //batchIndex + 1
      "method":"GET",
      "url":`/groups/${orgWideGroupID}/calendar/events'`
    })
  }

  const batchBody = {
    "requests": batchData
  }

  const result = await fetch('https://graph.microsoft.com/v1.0/$batch', {
    method: 'POST',
    body: JSON.stringify(batchBody),
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`
    }
  })
  return "ok"
}
df.app.activity("updateEvents", { handler: updateEvents });

const reportActivity: ActivityHandler = async (args: reportActivityParams) => {
  const { state, paulyListResult, accessToken, invocationId } = args;
  const result = await fetch(`https://graph.microsoft.com/v1.0/sites/${paulyListResult.siteId}/lists/${paulyListResult.calendarSyncStateListId}/items?$expand=fields&$filter=fields/invocationId%20eq%20'${invocationId}'`,{
    headers: {
      "Authorization": `Bearer ${accessToken}`
    }
  });
  if (result.ok) {
    const data = await result.json();
    if (data["value"].length === 1) {
      const resultOne = await fetch(`https://graph.microsoft.com/v1.0/sites/${paulyListResult.siteId}/lists/${paulyListResult.calendarSyncStateListId}/items/${data["values"][0]["id"]}`,{
        method: "PATCH",
        body: JSON.stringify({
          "fields": {
            "endTime":(state !== "running") ?  new Date().toISOString():state,
            "state":state
          }
        }),
        headers: {
          "Authorization": `Bearer ${accessToken}`
        }
      });
    } else {
      await fetch(`https://graph.microsoft.com/v1.0/sites/${paulyListResult.siteId}/lists/${paulyListResult.calendarSyncStateListId}/items`,{
        method: "POST",
        body: JSON.stringify({
          "fields": {
            "startTime":new Date().toISOString(),
            "endTime":(state !== "running") ?  new Date().toISOString():state,
            "invocationId":invocationId,
            "state":state
          }
        }),
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      });
    }
  }
  return
}
df.app.activity("reportActivity", {handler: reportActivity})

const snycCalendarOrchOrchestrator: OrchestrationHandler = function* (context: OrchestrationContext) {
  const accessToken = context.df.getInput()
  if (accessToken !== "" && typeof accessToken === "string") {
    const list: listResponce | "Error" = yield context.df.callActivity('getList', accessToken);
    if (list !== "Error") {
      context.log("list two")
      context.df.setCustomStatus("Running");
      //Report activity
      yield context.df.callActivity('reportActivity', {
        accessToken: accessToken,
        paulyListResult: list,
        state: "running",
        invocationId: context.invocationId
      });
      const calendar: iCalendarData[][] = yield context.df.callActivity('getCalendar');
      const calls = [];
      for (const calendarArray of calendar) {
        const syncData: snycCalendarParams = {
          accessToken: accessToken,
          paulyListResult: list,
          chunck: calendarArray
        }
        calls.push(context.df.callActivity('sync', syncData));
      }
      context.log("LINE 285")
      const results: syncCalendarResponce[][] = yield context.df.Task.all(calls);
      const eventsToCreate: iCalendarData[] = []
      const eventsToCheck: updateCalendarProps[] = []
      for (let index = 0; index < results.length; index += 1) {
        for (let innerIndex = 0; innerIndex < results[index].length; innerIndex += 1) {
          const eventData = results[index][innerIndex]
          if (eventData !== "failed") {
            if (eventData.found) {
              //Checking and updating event
              if (eventData.eventId !== undefined) {
                eventsToCheck.push({
                  iCalendar: eventData.iCalendar,
                  eventId: eventData.eventId
                })
              }
            } else {
              //Create new event
              eventsToCreate.push(eventData.iCalendar)
            }
          } else {
            //report error
            yield context.df.callActivity('reportActivity', {
              accessToken: accessToken,
              paulyListResult: list,
              state: "failed",
              invocationId: context.invocationId
            });
            return "Failed"
          }
        }
      }
      const updateCalls: Task[] = []
      //Make create calls
      const eventsToCreateChunks: iCalendarData[][] = chunkArrayInGroups(eventsToCreate, 20);
      const eventsToCheckChunks: updateCalendarProps[][] = chunkArrayInGroups(eventsToCheck, 20);
      context.log("LINE 430")
      for (let index = 0; index < eventsToCreateChunks.length; index += 1) {
        const params: snycCalendarParams = {
          accessToken: accessToken,
          paulyListResult: list,
          chunck: eventsToCreateChunks[index]
        }
        updateCalls.push(context.df.callSubOrchestrator("createEventsSync", params ));
      }
      context.log("LINE 439 LENGTH:" + eventsToCheckChunks.length)
      
      //Make update calls
      for (let index = 0; index < eventsToCheckChunks.length; index += 1) {
        const params: updateCalendarRootProps = {
          accessToken: accessToken,
          paulyListResult: list,
          chunck: eventsToCheckChunks[index]
        }
        updateCalls.push(context.df.callActivity('updateEvents', params));
      }

      context.log("LINE 451")

      //Wait for calls to complete
      const updateCallsResults: string[] = yield context.df.Task.all(updateCalls);

      context.log("LINE 456")
      //Check if anything failed
      for (let index = 0; index < updateCallsResults.length; index += 1) {
        if (updateCallsResults[index] !== "ok") {
          context.log("FAILED LINE 351")
          yield context.df.callActivity('reportActivity', {
            accessToken: accessToken,
            paulyListResult: list,
            state: "failed",
            invocationId: context.invocationId
          });
          context.df.setCustomStatus("Failed");
          return "Failed"
        }
      }
      context.log("PAST");
      //Report Status
      yield context.df.callActivity('reportActivity', {
        accessToken: accessToken,
        paulyListResult: list,
        state: "success",
        invocationId: context.invocationId
      });
      context.df.setCustomStatus("Success");
    } else {
      yield context.df.callActivity('reportActivity', {
        accessToken: accessToken,
        paulyListResult: list,
        state: "failed",
        invocationId: context.invocationId
      });
      context.df.setCustomStatus("Failed");
      return "Failed"
    }
  } else {
    context.df.setCustomStatus("Failed");
    return "Failed"
  }
  context.df.setCustomStatus("Failed");
  return "Failed"
};
df.app.orchestration('snycCalendarOrchOrchestrator', snycCalendarOrchOrchestrator);

//Heading start
const snycCalendarOrchHttpStart: HttpHandler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponse> => {
  try {
    const token = await validateToken(request);
    const authPostData = `&grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&client_id=${process.env.CLIENTID}&client_secret=${process.env.CLIENTSECRET}&assertion=${token}&scope=https%3A%2F%2Fgraph.microsoft.com%2F.default&requested_token_use=on_behalf_of`;
    const authResult = await fetch(
      `https://login.microsoftonline.com/${process.env.TENANTID}/oauth2/v2.0/token`,
      {
        method: 'POST',
        body: authPostData,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      },
    );
    if (!authResult.ok) {
      return;
    }
    const authResultData = await authResult.json();
    const client = df.getClient(context);
    const instanceId: string = await client.startNew(request.params.orchestratorName, { input: authResultData.access_token });
  
    context.log(`Started orchestration with ID = '${instanceId}'.`);
  
    return client.createCheckStatusResponse(request, instanceId);
  } catch (e) {
    return
  }
};

//app.timer

app.http('snycCalendarOrchHttpStart', {
  route: 'orchestrators/{orchestratorName}',
  extraInputs: [df.input.durableClient()],
  handler: snycCalendarOrchHttpStart,
});
