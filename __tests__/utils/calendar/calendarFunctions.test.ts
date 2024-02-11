import {
  convertYearToSchoolYear,
  isTimeOnDay,
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
