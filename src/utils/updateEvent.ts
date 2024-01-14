import { addEventSlice } from '@redux/reducers/addEventReducer';
import { currentEventsSlice } from '@redux/reducers/currentEventReducer';
import store from '@redux/store';
import { Colors, loadingStateEnum, paulyEventType } from '@constants';
import callMsGraph from '@utils/ultility/microsoftAssets';

export default async function createEvent(): Promise<undefined> {
  if (store.getState().addEvent.selectedEventType === paulyEventType.personal) {
    const data: {
      subject: string;
      start: { dateTime: string; timeZone: string };
      end: { dateTime: string; timeZone: string };
      isAllDay?: boolean;
    } = {
      subject: store.getState().addEvent.eventName,
      start: {
        dateTime: store.getState().addEvent.startDate.replace(/.\d+Z$/g, 'Z'),
        timeZone: 'Central America Standard Time',
      },
      end: {
        dateTime: store.getState().addEvent.endDate.replace(/.\d+Z$/g, 'Z'),
        timeZone: 'Central America Standard Time',
      },
    };
    if (store.getState().addEvent.allDay) {
      data.start.dateTime = `${
        store
          .getState()
          .addEvent.startDate.replace(/.\d+Z$/g, 'Z')
          .split(/[T ]/i, 1)[0]
      }T00:00:00.0000000`;
      data.end.dateTime = `${
        store
          .getState()
          .addEvent.endDate.replace(/.\d+Z$/g, 'Z')
          .split(/[T ]/i, 1)[0]
      }T00:00:00.0000000`;
      data.isAllDay = true;
    }
    const result = await callMsGraph(
      `https://graph.microsoft.com/v1.0/me/events`,
      'POST',
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
      subject: store.getState().addEvent.eventName,
      start: {
        dateTime: store.getState().addEvent.startDate.replace(/.\d+Z$/g, 'Z'),
        timeZone: 'Central America Standard Time',
      },
      end: {
        dateTime: store.getState().addEvent.endDate.replace(/.\d+Z$/g, 'Z'),
        timeZone: 'Central America Standard Time',
      },
    };
    const schoolDay = store.getState().addEvent.selectedSchoolDayData;
    const schoolYearId = store.getState().addEvent.selectedSchoolYear?.id;
    if (
      store.getState().addEvent.selectedEventType === paulyEventType.schoolDay
    ) {
      if (schoolDay !== undefined) {
        if (store.getState().addEvent.selectedSchoolDayData === undefined) {
          store.dispatch(
            addEventSlice.actions.setCreateEventState(loadingStateEnum.failed),
          );
          return;
        }
        data.start.dateTime = `${
          store
            .getState()
            .addEvent.startDate.replace(/.\d+Z$/g, 'Z')
            .split(/[T ]/i, 1)[0]
        }T00:00:00.0000000`;
        const newEndDate = new Date(store.getState().addEvent.startDate);
        newEndDate.setDate(
          new Date(store.getState().addEvent.startDate).getDate() + 1,
        );
        data.end.dateTime = `${
          newEndDate
            .toISOString()
            .replace(/.\d+Z$/g, 'Z')
            .split(/[T ]/i, 1)[0]
        }T00:00:00.0000000`;
        data.isAllDay = true;
        data.subject = `${schoolDay.schoolDay.name} ${schoolDay.schedule.properName}`;
      } else {
        store.dispatch(
          addEventSlice.actions.setCreateEventState(loadingStateEnum.failed),
        );
      }
    } else if (store.getState().addEvent.allDay) {
      data.start.dateTime = `${
        store
          .getState()
          .addEvent.startDate.replace(/.\d+Z$/g, 'Z')
          .split(/[T ]/i, 1)[0]
      }T00:00:00.0000000`;
      data.end.dateTime = `${
        store
          .getState()
          .addEvent.endDate.replace(/.\d+Z$/g, 'Z')
          .split(/[T ]/i, 1)[0]
      }T00:00:00.0000000`;
      data.isAllDay = true;
    }
    if (
      store.getState().addEvent.selectedEventType === paulyEventType.schoolYear
    ) {
      data.singleValueExtendedProperties = [
        {
          id: store.getState().paulyList.eventTypeExtensionId,
          value: 'schoolYear',
        },
        {
          id: store.getState().paulyList.eventDataExtensionId,
          value: store.getState().addEvent.selectedTimetable.id,
        },
      ];
    } else if (
      store.getState().addEvent.selectedEventType ===
        paulyEventType.schoolDay &&
      schoolDay !== undefined &&
      schoolYearId !== undefined
    ) {
      const selectedSchoolDayDataCompressed: schoolDayDataCompressedType = {
        schoolDayId: schoolDay.schoolDay.id,
        scheduleId: schoolDay.schedule.id,
        dressCodeId: schoolDay.dressCode.id,
        semester: schoolDay.semester,
        dressCodeIncentiveId:
          schoolDay.dressCodeIncentive?.id === undefined
            ? ''
            : schoolDay.dressCodeIncentive?.id,
        schoolYearEventId: schoolYearId,
      };
      data.singleValueExtendedProperties = [
        {
          id: store.getState().paulyList.eventTypeExtensionId,
          value: 'schoolDay',
        },
        {
          id: store.getState().paulyList.eventDataExtensionId,
          value: JSON.stringify(selectedSchoolDayDataCompressed),
        },
      ];
    }
    // TODO Reocurring
    const result = await callMsGraph(
      `https://graph.microsoft.com/v1.0/groups/${process.env.EXPO_PUBLIC_ORGWIDEGROUPID}/calendar/events`,
      'POST',
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
        paulyEventType:
          store.getState().addEvent.selectedEventType ===
          paulyEventType.schoolDay
            ? 'schoolDay'
            : store.getState().addEvent.selectedEventType ===
                paulyEventType.schoolYear
              ? 'schoolYear'
              : undefined,
        paulyEventData:
          store.getState().addEvent.selectedEventType ===
          paulyEventType.schoolDay
            ? JSON.stringify(store.getState().addEvent.selectedSchoolDayData)
            : store.getState().addEvent.selectedEventType ===
                paulyEventType.schoolYear
              ? store.getState().addEvent.selectedTimetable.id
              : undefined,
        microsoftEvent: true,
        microsoftReference: `https://graph.microsoft.com/v1.0/groups/${process.env.EXPO_PUBLIC_ORGWIDEGROUPID}/calendar/events/${dataOut.id}`,
        allDay: false,
      };
      store.dispatch(currentEventsSlice.actions.pushEvent(resultEvent));
      store.dispatch(addEventSlice.actions.setSelectedSchoolDayData(undefined));
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
