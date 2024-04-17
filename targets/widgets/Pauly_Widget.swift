//
//  Pauly_Widget.swift
//  Pauly Widget
//
//  Created by Andrew Mainella on 2024-04-15.
//

import WidgetKit
import SwiftUI
import MSAL

struct WidgetResultSchedule: Decodable {
    var isSchoolDay: Bool
    var date: Int
    var startTime: String?
    var scheduleDescription: String?
    var schoolDayShorthand: String?
}

struct WidgetApiResult: Decodable {
    var completed: String
    var data: [WidgetResultSchedule]
}

func getAccessToken(completion: @escaping (_ result: String)->Void) {
    do {
        let clientId = "d585b96d-aa24-4276-9d4f-a3538789a10e"
        
        guard let authorityURL = URL(string: "https://login.microsoftonline.com/551df04d-543a-4d61-955e-e4294c4cf950") else {
            completion("Error")
            return
        }
        let authority = try MSALAADAuthority(url: authorityURL)
                
        let msalConfiguration = MSALPublicClientApplicationConfig(clientId: clientId, redirectUri: "msauth.Archimedes4.App-Clip-Testing://auth", authority: authority)
        let applicationContext = try MSALPublicClientApplication(configuration: msalConfiguration)
        
        let msalParameters = MSALParameters()
        msalParameters.completionBlockQueue = DispatchQueue.main
        applicationContext.getCurrentAccount(with: msalParameters, completionBlock: { (currentAccount, previousAccount, error) in
            if let currentAccount = currentAccount {
                let parameters = MSALSilentTokenParameters(scopes: ["api://\(clientId)/api/commissions"], account: currentAccount)
                applicationContext.acquireTokenSilent(with: parameters) { (result, error) in
                    guard let result = result else {
                        completion("Error")
                        return
                    }
                    completion(result.accessToken)
                    return
                }
            } else {
                completion("Error_Account")
                return
            }
        })
    } catch {
        completion("Error")
        return
    }
}

func getSchedule(token: String, completion: @escaping (_ result: WidgetApiResult?)->Void) {
    let url = URL(string: "https://pauly-functions.azurewebsites.net/api/getWidgetInfo")!

    var request = URLRequest(url: url)
    request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    
    let task = URLSession.shared.dataTask(with: request) { data, response, error in
        if let data = data {
            if let decodedData = try? JSONDecoder().decode(WidgetApiResult.self, from: data) {
                completion(decodedData)
            } else {
                completion(nil)
            }
        } else if let error = error {
            completion(nil)
        }
    }
    task.resume()
}

func getEntries(for configuration: ConfigurationAppIntent) async -> [SchoolDayEntry]  {
    await withCheckedContinuation{ continuation in
        var entries: [SchoolDayEntry] = []
        getAccessToken() { result in
            if (result == "Error") {
                entries.append(SchoolDayEntry(configuration: configuration, widgetState: WidgetState.Failed, date: .now))
                continuation.resume(returning: entries)
                return
            } else if (result == "Error_Account") {
                entries.append(SchoolDayEntry(configuration: configuration, widgetState: WidgetState.NoAuth, date: .now))
                continuation.resume(returning: entries)
                return
            } else {
                getSchedule(token: result) { scheduleResult in
                    if (scheduleResult != nil) {
                        for x in scheduleResult!.data {
                            var components = DateComponents()
                            if (x.date < Calendar.current.component(.day, from: .now)) {
                                components.timeZone = TimeZone.current
                                components.year = Calendar.current.component(.year, from: .now)
                                components.month = Calendar.current.component(.month, from: .now) + 1
                                components.day = x.date
                                components.hour = 0
                            } else {
                                components.timeZone = TimeZone.current
                                components.year = Calendar.current.component(.year, from: .now)
                                components.month = Calendar.current.component(.month, from: .now)
                                components.day = x.date
                                components.hour = 0
                                
                            }
                            let entryDate = Calendar.current.date(from: components)
                            print(entryDate)
                            if (entryDate == nil) {
                                entries = []
                                entries.append(SchoolDayEntry(configuration: configuration, widgetState: WidgetState.Failed, date: .now))
                                continuation.resume(returning: entries)
                                return
                            }
                            if (x.isSchoolDay) {
                                entries.append(SchoolDayEntry(configuration: configuration, widgetState: WidgetState.School, startTime: x.startTime, scheduleDescription: x.scheduleDescription, schoolDayShorthand: x.schoolDayShorthand, date: entryDate!))
                            } else {
                                entries.append(SchoolDayEntry(configuration: configuration, widgetState: WidgetState.NoSchool, date: entryDate!))
                            }
                        }
                        continuation.resume(returning: entries)
                        return
                    } else {
                        entries.append(SchoolDayEntry(configuration: configuration, widgetState: WidgetState.Failed, date: .now))
                        continuation.resume(returning: entries)
                        return
                    }
                }
            }
        }
    }
}

