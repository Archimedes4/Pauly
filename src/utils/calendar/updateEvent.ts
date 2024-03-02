import { addEventSlice } from '@redux/reducers/addEventReducer';
import { currentEventsSlice } from '@redux/reducers/currentEventReducer';
import store from '@redux/store';
import { Colors, loadingStateEnum } from '@constants';
import callMsGraph from '@utils/ultility/microsoftAssests';
import { encodeSchoolDayData } from './calendarFunctions';

export default async function createEvent(): Promise<void> {
  const selectedEvent = store.getState().addEvent.selectedEvent
  if (selectedEvent.paulyEventType === 'personal') {
    const data: {
      subject: string;
      start: { dateTime: string; timeZone: string };
      end: { dateTime: string; timeZone: string };
      isAllDay?: boolean;
    } = {
      subject: selectedEvent.name,
      start: {
        dateTime: selectedEvent.startTime.replace(/.\d+Z$/g, 'Z'),
        timeZone: 'Central America Standard Time',
      },
      end: {
        dateTime:selectedEvent.endTime.replace(/.\d+Z$/g, 'Z'),
        timeZone: 'Central America Standard Time',
      },
    };
    if (selectedEvent.allDay) {
      data.start.dateTime = `${
        store
          .getState()
          .addEvent.selectedEvent.startTime.replace(/.\d+Z$/g, 'Z')
          .split(/[T ]/i, 1)[0]
      }T00:00:00.0000000`;
      data.end.dateTime = `${
        store
          .getState()
          .addEvent.selectedEvent.endTime.replace(/.\d+Z$/g, 'Z')
          .split(/[T ]/i, 1)[0]
      }T00:00:00.0000000`;
      data.isAllDay = true;
    }
    const result = await callMsGraph(
      `https://graph.microsoft.com/v1.0/me/events${(selectedEvent.id === 'create') ? '':'/' + selectedEvent.id}`,
      (selectedEvent.id === 'create') ? 'POST':'PATCH',
      JSON.stringify(data),
    );
    if (result.ok) {
      const dataOut = await result.json();
      const resultEvent: eventType = {
        id: dataOut.id,
        name: dataOut.subject,
        startTime: dataOut.start.dateTime,
        endTime: dataOut.end.dateTime,
        eventColor: Colors.white,
        microsoftEvent: true,
        microsoftReference: `https://graph.microsoft.com/v1.0/me/events/${dataOut.id}`,
        allDay: false,
        paulyEventType: "personal"
      };
      store.dispatch(currentEventsSlice.actions.pushEvent(resultEvent));
      store.dispatch(
        addEventSlice.actions.setCreateEventState(loadingStateEnum.success),
      );
    } else {
      store.dispatch(
        addEventSlice.actions.setCreateEventState(loadingStateEnum.failed),
      );
    }
  } else {
    const data: any = {
      subject: selectedEvent.name,
      start: {
        dateTime: selectedEvent.startTime.replace(/.\d+Z$/g, 'Z'),
        timeZone: 'Central America Standard Time',
      },
      end: {
        dateTime: selectedEvent.endTime.replace(/.\d+Z$/g, 'Z'),
        timeZone: 'Central America Standard Time',
      },
    };
    const schoolYearId = store.getState().addEvent.selectedSchoolYear?.id;
    if (
      selectedEvent.paulyEventType === 'schoolDay'
    ) {
      data.start.dateTime = `${
        selectedEvent.startTime.replace(/.\d+Z$/g, 'Z')
          .split(/[T ]/i, 1)[0]
      }T00:00:00.0000000`;
      const newEndDate = new Date(selectedEvent.startTime);
      newEndDate.setDate(
        new Date(selectedEvent.startTime).getDate() + 1,
      );
      data.end.dateTime = `${
        newEndDate
          .toISOString()
          .replace(/.\d+Z$/g, 'Z')
          .split(/[T ]/i, 1)[0]
      }T00:00:00.0000000`;
      data.isAllDay = true;
      if (selectedEvent.id === 'create') {
        data.subject = `${selectedEvent.schoolDayData.schoolDay.name} ${selectedEvent.schoolDayData.schedule.properName}`;
      }
    } else if (store.getState().addEvent.selectedEvent.allDay) {
      data.start.dateTime = `${
        store
          .getState()
          .addEvent.selectedEvent.startTime.replace(/.\d+Z$/g, 'Z')
          .split(/[T ]/i, 1)[0]
      }T00:00:00.0000000`;
      data.end.dateTime = `${
        store
          .getState()
          .addEvent.selectedEvent.endTime.replace(/.\d+Z$/g, 'Z')
          .split(/[T ]/i, 1)[0]
      }T00:00:00.0000000`;
      data.isAllDay = true;
    }
    if (
      selectedEvent.paulyEventType === 'schoolYear'
    ) {
      data.singleValueExtendedProperties = [
        {
          id: store.getState().paulyList.eventTypeExtensionId,
          value: 'schoolYear',
        },
        {
          id: store.getState().paulyList.eventDataExtensionId,
          value: selectedEvent.timetableId,
        },
      ];
    } else if (
      selectedEvent.paulyEventType ===
        'schoolDay' &&
      schoolYearId !== undefined
    ) {
      const selectedSchoolDayDataCompressed: schoolDayDataCompressedType = {
        sdId: selectedEvent.schoolDayData.schoolDay.id,
        sId: selectedEvent.schoolDayData.schedule.id,
        dcId: selectedEvent.schoolDayData.dressCode.id,
        sem: selectedEvent.schoolDayData.semester,
        dciId:
        selectedEvent.schoolDayData.dressCodeIncentive?.id === undefined
            ? ''
            : selectedEvent.schoolDayData.dressCodeIncentive?.id,
        syeId: schoolYearId,
      };
      const encodedSchoolDayData = encodeSchoolDayData(selectedSchoolDayDataCompressed)
      if (encodedSchoolDayData !== 'failed') {
        store.dispatch(
          addEventSlice.actions.setCreateEventState(loadingStateEnum.failed),
        );
        return
      }
      data.singleValueExtendedProperties = [
        {
          id: store.getState().paulyList.eventTypeExtensionId,
          value: 'schoolDay',
        },
        {
          id: store.getState().paulyList.eventDataExtensionId,
          value: encodedSchoolDayData,
        },
      ];
    }
    // TODO Reocurring
    const result = await callMsGraph(
      (selectedEvent.id === 'create') ? `https://graph.microsoft.com/v1.0/groups/${process.env.EXPO_PUBLIC_ORGWIDEGROUPID}/calendar/events`:`https://graph.microsoft.com/v1.0/groups/${process.env.EXPO_PUBLIC_ORGWIDEGROUPID}/calendar/events/${selectedEvent.id}`,
      (selectedEvent.id === 'create') ? 'POST':'PATCH',
      JSON.stringify(data),
    );
    if (result.ok) {
      const dataOut = await result.json();
      let resultEvent: eventType = {
        ...selectedEvent,
        id: dataOut.id,
        name: dataOut.subject,
        startTime: dataOut.start.dateTime,
        endTime: dataOut.end.dateTime,
        eventColor: Colors.white,
        microsoftReference: `https://graph.microsoft.com/v1.0/groups/${process.env.EXPO_PUBLIC_ORGWIDEGROUPID}/calendar/events/${dataOut.id}`,
        allDay: false,
      };
      if (selectedEvent.id === 'create') {
        resultEvent = {
          ...resultEvent,
          id: dataOut.id
        }
        store.dispatch(currentEventsSlice.actions.pushEvent(resultEvent));
      } else {

        store.dispatch(currentEventsSlice.actions.setCurrentEvents([...store.getState().currentEvents.map((e) => {
          if (e.id === selectedEvent.id) {
            return resultEvent
          }
          return e
        })]))
      }
      store.dispatch(
        addEventSlice.actions.setCreateEventState(loadingStateEnum.success),
      );
    } else {
      store.dispatch(
        addEventSlice.actions.setCreateEventState(loadingStateEnum.failed),
      );
    }
  }
}
