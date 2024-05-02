/*
  Pauly
  Andrew Mainella
*/
import { View, Text, Switch, Pressable, Platform } from 'react-native';
import React, { useState } from 'react';
import { Colors } from '@constants';
import { DatePickerModal, TimePickerModal } from 'react-native-paper-dates';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { CalendarIcon, TimeIcon } from '@components/Icons';

enum datePickingMode {
  none,
  startTime,
  endTime,
  startDate,
  endDate,
}

/**
 * A function to update the commissions time.
 * @param commission The current value of the convision
 * @param setCommissionData A function called to update the commission with it's new data. Set commissions should update the commission param.
 * @returns A view
 */
export default function CommissionsTimeComponent({
  commission,
  setCommissionData,
}: {
  commission: commissionType;
  setCommissionData: (item: commissionType) => void;
}) {
  const [currentDatePickingMode, setCurrentDatePickingMode] =
    useState<datePickingMode>(datePickingMode.none);
  const { width } = useSelector((state: RootState) => state.dimensions);

  if (commission.timed) {
    return (
      <View
        style={{
          shadowColor: Colors.black,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.8,
          shadowRadius: 10,
          borderRadius: 15,
          padding: 10,
          margin: 15,
          marginBottom: 20,
          backgroundColor: Colors.white,
        }}
      >
        <View style={{ flexDirection: 'row' }}>
          <Text>Timed: </Text>
          <Switch
            trackColor={{ false: Colors.lightGray, true: Colors.darkGray }}
            thumbColor={commission.timed ? Colors.maroon : Colors.darkGray}
            {...Platform.select({
              web: {
                activeThumbColor: Colors.maroon,
              },
            })}
            ios_backgroundColor={Colors.lightGray}
            onValueChange={e => {
              if (!e) {
                setCommissionData({
                  ...commission,
                  timed: false,
                });
              }
            }}
            value={commission.timed}
            style={{ marginLeft: 10 }}
          />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flexDirection: 'row', margin: 10 }}>
            <Pressable
              onPress={() => {
                setCurrentDatePickingMode(datePickingMode.startDate)
              }}
            >
              <Text>
                {new Date(commission.startDate).toLocaleString('en-us', {
                  month: 'long',
                })}{' '}
                {new Date(commission.startDate).getDate()}{' '}
                {new Date(commission.startDate).getFullYear()}{' '}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setCurrentDatePickingMode(datePickingMode.startTime)
              }}
            >
              <Text>
                {new Date(commission.startDate).getHours() % 12 || 12}:
                {new Date(commission.startDate).getMinutes().toString()
                  .length === 1
                  ? `0${new Date(commission.startDate).getMinutes()}`
                  : new Date(commission.startDate).getMinutes()}{' '}
                {new Date(commission.startDate).getHours() >= 12
                  ? 'pm'
                  : 'am'}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setCurrentDatePickingMode(datePickingMode.startDate)
              }}
            >
              <CalendarIcon width={24} height={15} />
            </Pressable>
            <DatePickerModal
              locale="en"
              mode="single"
              label="Select Start Date"
              visible={currentDatePickingMode === datePickingMode.startDate}
              onDismiss={() => setCurrentDatePickingMode(datePickingMode.none)}
              date={new Date(commission.startDate)}
              onConfirm={e => {
                if (e.date !== undefined) {
                  const oldDate = new Date(commission.startDate);
                  const newDate = new Date(
                    e.date.getFullYear(),
                    e.date.getMonth(),
                    e.date.getDate(),
                    oldDate.getHours(),
                    oldDate.getMinutes(),
                  );
                  setCommissionData({
                    ...commission,
                    startDate: newDate.toISOString().replace(/.\d+Z$/g, 'Z'),
                  });
                }
                setCurrentDatePickingMode(datePickingMode.none);
              }}
            />
          </View>
          <View style={{ margin: 5 }}>
            <Pressable
              onPress={() => {
                setCurrentDatePickingMode(datePickingMode.startTime)
              }}
              style={{
                height: 26.4,
                alignContent: 'center',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TimeIcon width={15} height={15} />
            </Pressable>
            <TimePickerModal
              hours={new Date(commission.startDate).getHours()}
              minutes={new Date(commission.startDate).getMinutes()}
              visible={currentDatePickingMode === datePickingMode.startTime}
              onDismiss={() => setCurrentDatePickingMode(datePickingMode.none)}
              onConfirm={e => {
                const newDate = new Date(commission.startDate);
                newDate.setHours(e.hours);
                newDate.setMinutes(e.minutes);
                setCommissionData({
                  ...commission,
                  startDate: newDate.toISOString().replace(/.\d+Z$/g, 'Z'),
                });
                setCurrentDatePickingMode(datePickingMode.none);
              }}
            />
          </View>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flexDirection: 'row', margin: 10 }}>
            <Pressable
              onPress={() => {
                setCurrentDatePickingMode(datePickingMode.endDate)
              }}
            >
              <Text>
                {new Date(commission.endDate).toLocaleString('en-us', {
                  month: 'long',
                })}{' '}
                {new Date(commission.endDate).getDate()}{' '}
                {new Date(commission.endDate).getFullYear()}{' '}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setCurrentDatePickingMode(datePickingMode.endTime)
              }}
            >
              <Text>
                {new Date(commission.endDate).getHours() % 12 || 12}:
                {new Date(commission.endDate).getMinutes().toString()
                  .length === 1
                  ? `0${new Date(commission.endDate).getMinutes()}`
                  : new Date(commission.endDate).getMinutes()}{' '}
                {new Date(commission.endDate).getHours() >= 12
                  ? 'pm'
                  : 'am'}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setCurrentDatePickingMode(datePickingMode.endDate)
              }}
            >
              <CalendarIcon width={24} height={15} />
            </Pressable>
            <DatePickerModal
              locale="en"
              mode="single"
              label="Select End Date"
              visible={currentDatePickingMode === datePickingMode.endDate}
              onDismiss={() => setCurrentDatePickingMode(datePickingMode.none)}
              date={new Date(commission.endDate)}
              onConfirm={e => {
                if (e.date !== undefined) {
                  const oldDate = new Date(commission.endDate);
                  const newDate = new Date(
                    e.date.getFullYear(),
                    e.date.getMonth(),
                    e.date.getDate(),
                    oldDate.getHours(),
                    oldDate.getMinutes(),
                  );
                  setCommissionData({
                    ...commission,
                    endDate: newDate.toISOString().replace(/.\d+Z$/g, 'Z'),
                  });
                }
                setCurrentDatePickingMode(datePickingMode.none);
              }}
            />
          </View>
          <View style={{ margin: 5 }}>
            <Pressable
              onPress={() => {
                setCurrentDatePickingMode(datePickingMode.endTime)
              }}
              style={{
                height: 26.4,
                alignContent: 'center',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TimeIcon width={15} height={15} />
            </Pressable>
            <TimePickerModal
              hours={new Date(commission.endDate).getHours()}
              minutes={new Date(commission.endDate).getMinutes()}
              visible={currentDatePickingMode === datePickingMode.endTime}
              onDismiss={() => setCurrentDatePickingMode(datePickingMode.none)}
              onConfirm={e => {
                const newDate = new Date(commission.endDate);
                newDate.setHours(e.hours);
                newDate.setMinutes(e.minutes);
                setCommissionData({
                  ...commission,
                  endDate: newDate.toISOString().replace(/.\d+Z$/g, 'Z'),
                });
                setCurrentDatePickingMode(datePickingMode.none);
              }}
            />
          </View>
        </View>
      </View>
    );
  }
  return (
    <View
      style={{
        flexDirection: 'row',
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        borderRadius: 15,
        padding: 10,
        margin: 15,
        marginBottom: 20,
        backgroundColor: Colors.white,
      }}
    >
      <Text>Timed: </Text>
      <Switch
        trackColor={{ false: Colors.lightGray, true: Colors.darkGray }}
        thumbColor={commission.timed ? Colors.maroon : Colors.darkGray}
        {...Platform.select({
          web: {
            activeThumbColor: Colors.maroon,
          },
        })}
        ios_backgroundColor={Colors.lightGray}
        onValueChange={e => {
          if (e) {
            setCommissionData({
              ...commission,
              timed: true,
              startDate: new Date().toISOString().replace(/.\d+Z$/g, 'Z'),
              endDate: new Date().toISOString().replace(/.\d+Z$/g, 'Z'),
            });
          }
        }}
        value={commission.timed}
      />
    </View>
  );
}
