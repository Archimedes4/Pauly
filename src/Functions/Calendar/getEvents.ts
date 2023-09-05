import { orgWideGroupID } from "../../PaulyConfig"
import { currentEventsSlice } from "../../Redux/reducers/currentEventReducer"
import store from "../../Redux/store"
import { loadingStateEnum } from "../../types"
import { getGraphEvents } from "./calendarFunctionsGraph"

export default async function getEvents() {
  const selectedDateOut = new Date(JSON.parse(store.getState().selectedDate))
  const startDate = new Date(selectedDateOut.getFullYear(), selectedDateOut.getMonth(), 1)
  const endDate = new Date(selectedDateOut.getFullYear(), selectedDateOut.getMonth() + 1, 0)
  //Personal Calendar
  var outputEvents: eventType[] = []
  const personalCalendarResult = await getGraphEvents(false, "https://graph.microsoft.com/v1.0/me/calendarView?startDateTime=" + startDate.toISOString() +"&endDateTime=" + endDate.toISOString(), "https://graph.microsoft.com/v1.0/me/events/")
  if (personalCalendarResult.result === loadingStateEnum.success){
    outputEvents = personalCalendarResult.events
    //This code is pulled from add events School Years Select
    var url: string = (personalCalendarResult.nextLink !== undefined) ? personalCalendarResult.nextLink:""
    var notFound: boolean = (personalCalendarResult.nextLink !== undefined) ? true:false
    while (notFound) {
      const furtherResult = await getGraphEvents(false, url, "https://graph.microsoft.com/v1.0/me/events/")
      if (furtherResult.result === loadingStateEnum.success) {
        outputEvents = [...outputEvents, ...furtherResult.events]
        url = (furtherResult.nextLink !== undefined) ? furtherResult.nextLink:""
        notFound = (furtherResult.nextLink !== undefined) ? true:false
      } else {
        notFound = false
      }
    }
  }
  //OrgWideEvents
  const orgEventsResult = await getGraphEvents(false, "https://graph.microsoft.com/v1.0/groups/" + orgWideGroupID + "/calendar/events?$filter=start/dateTime%20ge%20'" + startDate.toISOString() + "'%20and%20end/dateTime%20le%20'" + endDate.toISOString() + "'", "https://graph.microsoft.com/v1.0/groups/" + orgWideGroupID + "/calendar/events/")
  if (orgEventsResult.result === loadingStateEnum.success) {
    outputEvents = [...outputEvents, ...orgEventsResult.events]
    //This code is pulled from add events School Years Select
    var url: string = (orgEventsResult.nextLink !== undefined) ? orgEventsResult.nextLink:""
    var notFound: boolean = (orgEventsResult.nextLink !== undefined) ? true:false
    while (notFound) {
      const furtherResult = await getGraphEvents(false, url, "https://graph.microsoft.com/v1.0/groups/" + orgWideGroupID + "/calendar/events/")
      if (furtherResult.result === loadingStateEnum.success) {
        outputEvents = [...outputEvents, ...furtherResult.events]
        url = (furtherResult.nextLink !== undefined) ? furtherResult.nextLink:""
        notFound = (furtherResult.nextLink !== undefined) ? true:false
      } else {
        notFound = false
      }
    }
  }
  var outputEventsString: string[] = []
  for (var index = 0; index < outputEvents.length; index++) {
    outputEventsString.push(JSON.stringify(outputEvents[index]))
  }
  store.dispatch(currentEventsSlice.actions.setCurrentEvents(outputEventsString))
}