struct Provider: AppIntentTimelineProvider {
    func placeholder(in context: Context) -> SchoolDayEntry {
        SchoolDayEntry(configuration: ConfigurationAppIntent(), widgetState: WidgetState.Loading, date: Date())
    }

    func snapshot(for configuration: ConfigurationAppIntent, in context: Context) async -> SchoolDayEntry {
        SchoolDayEntry(configuration: ConfigurationAppIntent(), widgetState: WidgetState.Loading, startTime: "8:30", scheduleDescription: "Early Dismisal", schoolDayShorthand: "A", date: .now)
    }
    
    func timeline(for configuration: ConfigurationAppIntent, in context: Context) async -> Timeline<SchoolDayEntry> {
        let entries: [SchoolDayEntry] = await getEntries(for: configuration)
        print(entries)
        var updateDate: Date = .now
        if (configuration.refreshInterval == RefreshInterval.hourly) {
            updateDate = Calendar.current.date(byAdding: .hour, value: 1, to: .now)!
        } else if (configuration.refreshInterval == RefreshInterval.daily) {
            updateDate = Calendar.current.date(byAdding: .day, value: 1, to: .now)!
        } else if (configuration.refreshInterval == RefreshInterval.weekly) {
            updateDate = Calendar.current.date(byAdding: .day, value: 7, to: .now)!
        }
        return Timeline(entries: entries, policy: .after(updateDate))
    }
}

enum WidgetState {
    case Loading, NoAuth, NoSchool, School, Failed
}


struct SchoolDayEntry: TimelineEntry {
    let configuration: ConfigurationAppIntent
    var widgetState: WidgetState
    var startTime: String?
    var scheduleDescription: String?
    var schoolDayShorthand: String?
    var date: Date
}

struct GenericView: View {
    let text: String
    let size: Int
    init(text: String, size: Int) {
        self.text = text
        self.size = size
    }
    var body: some View {
        VStack {
            Spacer()
            Spacer()
            Image("PaulyLogo")
                .resizable()
                .aspectRatio(contentMode: .fit)
            Spacer()
            HStack {
                Spacer()
                Text(text)
                    .foregroundStyle(Color.white)
                    .lineLimit(1)
                    .minimumScaleFactor(0.5)
                    .scaledToFill()
                    .font(Font.system(size: CGFloat(size)))
                Spacer()
            }
            Spacer()
        }
    }
}

struct Pauly_WidgetEntryView : View {
    let dateFormatter = DateFormatter()
    var entry: Provider.Entry

