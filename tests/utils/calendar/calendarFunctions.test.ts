import {
  decodeSchoolDayData,
  encodeSchoolDayData,
  isDateToday,
  convertYearToSchoolYear,
  isTimeOnDay,
  isTimeDuringInterval,
} from '@utils/calendar/calendarFunctions';

it('converts year to school year', () => {
  const twentyFour = convertYearToSchoolYear(2024);
  const twentySix = convertYearToSchoolYear(2026);
  const twentyEight = convertYearToSchoolYear(2028);
  const twentyThrity = convertYearToSchoolYear(2030);
  const twentyFortyOne = convertYearToSchoolYear(2041);
  expect(twentyFour).toBe('2023-2024');
  expect(twentySix).toBe('2025-2026');
  expect(twentyEight).toBe('2027-2028');
  expect(twentyThrity).toBe('2029-2030');
  expect(twentyFortyOne).toBe('2040-2041');
});

it('compares two days correctly', () => {
  const timeDifference = isTimeOnDay(
    new Date(Date.UTC(2024, 1, 3, 3, 5, 6, 10)).toISOString(),
    new Date(Date.UTC(2024, 1, 3, 3, 5, 6, 10)).toISOString(),
  );
  expect(timeDifference).toBe(true);
  const dateDifference = isTimeOnDay(
    new Date(Date.UTC(2024, 1, 4, 3, 5, 6, 10)).toISOString(),
    new Date(Date.UTC(2024, 1, 3, 3, 5, 6, 10)).toISOString(),
  );
  expect(dateDifference).toBe(false);
  const yearDifference = isTimeOnDay(
    new Date(Date.UTC(2022, 1, 3, 3, 5, 6, 10)).toISOString(),
    new Date(Date.UTC(2024, 1, 3, 3, 5, 6, 10)).toISOString(),
  );
  expect(yearDifference).toBe(false);
});

it('checks todays date correctly', () => {
  expect(isDateToday(new Date())).toBe(true);
  expect(isDateToday(new Date(1704070800))).toBe(false);
});

it('encodes school day data correctly without dress code id', () => {
  expect(
    encodeSchoolDayData({
      sdId: '20ae2a0a-c3e0-4ab7-b975-c189545b602b',
      sId: '27257221-6a42-4a8e-96c7-6aa79382437b',
      dcId: '456bd570-337e-4c99-ab99-defb3558c59f',
      sem: 1,
      dciId: '',
      syeId:
        '27257221-6a42-4a8e-96c7-6aa79382437b',
    }),
  ).toBe(
    '456bd570-337e-4c99-ab99-defb3558c59f27257221-6a42-4a8e-96c7-6aa79382437b20ae2a0a-c3e0-4ab7-b975-c189545b602b27257221-6a42-4a8e-96c7-6aa79382437b1',
  );
});

it('decodes school day data correctly without dress code id', () => {
  expect(
    decodeSchoolDayData(
      '456bd570-337e-4c99-ab99-defb3558c59f27257221-6a42-4a8e-96c7-6aa79382437b20ae2a0a-c3e0-4ab7-b975-c189545b602b27257221-6a42-4a8e-96c7-6aa79382437b1',
    ),
  ).toStrictEqual({
    sdId: '20ae2a0a-c3e0-4ab7-b975-c189545b602b',
    sId: '27257221-6a42-4a8e-96c7-6aa79382437b',
    dcId: '456bd570-337e-4c99-ab99-defb3558c59f',
    sem: 1,
    dciId: '',
    syeId: '27257221-6a42-4a8e-96c7-6aa79382437b',
  });
});

it('encodes school day data correctly without dress code id', () => {
  expect(
    encodeSchoolDayData({
      sdId: '20ae2a0a-c3e0-4ab7-b975-c189545b602b',
      sId: '27257221-6a42-4a8e-96c7-6aa79382437b',
      dcId: '456bd570-337e-4c99-ab99-defb3558c59f',
      sem: 1,
      dciId: '14253221-6b02-4n8e-19j2-6ja79682437f',
      syeId:
        '27257221-6a42-4a8e-96c7-6aa79382437b',
    }),
  ).toBe(
    '456bd570-337e-4c99-ab99-defb3558c59f27257221-6a42-4a8e-96c7-6aa79382437b20ae2a0a-c3e0-4ab7-b975-c189545b602b27257221-6a42-4a8e-96c7-6aa79382437b14253221-6b02-4n8e-19j2-6ja79682437f1',
  );
});

it('decodes school day data correctly with dress code id', () => {
  expect(
    decodeSchoolDayData(
      '456bd570-337e-4c99-ab99-defb3558c59f27257221-6a42-4a8e-96c7-6aa79382437b20ae2a0a-c3e0-4ab7-b975-c189545b602b456bd570-337e-4c99-ab99-defb3558c59f14253221-6b02-4n8e-19j2-6ja79682437f1',
    ),
  ).toStrictEqual({
    sdId: '20ae2a0a-c3e0-4ab7-b975-c189545b602b',
    sId: '27257221-6a42-4a8e-96c7-6aa79382437b',
    dcId: '456bd570-337e-4c99-ab99-defb3558c59f',
    sem: 1,
    dciId: '14253221-6b02-4n8e-19j2-6ja79682437f',
    syeId:
      '456bd570-337e-4c99-ab99-defb3558c59f',
  });
});

it('Checks if a time is during a interval corretly', () => {
  const intStart = new Date("2024-04-11T00:00:00.0000000").getTime()
  const intEnd = new Date("2024-04-14T00:00:00.0000000").getTime()
  const envStart = new Date("2024-04-08T00:00:00.0000000").getTime()
  const envEnd = new Date("2024-04-12T00:00:00.0000000").getTime()
  expect(isTimeDuringInterval(envStart, envEnd, intStart, intEnd)).toBe(true)
})