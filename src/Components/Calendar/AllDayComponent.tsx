import { Colors } from "@constants";
import { addEventSlice } from "@redux/reducers/addEventReducer";
import store, { RootState } from "@redux/store";
import React, { useEffect, useState } from "react"
import { Pressable, View, Text } from "react-native"
import { useSelector } from "react-redux";
import { UpIcon } from "../Icons";
import calculateFontSize from "@src/utils/ultility/calculateFontSize";

export default function AllDayComponent({day, width, topPadding}:{day: string, width: number, topPadding: number}) {
  const currentEvents = useSelector((state: RootState) => state.currentEvents);
  const [allDayEvents, setAllDayEvents] = useState<eventType[]>([]);
  const [allDayEventsExpanded, setAllDayEventsExpanded] = useState<boolean>(false);
  useEffect(() => {
    setAllDayEvents(currentEvents.filter((e) => {return e.allDay === true && new Date(e.startTime).getDate() === new Date(day).getDate()}))
  }, [currentEvents])

  if (allDayEvents.length >= 1) {
    return (
      <Pressable onPress={() => {setAllDayEventsExpanded(!allDayEventsExpanded)}} style={{position: 'absolute', backgroundColor: Colors.white + "75", width, zIndex: 3, top: topPadding + 2}}>
        {allDayEvents.length >= 2 && !allDayEventsExpanded ?
          <View style={{backgroundColor: Colors.lightGray, borderRadius: 15, padding: 5, margin: 5}}>
            <Text style={{fontFamily: 'Roboto', fontSize: calculateFontSize(width, 14, `${allDayEvents.length} all day events`)}}>{allDayEvents.length} all day events</Text>
          </View>:
          <View>
            {allDayEvents.map((event) => (
              <Pressable
                key={event.id}
                onPress={() => {
                  store.dispatch(addEventSlice.actions.setIsShowingAddDate(true));
                  store.dispatch(addEventSlice.actions.setSelectedEvent(event));
                }}
                style={{backgroundColor: Colors.lightGray, borderRadius: 15, padding: 5, margin: 5}}
              >
                <Text style={{fontFamily: 'Roboto'}} numberOfLines={allDayEventsExpanded ? undefined:1}>{event.name}</Text>
              </Pressable>
            ))}
            {(allDayEvents.length >= 2) ?
              <Pressable onPress={() => {setAllDayEventsExpanded(!allDayEventsExpanded)}} style={{flexDirection: 'row', backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.black, borderRadius: 15, padding: 5, margin: 5}}>
                <UpIcon width={14} height={14} />
                <Text style={{marginLeft: 3}}>Close</Text>
              </Pressable>:null
            }
          </View>
        }
      </Pressable>
    )
  }
  
  return null
}