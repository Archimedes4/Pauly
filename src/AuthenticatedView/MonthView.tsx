import { View, Text, Pressable } from "react-native"
import { useEffect, useState } from "react"
import { findFirstDayinMonth, getDay, getDaysInMonth } from "../Functions/Calendar/calendarFunctions"


function MonthBlock({value, width, height, startDate, daySelected, selectedDates}:{value:number, width: number, height: number, startDate: number, daySelected: number, selectedDates: DateProperty[]}) {
    let textval: number = getDay(value, startDate) ?? 0
    let day = new Date().getDate()
    let index = selectedDates.findIndex((input) => input.Date == textval)
    let var1: DateProperty = selectedDates[index]
    return(
        <View style={{width: width, height: height, borderColor: "black", borderWidth: 2}} id="This">
            { (value >= (startDate - 1) && value <= daySelected) ?
                <View style={{width: width, height: height}}>
                    {
                        (textval != 0) ?
                        <View style={{width: width, height: height, position: "absolute"}}>
                            {
                                (day == (textval)) ?
                                <View style={{width: width, height: height, borderColor: "black", backgroundColor: "red"}} />:
                                <View style={{width: width, height: height}}>
                                    {
                                        (day >= (textval + 1)) ?
                                        <View style={{width: width, height: height, borderColor: "black", backgroundColor: "gray"}} />:
                                        <View style={{width: width, height: height}}>
                                            {
                                                (index !== -1) ?
                                                <View style={{width: width, height: height}}>
                                                    { (var1.ColorName != undefined) ?
                                                        <View style = {{backgroundColor:var1.ColorName!, width: width, height: height, borderColor: "black", borderRadius: 5}}/>:
                                                        <View style={{width: width, height: height, borderColor: "black", backgroundColor: "white"}} />
                                                    }
                                                </View>:
                                                <View style={{width: width, height: height, borderColor: "black",  backgroundColor: "white"}} />
                                            }
                                        </View>
                                    }
                                </View>
                            }
                        </View>:<View style={{backgroundColor: "white", width: width, height: height}}/>
                    }
                </View>:<View style={{backgroundColor: "white", width: width, height: height}}/>
            }
            { (textval >= 1) ?
                <View id="Text" style={{width:  width, height: height, justifyContent: "center", alignContent: "center", alignItems: "center", position: "absolute"}}>
                    {  (index != -1) ?
                        <View>
                            {(var1.SchoolDay != undefined) ?
                                <View>
                                    <View>
                                        <Text style={{color: "black", height: height * 0.03, transform: [{translateX: -width * 0.005}, {translateY: height * 0.4}]}}>var1.SchoolDay ?? "Error"</Text>
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
    const [selectedDates, setSelectedDates] = useState<DateProperty[]>([])
    let Count = getDaysInMonth(new Date())
    let StartDate = findFirstDayinMonth(new Date())
    const [daySelected, setDaySelected] = useState<number>(((Count + StartDate) - 2) - ((Count/7) * 2))
    const thirtyValue = [...Array(30).keys()]
    return(
        <View style={{flexDirection: "row", flexWrap: "wrap", width: width, height: height}}>
            <View style={{width: width * 0.2, height: height * 0.13, justifyContent: "center", alignItems: "center", alignContent: "center", overflow: "hidden"}}><Text numberOfLines={1} style={{width: width * 0.2, textAlign: "center"}}>Monday</Text></View>
            <View style={{width: width * 0.2, height: height * 0.13, justifyContent: "center", alignItems: "center", alignContent: "center", overflow: "hidden"}}><Text numberOfLines={1} style={{width: width * 0.2, textAlign: "center"}}>Tuesday</Text></View>
            <View style={{width: width * 0.2, height: height * 0.13, justifyContent: "center", alignItems: "center", alignContent: "center", overflow: "hidden"}}><Text numberOfLines={1} style={{width: width * 0.2, textAlign: "center"}}>Wednesday</Text></View>
            <View style={{width: width * 0.2, height: height * 0.13, justifyContent: "center", alignItems: "center", alignContent: "center", overflow: "hidden"}}><Text numberOfLines={1} style={{width: width * 0.2, textAlign: "center"}}>Thursday</Text></View>
            <View style={{width: width * 0.2, height: height * 0.13, justifyContent: "center", alignItems: "center", alignContent: "center", overflow: "hidden"}}><Text numberOfLines={1} style={{width: width * 0.2, textAlign: "center"}}>Friday</Text></View>
            { thirtyValue.map((value: number) => (
                <Pressable onPress={() => {setDaySelected(value)}} style={{width: width * 0.2, height: height * 0.145, overflow: "hidden"}} key={value}>
                    <MonthBlock value={value} width={width * 0.2} height={height * 0.145} startDate={StartDate} daySelected={daySelected} selectedDates={selectedDates} />
                </Pressable>
            ))
            }
        </View>
    )
}
