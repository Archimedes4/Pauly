import { getEventInterval } from '@utils/calendar/getEvents';

it('creates the correct interval', () => {
  expect(getEventInterval('2024-03-02T20:36:45.708Z')).toStrictEqual({
    startDate: new Date('2024-02-25T00:00:00.000Z'),
    endDate: new Date('2024-04-07T00:00:00.000Z'),
    selectedDate: new Date('2024-03-02T20:36:45.708Z'),
  });
});
