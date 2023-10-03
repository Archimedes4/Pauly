import { View, Text, Pressable } from "react-native"
import { useEffect, useState } from "react"
import { findFirstDayinMonth, getDay, getDaysInMonth } from "../Functions/Calendar/calendarFunctions"
import React from "react"
import { getSchoolDays } from "../Functions/Calendar/calendarFunctionsGraph"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "../Redux/store"
import { loadingStateEnum } from "../types"
import { monthViewSlice } from "../Redux/reducers/monthViewReducer"

function MonthBlock({value, width, height, startDate, daySelected}:{value:number, width: number, height: number, startDate: number, daySelected: number}) {
  let textval: number = getDay(value, startDate) ?? 0
  let day = new Date().getDate()
  const monthViewData = useSelector((state: RootState) => state.monthView).find((e) => {e.startTime === e.endTime})
  
  return(
    <View style={{width: width, height: height, borderColor: "black", borderWidth: 2}} id="This">
      { (value >= (startDate - 1) && value <= daySelected && textval !== 0) ?
        <View style={{width: width, position: "absolute", height: height, borderColor: "black", backgroundColor: (day == (textval)) ? "red":(day >= (textval + 1)) ? "gray":(monthViewData !== undefined) ? monthViewData.eventColor:"white"}} />
        :<View style={{backgroundColor: "white", width: width, height: height}}/>
      }
      { (textval >= 1) ?
        <View id="Text" style={{width:  width, height: height, justifyContent: "center", alignContent: "center", alignItems: "center", position: "absolute"}}>
          {  (monthViewData !== undefined) ?
              <View>
                {(monthViewData.scheduleData != undefined) ?
                  <View>
                    <View>
                      <Text style={{color: "black", height: height * 0.03, transform: [{translateX: -width * 0.005}, {translateY: height * 0.4}]}}>{monthViewData.scheduleData.}</Text>
                    </View>
                    <Text style={{color: "black"}}>{textval}</Text>
                  </View>:<Text style={{color: "black", zIndex: 2}}>{textval}</Text>
                }
              </View>:<Text id="This is text" style={{color: "black", zIndex: 2}}>{textval}</Text>
            }
        </View>:null
      }
    </View>
  )
}

export default function MonthView({width, height}:{width: number, height: number}) {
  // const [selectedDates, setSelectedDates] = useState<dateProperty[]>([])
  let Count = getDaysInMonth(new Date())
  let StartDate = findFirstDayinMonth(new Date())
  const [daySelected, setDaySelected] = useState<number>(((Count + StartDate) - 2) - ((Count/7) * 2))
  const thirtyValue = [...Array(30).keys()]
  const monthViewData = useSelector((state: RootState) => state.monthView)
  const dispatch = useDispatch()

  async function loadData() {
    if (monthViewData.length <= 0) {
      const result = await getSchoolDays(new Date())
      if (result.result === loadingStateEnum.success && result.data !== undefined) {
        dispatch(monthViewSlice.actions.setMonthViewData(result.data))
      } 
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return(
    <View style={{flexDirection: "row", flexWrap: "wrap", width: width, height: height}}>
      <View style={{width: width * 0.2, height: height * 0.13, justifyContent: "center", alignItems: "center", alignContent: "center", overflow: "hidden"}}><Text numberOfLines={1} style={{width: width * 0.2, textAlign: "center"}}>Monday</Text></View>
      <View style={{width: width * 0.2, height: height * 0.13, justifyContent: "center", alignItems: "center", alignContent: "center", overflow: "hidden"}}><Text numberOfLines={1} style={{width: width * 0.2, textAlign: "center"}}>Tuesday</Text></View>
      <View style={{width: width * 0.2, height: height * 0.13, justifyContent: "center", alignItems: "center", alignContent: "center", overflow: "hidden"}}><Text numberOfLines={1} style={{width: width * 0.2, textAlign: "center"}}>Wednesday</Text></View>
      <View style={{width: width * 0.2, height: height * 0.13, justifyContent: "center", alignItems: "center", alignContent: "center", overflow: "hidden"}}><Text numberOfLines={1} style={{width: width * 0.2, textAlign: "center"}}>Thursday</Text></View>
      <View style={{width: width * 0.2, height: height * 0.13, justifyContent: "center", alignItems: "center", alignContent: "center", overflow: "hidden"}}><Text numberOfLines={1} style={{width: width * 0.2, textAlign: "center"}}>Friday</Text></View>
      { thirtyValue.map((value: number) => (
        <View style={{width: width * 0.2, height: height * 0.145, overflow: "hidden"}} key={value}>
          <MonthBlock value={value} width={width * 0.2} height={height * 0.145} startDate={StartDate} daySelected={daySelected} />
        </View>
      ))}
    </View>
  )
}
