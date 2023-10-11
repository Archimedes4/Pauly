//Andrew Mainella
//Pauly
//October 2 2023

import { orgWideGroupID } from "../../PaulyConfig"
import { currentEventsSlice } from "../../Redux/reducers/currentEventReducer"
import store from "../../Redux/store"
import { loadingStateEnum } from "../../types"
import { getGraphEvents } from "./calendarFunctionsGraph"

export default async function getEvents() {
  //date the user picks
  const selectedDate = new Date(store.getState().selectedDate)
  //Start of month that the selected date is in
  const startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  //End of month that the selected date is in
  const endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0)
  
  //Personal Calendar
  var outputEvents: eventType[] = []
  //This code is pulled from add events School Years Select
  var nextUrl: string = `https://graph.microsoft.com/v1.0/me/calendarView?startDateTime=${startDate.toISOString()}&endDateTime=${endDate.toISOString()}`
  while (nextUrl !== "") {
    const furtherResult = await getGraphEvents(nextUrl, "https://graph.microsoft.com/v1.0/me/events/")
    if (furtherResult.result === loadingStateEnum.success && furtherResult.events !== undefined) {
      outputEvents = [...outputEvents, ...furtherResult.events]
      if (furtherResult.nextLink === undefined) {
        nextUrl = ""
        break
      } else {
        nextUrl = furtherResult.nextLink
      }
    } else {
      nextUrl = ""
      break
    }
  }
  

  //OrgWideEvents
  //This code is pulled from add events School Years Select
  var url: string = `https://graph.microsoft.com/v1.0/groups/${orgWideGroupID}/calendar/events?$filter=start/dateTime%20ge%20'${startDate.toISOString()}'%20and%20end/dateTime%20le%20'${endDate.toISOString()}'`
  while (url !== "") {
    const furtherResult = await getGraphEvents(url, `https://graph.microsoft.com/v1.0/groups/${orgWideGroupID}/calendar/events/`)
    if (furtherResult.result === loadingStateEnum.success && furtherResult.events !== undefined) {
      outputEvents = [...outputEvents, ...furtherResult.events]
      url = (furtherResult.nextLink !== undefined) ? furtherResult.nextLink:""
    } else {
      url = ""
    }
  }
  
  store.dispatch(currentEventsSlice.actions.setCurrentEvents(outputEvents))
}