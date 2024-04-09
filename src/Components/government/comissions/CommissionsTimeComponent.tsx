import { View, Text, Switch, Pressable } from 'react-native'
import React, { useState } from 'react'
import { Colors } from '@constants';
import { DatePickerModal, TimePickerModal } from 'react-native-paper-dates';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';

enum datePickingMode {
  none,
  startTime,
  endTime,
  startDate,
  endDate,
}

export default function CommissionsTimeComponent({commission, setCommissionData}:{commission: commissionType, setCommissionData: (item: commissionType) => void}) {
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
          backgroundColor: Colors.white
        }}
      >
        <View style={{ flexDirection: 'row' }}>
          <Text>Timed: </Text>
          <Switch
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={commission.timed ? '#f5dd4b' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={e => {
              if (!e) {
                setCommissionData({
                  ...commission,
                  timed: false
                });
              }
            }}
            value={commission.timed}
          />
        </View>
        <View
          style={{
            alignContent: 'center',
            alignItems: 'center',
            justifyContent: 'center',
            width,
          }}
        >
          <Text>Start Date</Text>
          <Pressable
            style={{ margin: 5 }}
            onPress={() => {
              setCurrentDatePickingMode(datePickingMode.startDate);
            }}
          >
            <Text>Pick Start Time</Text>
          </Pressable>
          <TimePickerModal
            hours={new Date(commission.startDate).getHours()}
            minutes={new Date(commission.startDate).getMinutes()}
            visible={currentDatePickingMode === datePickingMode.startDate}
            onDismiss={() =>
              setCurrentDatePickingMode(datePickingMode.none)
            }
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
          <Pressable
            style={{ margin: 5 }}
            onPress={() => {
              setCurrentDatePickingMode(datePickingMode.startDate);
            }}
          >
            <Text>Pick Start Date</Text>
          </Pressable>
          <DatePickerModal
            locale="en"
            mode="single"
            label="Select Date"
            visible={currentDatePickingMode === datePickingMode.startDate}
            onDismiss={() =>
              setCurrentDatePickingMode(datePickingMode.none)
            }
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
        <View
          style={{
            alignContent: 'center',
            alignItems: 'center',
            justifyContent: 'center',
            width,
          }}
        >
          <Text>End Date</Text>
          <Pressable
            style={{ margin: 5 }}
            onPress={() => {
              setCurrentDatePickingMode(datePickingMode.endDate);
            }}
          >
            <Text>Pick End Time</Text>
          </Pressable>
          <TimePickerModal
            hours={new Date(commission.endDate).getHours()}
            minutes={new Date(commission.endDate).getMinutes()}
            visible={currentDatePickingMode === datePickingMode.endTime}
            onDismiss={() =>
              setCurrentDatePickingMode(datePickingMode.none)
            }
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
          <Pressable
            style={{ margin: 5 }}
            onPress={() => {
              setCurrentDatePickingMode(datePickingMode.endDate);
            }}
          >
            <Text>Pick End Date</Text>
          </Pressable>
          <DatePickerModal
            locale="en"
            mode="single"
            label="Select Date"
            visible={currentDatePickingMode === datePickingMode.endDate}
            onDismiss={() =>
              setCurrentDatePickingMode(datePickingMode.none)
            }
            date={new Date(commission.endDate)}
            onConfirm={(e) => {
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
      </View>
    )
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
        backgroundColor: Colors.white
      }}
    >
      <Text>Timed: </Text>
      <Switch
        trackColor={{ false: '#767577', true: '#81b0ff' }}
        thumbColor={commission.timed ? '#f5dd4b' : '#f4f3f4'}
        ios_backgroundColor="#3e3e3e"
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
  )
}