import { orgWideGroupID } from "../../PaulyConfig";
import store from "../../Redux/store";
import { loadingStateEnum } from "../../types";
import callMsGraph from "../Ultility/microsoftAssets";

export default async function getSchoolYears(nextLink?: string): Promise<{ result: loadingStateEnum; events?: eventType[]; nextLink?: string}> {
  const result = await callMsGraph(`https://graph.microsoft.com/v1.0/groups/${orgWideGroupID}/calendar/events?$select=${store.getState().paulyList.eventExtensionId}&$filter=${store.getState().paulyList.eventExtensionId}/eventType%20eq%20schoolYear`, "GET", true)
  if (result.ok){
    const data = await result.json()
    console.log(data)
    var newEvents: eventType[] = []
    for(var index = 0; index < data["value"].length; index++) {
      const eventExtensionID = store.getState().paulyList.eventExtensionId
      if (data["value"][index][eventExtensionID] !== undefined) {
        if (data["value"][index][eventExtensionID]["eventType"] === "schoolYear") {
          newEvents.push({
            id: data["value"][index]["id"],
            name: data["value"][index]["subject"],
            startTime: new Date(data["value"][index]["start"]["dateTime"]),
            endTime: new Date(data["value"][index]["end"]["dateTime"]),
            eventColor: "white",
            paulyEventType: data["value"][index][eventExtensionID]["eventType"],
            paulyEventData: data["value"][index][eventExtensionID]["eventData"],
            microsoftEvent: true,
            microsoftReference: "https://graph.microsoft.com/v1.0/groups/" + orgWideGroupID + "/calendar/events/" + data["value"][index]["id"]
          })
        }
      }
    }
    return {result: loadingStateEnum.success, events: newEvents, nextLink: data["@odata.nextLink"]}
  } else {
    return {result: loadingStateEnum.failed}
  }
}