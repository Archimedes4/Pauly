import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import DayView from './DayView';
import create_UUID from '../../Functions/Ultility/createUUID';
import { RootState } from '../../Redux/store';
import { selectedDateSlice } from '../../Redux/reducers/selectedDateReducer';
import { Colors } from '../../types';
import { ChevronLeft, ChevronRight } from '../../UI/Icons/Icons';

export default function Week({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  const selectedDateRedux: string = useSelector(
    (state: RootState) => state.selectedDate,
  );
  const [daysOfWeek, setDaysOfWeek] = useState<Date[]>([]);
  const dispatch = useDispatch();
  function getDOW(selectedDate: Date) {
    const week: Date[] = [];
    // Starting Monday not Sunday
    selectedDate.setDate(selectedDate.getDate() - selectedDate.getDay());
    for (let i = 0; i < 7; i += 1) {
      week.push(new Date(selectedDate));
      selectedDate.setDate(selectedDate.getDate() + 1);
    }
    return week;
  }
  useEffect(() => {
    setDaysOfWeek(getDOW(new Date(selectedDateRedux)));
  }, [selectedDateRedux]);
  return (
    <View style={{ width, height, backgroundColor: Colors.white }}>
      <View>
        {/* 768 TO DO get dimentiosn value */}
        {false ? (
          <View />
        ) : (
          <View>
            <View
              style={{
                flexDirection: 'row',
                height: width * 0.142857142857143,
                width,
              }}
            >
              <Pressable
                style={{ margin: width * 0.01111111111111111 }}
                onPress={() => {
                  const d = new Date(selectedDateRedux);
                  d.setDate(d.getDate() - 7);
                  dispatch(
                    selectedDateSlice.actions.setCurrentEventsLastCalled(
                      d.toISOString(),
                    ),
                  );
                }}
              >
                <ChevronLeft
                  width={width * 0.08888888888888889}
                  height={width * 0.08888888888888889}
                />
              </Pressable>
              {daysOfWeek.map(day => (
                <Pressable
                  onPress={() => {
                    dispatch(
                      selectedDateSlice.actions.setCurrentEventsLastCalled(
                        day.toISOString(),
                      ),
                    );
                  }}
                  key={`${day.getDay()}_${create_UUID()}`}
                  style={{
                    width: width * 0.08888888888888889,
                    height: width * 0.08888888888888889,
                    margin: width * 0.01111111111111111,
                    borderRadius: 50,
                    backgroundColor: Colors.darkGray,
                    alignContent: 'center',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderColor:
                      day.getDate() === new Date(selectedDateRedux).getDate()
                        ? 'black'
                        : Colors.maroon,
                    borderWidth:
                      new Date().getDate() === day.getDate() ||
                      day.getDate() === new Date(selectedDateRedux).getDate()
                        ? 5
                        : 0,
                  }}
                >
                  <Text style={{ color: Colors.white }}>{day.getDate()}</Text>
                </Pressable>
              ))}
              <Pressable
                style={{ margin: width * 0.01111111111111111 }}
                onPress={() => {
                  const d = new Date(selectedDateRedux);
                  d.setDate(d.getDate() + 7);
                  dispatch(
                    selectedDateSlice.actions.setCurrentEventsLastCalled(
                      d.toISOString(),
                    ),
                  );
                }}
              >
                <ChevronRight
                  width={width * 0.08888888888888889}
                  height={width * 0.08888888888888889}
                />
              </Pressable>
            </View>
          </View>
        )}
      </View>
      <View
        style={{
          height: false ? height : height - width * 0.179,
          width,
          alignContent: 'center',
          alignItems: 'center',
          backgroundColor: Colors.white,
        }}
      >
        <DayView
          width={width * 0.95}
          height={false ? height * 0.757 : height}
        />
      </View>
    </View>
  );
}
