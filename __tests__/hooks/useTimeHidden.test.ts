import { calculateHiddenTime } from "@hooks/useTimeHidden"

it('Finds the time to hide corretly', () => {
  // @ 1 am 1708239600000
  expect(calculateHiddenTime(new Date(1708239600000))).toBe("1AM")
  // @ 11: 50 pm 1708321800000
  expect(calculateHiddenTime(new Date(1708321800000))).toBe("12PM")
  // @ 11 am 1708275600000
  expect(calculateHiddenTime(new Date(1708275600000))).toBe("11AM")
  // @ 11:50 am 1708278600000
  expect(calculateHiddenTime(new Date(1708278600000))).toBe("12PM")
  // @ 12 pm 1708279200000
  expect(calculateHiddenTime(new Date(1708279200000))).toBe("12PM")
  // @ 12:10 pm 1708279800000
  expect(calculateHiddenTime(new Date(1708279800000))).toBe("12PM")

  // @ 12 30 pm 1708281000000
  expect(calculateHiddenTime(new Date(1708281000000))).toBe("")
});
