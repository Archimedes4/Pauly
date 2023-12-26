import * as df from 'durable-functions';
import convertICSToString from '../../calendarSync/convertICSToString';
import { ActivityHandler, OrchestrationContext, OrchestrationHandler } from 'durable-functions';

type timedItem = {
  iCal: iCalendarData,
  retry: string
}

type calListItem = {
  iCalId: string,
  eventId: string
}

type createParams = {
  accessToken: string;
  chunck: iCalendarData[]
}

type createResult = {
  result: "failed",
  created?: undefined,
  timed?: undefined
} | {
  result: "success",
  created: calListItem[],
  timed: timedItem[]
}

type reportParams = {
  accessToken: string;
  siteId: string;
  calendarSyncListId: string;
  results: calListItem[]
}

const createEventsSync: ActivityHandler = async (args: createParams): Promise<createResult> => {
  const { chunck, accessToken } = args;
  
  //Make batch requests from the chunks
  let batchData = []
  for (let batchIndex = 0; batchIndex < chunck.length; batchIndex += 1) {
    batchData.push({
      "id":chunck[batchIndex].Id, //batchIndex + 1
      "method":"POST",
      "url":`/groups/${process.env.ORGWIDEGROUPID}/calendar/events`,
      "body": {
        "subject":chunck[batchIndex].Name,
        "start": {
          dateTime: convertICSToString(chunck[batchIndex].Start),
          timezone: "Central America Standard Time"
        },
        "end": {
          dateTime: convertICSToString(chunck[batchIndex].End),
          timezone: "Central America Standard Time"
        }
      },
      "headers": {
        "Content-Type": "application/json"
      }
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
    const data = await result.json()
    const results: calListItem[] = []
    let timedResults: timedItem[] = []
    for (let index = 0; index < data["responses"].length; index += 1) {
      if (data["responses"][index]["status"] === 201) {
        results.push({
          iCalId: data["responses"][index]["id"],
          eventId: data["responses"][index]["body"]["id"]
        })
      } else if (data["responses"][index]["status"] === 429) {
        //This should always find a result
        timedResults.push({
          iCal: chunck.find((e) => {return e.Id === data["responses"][index]["id"]}),
          retry: data["responses"][index]["headers"]["Retry-After"]
        })
      } else {
        return {
          result: 'failed'
        }
      }
    }
    return {
      result: 'success',
      timed: timedResults,
      created: results
    }
  }
  return {
    result: 'failed'
  }
}
df.app.activity("addCreateEvent", { handler: createEventsSync });

const reportCreateEvents: ActivityHandler = async (args: reportParams) => {
  let listBatchData = []
  for (let batchIndex = 0; batchIndex < args.results.length; batchIndex += 1) {
    listBatchData.push({
      "id":args.results[batchIndex].iCalId, //batchIndex + 1
      "method":"POST",
      "url":`/sites/${args.siteId}/lists/${args.calendarSyncListId}/items`,
      "body": {
        "fields":{
          "eventId":args.results[batchIndex].eventId,
          "syncId":args.results[batchIndex].iCalId
        }
      },
      "headers": {
        "Content-Type": "application/json"
      }
    })
  }
  const listBatchBody = {
    "requests": listBatchData
  }
  const listResult = await fetch('https://graph.microsoft.com/v1.0/$batch', {
    method: 'POST',
    body: JSON.stringify(listBatchBody),
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": `Bearer ${args.accessToken}`
    }
  })
  if (listResult.ok) {
    const listData = await listResult.json();
    for (let listIndex = 0; listIndex < listData["responses"].length; listIndex += 1) {
      if (listData["responses"][listIndex]["status"] !== 201) {
        return "failed MARK THREE"
      }
    }
    return "ok"
  }
  return "failed MARK FOUR"
}
df.app.activity("reportCreateEvents", {handler: reportCreateEvents});

const createEventsSyncOrchOrchestrator: OrchestrationHandler = function* (context: OrchestrationContext) {
  const input: snycCalendarParams = context.df.getInput();
  let timed: iCalendarData[] = []
  let results: calListItem[] = []
  let calls: number = 0;
  while ((calls === 0 || timed.length !== 0) && calls <= 3) {
    const createProps: createParams = {
      accessToken: input.accessToken,
      chunck: (calls === 0) ? input.chunck:[...timed]
    }
    const createResult: createResult = yield context.df.callActivity("addCreateEvent", createProps);
    calls++
    if (createResult.result === "success") {
      results = [...results, ...createResult.created];
      timed = []
      let longestWait = 0;
      for (let index = 0; index < createResult.timed.length; index += 1) {
        timed.push(createResult.timed[index].iCal)
        try {
          const wait = parseInt(createResult.timed[index].retry)
          if (wait > longestWait) {
            longestWait = wait;
          }
        } catch {

        }
      }
      const deadline = new Date().getTime() + (longestWait * 60);
      const deadlineDate = new Date(deadline);
      yield context.df.createTimer(deadlineDate);
    } else {
      context.log("Failed Create Line 186")
    }
  }
  context.log("PAST WHILE")
  const reportProps: reportParams = {
    accessToken: input.accessToken,
    siteId: input.paulyListResult.siteId,
    calendarSyncListId: input.paulyListResult.calendarSyncListId,
    results:results
  }
  context.log("REPORTING")
  const reportResult = yield context.df.callActivity("reportCreateEvents", reportProps)
  context.error("THIS IS THE RESPONCE:", reportResult);
  return "ok"
};
df.app.orchestration('createEventsSync', createEventsSyncOrchOrchestrator);