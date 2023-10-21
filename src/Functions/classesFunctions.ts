import store from "../Redux/store"
import callMsGraph from "./Ultility/microsoftAssets"
import { homepageDataSlice } from "../Redux/reducers/homepageDataReducer"
import { getEvent, getSchoolDay, getTimetable } from "./calendar/calendarFunctionsGraph"
import { Colors, loadingStateEnum, semesters } from "../types";
import { getSchedule } from "./calendar/calendarFunctionsGraph";

export async function getRooms(nextLink?: string, search?: string): Promise<{result: loadingStateEnum, data?: roomType[], nextLink?: string}> {
  const searchFilter = (search) ? `&$filter=fields/roomName%20eq%20${search}`:""; //TODO deal with search filter
  const result = await callMsGraph(nextLink ? nextLink:"https://graph.microsoft.com/v1.0/sites/" + store.getState().paulyList.siteId + "/lists/" + store.getState().paulyList.roomListId +"/items?expand=fields" +  search);
  if (result.ok){
    const data = await result.json();
    let resultArray: roomType[] = [];
    for (let index = 0; index < data["value"].length; index += 1){
      resultArray.push({
        name: data["value"][index]["fields"]["roomName"],
        id: data["value"][index]["fields"]["roomId"]
      });
    };
    return {result: loadingStateEnum.success, data: resultArray, nextLink: data["@odata.nextLink"]};
  } else {
    return {result: loadingStateEnum.failed};
  }
}

export async function getRoom(roomId: string): Promise<{result: loadingStateEnum, data?: roomType}> {
  const result = await callMsGraph(`https://graph.microsoft.com/v1.0/sites/${store.getState().paulyList.siteId}/lists/${store.getState().paulyList.roomListId}/items?expand=fields&fields/roomId%20eq%20'${roomId}'`);
  if (result.ok) {
    const data = await result.json();
    if (data["value"].length === 0){
      return {result: loadingStateEnum.success, data: {
        name: data["value"][0]["fields"]["roomName"],
        id: data["value"][0]["feilds"]["ro0mId"]
      }};
    } else {
      return {result: loadingStateEnum.failed};
    };
  } else {
    return {result: loadingStateEnum.failed};
  };
}

export async function getClasses(): Promise<{result: loadingStateEnum, data?: classType[]}> {
  let classQuery: string = `https://graph.microsoft.com/v1.0/me/joinedTeams?$select=id`;
  let batchDataRequests: {id: string, method: string, url: string}[][] = [[]];
  while (classQuery !== undefined) {
    const classResult = await callMsGraph(classQuery);
    if (classResult.ok) {
      const classData = await classResult.json();
      classQuery = classData["@odata.nextLink"];

      //Batch Request perfroming a get request on each class group

      //Format Data
      for (let index = 0; index < classData["value"].length; index += 1) {
        batchDataRequests[Math.floor(index/20)].push({
          id: (index + 1).toString(),
          method: "GET",
          url: `/groups/${classData["value"][index]["id"]}?$select=displayName,id,${store.getState().paulyList.classExtensionId}`
        });
      };
    } else {
      return {result: loadingStateEnum.failed};
    }
  }
  //Run Queries
  const batchHeaders = new Headers();
  batchHeaders.append("Accept", "application/json");
  let classes: classType[] = [];
  for (let index = 0; index < batchDataRequests.length; index += 1) {
    const batchData = {
      "requests":batchDataRequests[index]
    };
    const batchResult = await callMsGraph("https://graph.microsoft.com/v1.0/$batch", "POST", JSON.stringify(batchData))
    if (batchResult.ok){
      const batchResultData = await batchResult.json()
      for (let batchIndex = 0; batchIndex < batchResultData["responses"].length; batchIndex += 1) {
        if (batchResultData["responses"][batchIndex]["status"] === 200) {
          if (batchResultData["responses"][batchIndex]["body"][store.getState().paulyList.classExtensionId] !== undefined) {
            classes.push({
              name: batchResultData["responses"][batchIndex]["body"]["displayName"],
              id: batchResultData["responses"][batchIndex]["body"]["id"],
              periods: JSON.parse(batchResultData["responses"][batchIndex]["body"][store.getState().paulyList.classExtensionId]["periodData"]),
              room: {
                name: "",
                id: ""
              },
              schoolYearId: "",
              semester: semesters.semesterOne
            })
            
          }
        } else {
          return {result: loadingStateEnum.failed}
        }
      }
    } else {
      return {result: loadingStateEnum.failed}
    }
  }
  return {result: loadingStateEnum.success, data: classes}
}

