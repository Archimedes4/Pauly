//
//  CalendarPageView.swift
//  Pauly
//
//  Created by Andrew Mainella on 2023-03-03.
//

import Foundation
import SwiftUI

enum SelectedCalendarMode: String, CaseIterable{
    case Day = "Day"
    case Week = "Week"
    case Month = "Month"
}

struct CalendarHomePage: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    @Environment(\.colorScheme) var colorScheme
    @State var SelectedMode: SelectedCalendarMode.RawValue = SelectedCalendarMode.Day.rawValue
    var body: some View{
        HStack{
            Button(){
                WindowMode.SelectedWindowMode = .HomePage
            } label: {
                HStack {
                    Image(systemName: "chevron.backward")
                        .padding(.leading)
                    Text("Back")
                }
            }
            VStack{
                Picker("Apperance", selection: $SelectedMode){
                    ForEach(SelectedCalendarMode.allCases, id: \.rawValue){ value in
                        Text(value.rawValue)
                          
                    }
                }.pickerStyle(.segmented)
                .tint(colorScheme == .dark ? Color.black : Color.white)
            }
        }
        if SelectedMode == "Day" {
            DayView()
        } else {
            if SelectedMode == "Week" {
                WeekView()
            } else {
                if SelectedMode == "Month" {
                    MonthViewMain()
                }
            }
        }
    }
}

struct DayView: View{
    @State var SelectedDay: Date = Date.now
    @Environment(\.colorScheme) var colorScheme
    
    var body: some View{
        VStack{
            HStack{
                Button(){
                    SelectedDay = Calendar.current.date(byAdding: .day, value: -1, to: SelectedDay)!
                } label: {
                    Image(systemName: "chevron.left")
                }
                Text(SelectedDay.formatted(date: .long, time: .omitted))
                Button(){
                    SelectedDay = Calendar.current.date(byAdding: .day, value: 1, to: SelectedDay)!
                } label: {
                    Image(systemName: "chevron.forward")
                }
                if SelectedDay.formatted(date: .numeric, time: .omitted) != Date.now.formatted(date: .numeric, time: .omitted){
                    Button(){
                        SelectedDay = Date.now
                    } label: {
                        Text("Today")
                    }
                }
            }
            ScrollView{
                ForEach(0..<24){value in
                    HStack{
                        Text("\((value % 12) + 1)")
                            .foregroundColor(colorScheme == .dark ? Color.white : Color.black)
                            .background(
                            Circle()
                                .foregroundColor(colorScheme == .dark ? Color.black : Color.white)
                                .border(.gray)
                                .padding()
                            )
                        Divider()
                    }.padding()
                        .frame(maxWidth: .infinity)
                }
            }.frame(maxWidth: .infinity)
        }
    }
}

struct WeekView: View{
    @State var SelectedDay: Date = Date.now
    @State var Days: [Date] = []
    var body: some View{
        VStack{
            HStack{
                Button(){
                    SelectedDay = Calendar.current.date(byAdding: .day, value: -7, to: SelectedDay)!
                    Days = GetDates(CurrentDate: SelectedDay)
                } label: {
                    Image(systemName: "chevron.left")
                }
                Text(SelectedDay, format: .dateTime.month().year())
                Button(){
                    SelectedDay = Calendar.current.date(byAdding: .day, value: 7, to: SelectedDay)!
                    Days = GetDates(CurrentDate: SelectedDay)
                } label: {
                    Image(systemName: "chevron.forward")
                }
                if SelectedDay.formatted(date: .numeric, time: .omitted) != Date.now.formatted(date: .numeric, time: .omitted){
                    Button(){
                        SelectedDay = Date.now
                    } label: {
                        Text("Today")
                    }
                }
            }
            ScrollView{
                HStack{
                    ForEach(Days, id: \.self){ WeekDay in
                        Text(WeekDay, format: .dateTime.day())
                            .background(Circle().foregroundColor(.red))
                    }
                }.onAppear(){
                    Days = GetDates(CurrentDate: SelectedDay)
                }
            }
        }
    }
    func GetDates(CurrentDate: Date) -> [Date] {
        let weekday = Calendar.current.component(.weekday, from: CurrentDate)
        var result: [Date] = []
        for x in 0..<weekday{
            result.append(Calendar.current.date(byAdding: .day, value: -x, to: CurrentDate)!)
        }
        for x in (weekday..<7).enumerated(){
            result.append(Calendar.current.date(byAdding: .day, value: (x.offset + 1), to: CurrentDate)!)
        }
        result.sort()
        return result
    }
}

