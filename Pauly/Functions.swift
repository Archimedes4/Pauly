//
//  Functions.swift
//  Pauly
//
//  Created by Andrew Mainella on 2023-02-25.
//

import Foundation

// This file was generated from JSON Schema using quicktype, do not modify it directly.
// To parse the JSON, add this file to your project and do:
//
//   let grade11Response = try? JSONDecoder().decode(Grade11Response.self, from: jsonData)

//// MARK: - Grade11Response
//struct Grade11Response: Codable {
//    let result, grade: String
//    let classes: [Class]
//
//    enum CodingKeys: String, CodingKey {
//        case result = "Result"
//        case grade = "Grade"
//        case classes = "Classes"
//    }
//}
//
//// MARK: - Class
//struct Class: Codable {
//    let name: String
//    let teachers: [String]
//
//    enum CodingKeys: String, CodingKey {
//        case name = "Name"
//        case teachers
//    }
//}
//
//struct CallingResult: Codable {
//    let result: String
//    let Grade: Int?
//
//    enum CodingKeys: String, CodingKey {
//        case result = "Result"
//        case Grade = "Grade"
//    }
//}
//
//// MARK: - CalendarResopnse
//struct CalendarResopnse: Codable {
//    let result, year: String
//    let data: [Datum]
//
//    enum CodingKeys: String, CodingKey {
//        case result = "Result"
//        case year = "Year"
//        case data = "Data"
//    }
//}
//
//// MARK: - Datum
//struct Datum: Codable {
//    let month, date, value: Int
//
//    enum CodingKeys: String, CodingKey {
//        case month = "Month"
//        case date = "Date"
//        case value = "Value"
//    }
//}
//
//// MARK: - UserListResopnce
//struct UserListResopnce: Codable {
//    let result: String
//    let users: [String]
//
//    enum CodingKeys: String, CodingKey {
//        case result = "Result"
//        case users = "Users"
//    }
//}
//
//// MARK: - ChatListResponce
//struct ChatListResponce: Codable {
//    let result: String
//    let data: [Datum1]
//
//    enum CodingKeys: String, CodingKey {
//        case result = "Result"
//        case data = "Data"
//    }
//}
//
//// MARK: - Datum
//struct Datum1: Codable {
//    let users: [String]
//    let chatID: Int
//
//    enum CodingKeys: String, CodingKey {
//        case users = "Users"
//        case chatID = "ChatId"
//    }
//}
//
//// MARK: - MessageResponce
//struct MessageResponce: Codable {
//    let result: String
//    let data: [Datum2]
//
//    enum CodingKeys: String, CodingKey {
//        case result = "Result"
//        case data = "Data"
//    }
//}
//
//// MARK: - Datum
//struct Datum2: Codable {
//    let sender, message, time: String
//    var ErrorType: String?
//    let ErrorID: Int?
//
//    enum CodingKeys: String, CodingKey {
//        case sender = "Sender"
//        case message = "Message"
//        case time = "Time"
//        case ErrorType = "Error"
//        case ErrorID = "ErrorID"
//    }
//}
//
//// MARK: - MessageResponce
//struct NotificationResonpce: Codable {
//    let result: String
//    let data: [Int]
//
//    enum CodingKeys: String, CodingKey {
//        case result = "Result"
//        case data = "Data"
//    }
//}

class Functions {
    func getDaysInMonth(Input: Date) -> Int{
        let calendar = Calendar.current

        let dateComponents = DateComponents(year: calendar.component(.year, from: Input), month: calendar.component(.month, from: Input))
        let date = calendar.date(from: dateComponents)!

        let range = calendar.range(of: .day, in: .month, for: date)!
        let numDays = range.count

        return numDays
    }
    func FindFirstDayinMonth() -> Int {
        let dateComponents = Calendar.current.dateComponents([.year, .month], from: Date())
        let startOfMonth = Calendar.current.date(from: dateComponents)!
        let myCalendar = Calendar(identifier: .gregorian)
        var weekDay = myCalendar.component(.weekday, from: startOfMonth)
        weekDay = weekDay - 1
        return weekDay
    }
    func getDay(value: Int, startdate: Int) -> Int{
        var offset: Int = 0
        let var1: Double = Double(value)/5.0
        let var2: Int = Int(floor(var1))
        let var4: Int = var2 * 2
        offset += var4
        let result: Int = ((value - startdate) + 2) + offset
        return result
    }
}