    var body: some View {
        if (entry.scheduleDescription != nil && entry.schoolDayShorthand != nil && entry.startTime != nil && entry.widgetState == WidgetState.School) {
            GeometryReader{ geo in
                ZStack{
                    VStack {
                        Text(entry.date, format: .dateTime.weekday(.wide))
                            .scaledToFill()
                            .lineLimit(1)
                            .minimumScaleFactor(0.5)
                            .padding(.top)
                            .foregroundColor(.white)
                            .font(Font.custom("Futura", size: 25, relativeTo: .title))
                            .frame(height: geo.size.height * 0.3)
                        HStack{
                            Spacer()
                            Text(entry.scheduleDescription ?? "")
                                .foregroundColor(.white)
                                .font(Font.custom("Futura", size: 15, relativeTo: .title))
                                .lineLimit(1)
                                .minimumScaleFactor(0.1)
                                .scaledToFill()
                            Spacer()
                        }
                        .frame(height: geo.size.height * 0.2)
                        .background(Color.cutomGray)
                        HStack(alignment: .center){
                            Text(entry.schoolDayShorthand ?? "")
                                .font(Font.custom("Futura Bold", size: 50, relativeTo: .largeTitle))
                                .foregroundColor(.white)
                                .padding(.bottom)
                                .frame(width: geo.size.width * 0.3, alignment: .trailing)
                            Text(entry.startTime ?? "")
                                .frame(width: geo.size.width * 0.6, alignment: .center)
                                .font(Font.custom("Futura", size: 48, relativeTo: .largeTitle))
                                .foregroundColor(.white)
                                .padding(.bottom)
                                .lineLimit(1)
                                .minimumScaleFactor(0.5)
                                .scaledToFill()
                                
                            
                        }.offset(y: -geo.size.height * 0.125)
                    }.background(Color.marron)
                }
            }
        } else if (entry.widgetState == WidgetState.Loading) {
            GenericView(text: "Loading", size: 15)
        } else if (entry.widgetState == WidgetState.NoAuth) {
            GenericView(text: "Please Login", size: 15)
        } else if (entry.widgetState == WidgetState.NoSchool) {
            GeometryReader{ geo in
                ZStack{
                    VStack {
                        Text(entry.date, format: .dateTime.weekday(.wide))
                            .frame(width: geo.size.width, height: geo.size.height * 0.2)
                            .foregroundColor(.white)
                            .font(Font.custom("Futura", size: 30, relativeTo: .title))
                            .padding(.top)
                            .minimumScaleFactor(0.5)
                            .lineLimit(1)
                            .scaledToFill()
                           
                        HStack{
                            Spacer()
                            Text("No School")
                                .foregroundColor(.white)
                                .font(Font.custom("Futura", size: 20, relativeTo: .title))
                                .lineLimit(1)
                                .minimumScaleFactor(0.5)
                                .scaledToFill()
                            Spacer()
                        }
                        .frame(height: geo.size.height * 0.55)
                        .background(Color.cutomGray)
                    }.background(Color.marron)
                }
            }
        } else {
            GenericView(text: "Something Went Wrong", size: 10)
        }
    }
}


#Preview(as: .systemSmall) {
    Pauly_Widget()
} timeline: {
    SchoolDayEntry(configuration: ConfigurationAppIntent(), widgetState: WidgetState.Loading, startTime: nil, scheduleDescription: nil, schoolDayShorthand: nil, date: .now)
    SchoolDayEntry(configuration: ConfigurationAppIntent(), widgetState: WidgetState.School, startTime: "18:30", scheduleDescription: "Regular Schedule", schoolDayShorthand: "A", date: .now)
    SchoolDayEntry(configuration: ConfigurationAppIntent(), widgetState: WidgetState.NoSchool, startTime: "18:30", scheduleDescription: "Regular Schedule", schoolDayShorthand: "A", date: .now)
    SchoolDayEntry(configuration: ConfigurationAppIntent(), widgetState: WidgetState.NoAuth, startTime: "18:30", scheduleDescription: "Regular Schedule", schoolDayShorthand: "A", date: .now)
    SchoolDayEntry(configuration: ConfigurationAppIntent(), widgetState: WidgetState.Failed, startTime: "18:30", scheduleDescription: "Regular Schedule", schoolDayShorthand: "A", date: .now)
}

extension Color {
    static let marron = Color("Maroon")
    static let cutomGray = Color("DarkGray")
}