struct MonthViewMain: View{
    let date: Date
    let dateFormatter: DateFormatter
    let columns = [
        GridItem(.flexible(), spacing: 0),
        GridItem(.flexible(), spacing: 0),
        GridItem(.flexible(), spacing: 0),
        GridItem(.flexible(), spacing: 0),
        GridItem(.flexible(), spacing: 0)
    ]
    
    init() {
        date = Date()
        dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "MMMM yyyy"
    }
    
    var body: some View{
        GeometryReader{ geometry1 in
            LazyVGrid(columns: columns, spacing: 0){
                let Count = Functions().getDaysInMonth(Input: Date.now)
                let StartDate = Functions().FindFirstDayinMonth()
                ForEach(0..<5){ day in
                    if day == 0{
                        Text("Monday")
                            .frame(width: geometry1.size.width * 0.2, height: geometry1.size.height * 0.13)
                    }
                    if day == 1{
                        Text("Tuesday")
                            .frame(width: geometry1.size.width * 0.2, height: geometry1.size.height * 0.13)
                    }
                    if day == 2{
                        Text("Wensday")
                            .frame(width: geometry1.size.width * 0.2, height: geometry1.size.height * 0.13)
                    }
                    if day == 3{
                        Text("Thursday")
                            .frame(width: geometry1.size.width * 0.2, height: geometry1.size.height * 0.13)
                    }
                    if day == 4{
                        Text("Friday")
                            .frame(width: geometry1.size.width * 0.2, height: geometry1.size.height * 0.13)
                    }
                }
                let daySelected: Int = (((Count + StartDate) - 2) - ((Count/7) * 2))
                ForEach(0..<30){ value in
                    ZStack{
                        if value >= (StartDate - 1) && value <= daySelected {
                            let textval: Int = Functions().getDay(value: value, startdate: StartDate)
                            let date = Date()
                            let calendar = Calendar.current
                            let day = calendar.component(.day, from: date)
                            if day == (textval){
                                Rectangle()
                                    .foregroundColor(.red)
                                    .frame(width: geometry1.size.width * 0.2, height: geometry1.size.height * 0.145)
                                    .border(Color.black)
                            } else{
                                if day >= (textval + 1){
                                    Rectangle()
                                        .foregroundColor(.gray)
                                        .frame(width: geometry1.size.width * 0.2, height: geometry1.size.height * 0.145)
                                        .border(Color.black)
                                } else{
                                    Rectangle()
                                        .foregroundColor(.white)
                                        .frame(width: geometry1.size.width * 0.2, height: geometry1.size.height * 0.145)
                                        .border(Color.black)
                                }
                            }
                            VStack{
                                Spacer()
                                HStack{
                                    Spacer()
                                    Text("\(textval)")
                                        .foregroundColor(Color.black)
                                    Spacer()
                                }
                                Spacer()
                            }
                        } else {
                            Rectangle()
                                .foregroundColor(.white)
                                .frame(width: geometry1.size.width * 0.2, height: geometry1.size.height * 0.145)
                                .border(Color.black)
                        }
                    }.frame(width: geometry1.size.width * 0.2, height: geometry1.size.height * 0.145)
                }
            }.padding(0)
        }
    }
}

struct CalendarUI: UIViewRepresentable {
    
    let interval: DateInterval
    
    func makeUIView(context: Context) -> UICalendarView {
        let view = UICalendarView()
        view.calendar = Calendar.current
        view.availableDateRange = interval
        return view
    }
    
    func updateUIView(_ uiView: UICalendarView, context: Context) {
        
    }
    
}