export async function getClassEvents(scheduleId: string, semester: semesters, schoolYearEventId: string, schoolDay: schoolDayType, date: Date): Promise<{result: loadingStateEnum, data?: eventType[]}> {
  const scheduleResult = await getSchedule(scheduleId)
  const classResult = await getClasses()
  if (scheduleResult.result === loadingStateEnum.success && classResult.result === loadingStateEnum.success && classResult.data !== undefined && scheduleResult.schedule !== undefined) {
    let outputEvents: eventType[] = []
    for (let index = 0; index < classResult.data.length; index += 1) {
      if (classResult.data[index].schoolYearId === schoolYearEventId && classResult.data[index].semester === semester) {
        //This check should never fail
        if (classResult.data[index].periods.length > schoolDay.order){
          //Find Time
          const period: number = classResult.data[index].periods[schoolDay.order]
          const periodData = scheduleResult.schedule.periods[period]
          let startDate: Date = new Date(date.toISOString())
          startDate.setHours(periodData.startHour)
          startDate.setMinutes(periodData.startMinute)
          startDate.setSeconds(0)
          let endDate: Date = date
          endDate.setHours(periodData.endHour)
          endDate.setMinutes(periodData.endMinute)
          endDate.setSeconds(0)
          outputEvents.push({
            id: classResult.data[index].id,
            name: classResult.data[index].name,
            startTime: startDate.toISOString(),
            endTime: endDate.toISOString(),
            eventColor: Colors.white,
            microsoftEvent: false,
            allDay: false
          })
        }
      }
    }
    outputEvents.sort((a, b) => {return new Date(a.startTime).getTime() - new Date(b.startTime).getTime()})
    return {result: loadingStateEnum.success, data: outputEvents}
  } else {
    return {result: loadingStateEnum.failed}
  }
}

export async function getClassEventsFromDay(date?: Date): Promise<{result: loadingStateEnum, data?: eventType[]}> {
  const result = await getSchoolDay(date ? date:new Date())
  if (result.result === loadingStateEnum.success && result.event !== undefined && result.event.paulyEventData !== undefined){
    const outputIds: schoolDayDataCompressedType = JSON.parse(result.event.paulyEventData)
    const eventResult = await getEvent(outputIds.schoolYearEventId)
    if (eventResult.result === loadingStateEnum.success && eventResult.data !== undefined && eventResult.data?.paulyEventData !== undefined){
      const timetableResult = await getTimetable(eventResult.data.paulyEventData)
      if (timetableResult.result === loadingStateEnum.success && timetableResult.timetable !== undefined){
        const schoolDay = timetableResult.timetable.days.find((e: { id: string }) => {return e.id === outputIds.schoolDayId})
        const schedule = timetableResult.timetable.schedules.find((e: { id: string }) => {return e.id === outputIds.scheduleId})
        const dressCode = timetableResult.timetable.dressCode.dressCodeData.find((e: { id: string }) => {return e.id === outputIds.dressCodeId})
        const dressCodeIncentive = timetableResult.timetable.dressCode.dressCodeIncentives.find((e: { id: string }) => {return e.id === outputIds?.dressCodeIncentiveId})
        if (schoolDay !== undefined && schedule !== undefined && dressCode !== undefined) {
          store.dispatch(homepageDataSlice.actions.setSchoolDayData({
            schoolDay: schoolDay,
            schedule: schedule,
            dressCode: dressCode,
            semester: outputIds.semester,
            dressCodeIncentive: dressCodeIncentive
          }))
          if (schedule !== undefined) {
            const classResult = await getClassEvents(schedule.id, outputIds.semester, outputIds.schoolYearEventId, schoolDay, new Date(result.event.startTime))
            if (classResult.result === loadingStateEnum.success && classResult.data !== undefined) {
              if (classResult.data.length >= 1) {
                const startTimeDate = new Date(classResult.data[0].startTime)
                const hourTime = (((startTimeDate.getHours() % 12) + 1 <= 9) ? `0${((startTimeDate.getHours() % 12) + 1)}`:((startTimeDate.getHours() % 12) + 1))
                const monthTime = (startTimeDate.getMinutes() <= 9) ? `0${startTimeDate.getMinutes()}`:startTimeDate.getMinutes().toString()
                store.dispatch(homepageDataSlice.actions.setStartTime( hourTime + ":" + monthTime ))
              }
              return {result: loadingStateEnum.success, data: classResult.data}
            } else {
              return {result: loadingStateEnum.failed}
            }
          } else {
            return {result: loadingStateEnum.failed}
          }
        } else {
          return {result: loadingStateEnum.failed}
        }
      } else {
        return {result: loadingStateEnum.failed}
      }
    } else {
      return {result: loadingStateEnum.failed}
    }
  } else {
    return {result: loadingStateEnum.failed}
  }
}