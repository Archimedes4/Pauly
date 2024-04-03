/*
  Andrew Mainella
  20 October 2023
  Pauly
  MonthView.tsx
  This is the componet used on the home page of the app
*/
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  findFirstDayinMonth,
  getDay,
  getDaysInMonth,
} from '../utils/calendar/calendarFunctions';
import { getSchoolDays } from '../utils/calendar/calendarFunctionsGraph';
import { RootState } from '../redux/store';
import { monthViewSlice } from '../redux/reducers/monthViewReducer';
import { Colors, loadingStateEnum } from '../constants';

function getBackgroundColor(day: number, textval: number, monthViewData: eventType | undefined) {
  if (day == textval) {
    return "red"
  } else if (day >= textval + 1 && textval !== 0) {
    return "gray"
  } else if (monthViewData !== undefined) {
    return monthViewData.eventColor
  } else {
    return Colors.white
  }
}

function MonthBlock({
  value,
  width,
  height,
  startDate,
  daySelected,
}: {
  value: number;
  width: number;
  height: number;
  startDate: number;
  daySelected: number;
}) {
  const textval: number = getDay(value, startDate) ?? 0;
  const day = new Date().getDate();
  const monthViewData = useSelector((state: RootState) => state.monthView).find(
    e => {
      return new Date(e.startTime).getDate() === textval;
    },
  );
  return (
    <View
      style={{
        width,
        height,
        borderColor: Colors.black,
        borderWidth: 1,
        backgroundColor: getBackgroundColor(day, textval, monthViewData),
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        position: 'absolute',
      }}
    >
      {/* {value >= startDate - 1 && value <= daySelected && textval !== 0 ? (
        <View
          style={{
            width,
            position: 'absolute',
            height,
            borderColor: 'black',
            backgroundColor:
              day == textval
                ? 'red'
                : day >= textval + 1
                  ? 'gray'
                  : monthViewData !== undefined
                    ? monthViewData.eventColor
                    : Colors.white,
          }}
        />
      ) : (
        <View
          style={{
            backgroundColor: Colors.white,
            width,
            height,
          }}
        />
      )} */}
      {textval >= 1 ? (
        // <View
        //   id="Text"
        //   style={{
        //     width,
        //     height,
        //     justifyContent: 'center',
        //     alignContent: 'center',
        //     alignItems: 'center',
        //     position: 'absolute',
        //   }}
        // >
        <>
          {monthViewData !== undefined ? (
            <>
              {monthViewData.paulyEventType === 'schoolDay' ? (
                <>
                  <Text
                    style={{
                      color: Colors.black,
                      fontSize: 10,
                      fontWeight: 'bold',
                      position: 'absolute',
                      top: 1,
                      right: 3,
                    }}
                  >
                    {monthViewData.schoolDayData.schoolDay.shorthand}
                  </Text>
                  <Text style={{ color: Colors.black }}>{textval}</Text>
                </>
              ) : (
                <Text style={{ color: Colors.black, zIndex: 2 }}>
                  {textval}
                </Text>
              )}
            </>
          ) : (
            <Text id="This is text" style={{ color: Colors.black, zIndex: 2 }}>
              {textval}
            </Text>
          )}
          </>
        // </View>
      ) : null}
    </View>
  );
}

export default function MonthView({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  const Count = getDaysInMonth(new Date());
  const StartDate = findFirstDayinMonth(new Date());
  const [daySelected, setDaySelected] = useState<number>(
    Count + StartDate - 2 - (Count / 7) * 2,
  );
  const thirtyValue = [...Array(30).keys()];
  const monthViewData = useSelector((state: RootState) => state.monthView);
  const dispatch = useDispatch();

  async function loadData() {
    if (monthViewData.length <= 0) {

      const result = await getSchoolDays(new Date());
      if (result.result === loadingStateEnum.success) {
        dispatch(monthViewSlice.actions.setMonthViewData(result.data));
      }
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        width,
        height,
      }}
    >
      <View
        style={{
          width: width * 0.2,
          height: height * 0.13,
          justifyContent: 'center',
          alignItems: 'center',
          alignContent: 'center',
          overflow: 'hidden',
        }}
      >
        <Text
          numberOfLines={1}
          style={{
            width: width * 0.2,
            textAlign: 'center',
            color: Colors.white,
          }}
        >
          Monday
        </Text>
      </View>
      <View
        style={{
          width: width * 0.2,
          height: height * 0.13,
          justifyContent: 'center',
          alignItems: 'center',
          alignContent: 'center',
          overflow: 'hidden',
        }}
      >
        <Text
          numberOfLines={1}
          style={{
            width: width * 0.2,
            textAlign: 'center',
            color: Colors.white,
          }}
        >
          Tuesday
        </Text>
      </View>
      <View
        style={{
          width: width * 0.2,
          height: height * 0.13,
          justifyContent: 'center',
          alignItems: 'center',
          alignContent: 'center',
          overflow: 'hidden',
        }}
      >
        <Text
          numberOfLines={1}
          style={{
            width: width * 0.2,
            textAlign: 'center',
            color: Colors.white,
          }}
        >
          Wednesday
        </Text>
      </View>
      <View
        style={{
          width: width * 0.2,
          height: height * 0.13,
          justifyContent: 'center',
          alignItems: 'center',
          alignContent: 'center',
          overflow: 'hidden',
        }}
      >
        <Text
          numberOfLines={1}
          style={{
            width: width * 0.2,
            textAlign: 'center',
            color: Colors.white,
          }}
        >
          Thursday
        </Text>
      </View>
      <View
        style={{
          width: width * 0.2,
          height: height * 0.13,
          justifyContent: 'center',
          alignItems: 'center',
          alignContent: 'center',
          overflow: 'hidden',
        }}
      >
        <Text
          numberOfLines={1}
          style={{
            width: width * 0.2,
            textAlign: 'center',
            color: Colors.white,
          }}
        >
          Friday
        </Text>
      </View>
      {thirtyValue.map((value: number) => (
        <View
          style={{
            width: width * 0.2,
            height: height * 0.145,
            overflow: 'hidden',
          }}
          key={value}
        >
          <MonthBlock
            value={value}
            width={width * 0.2}
            height={height * 0.145}
            startDate={StartDate}
            daySelected={daySelected}
          />
        </View>
      ))}
    </View>
  );
}
