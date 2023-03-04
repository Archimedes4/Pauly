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

import Foundation

// MARK: - Grade11Response
struct Grade11Response: Codable {
    let result, grade: String
    let grade11ResponseClass: Class

    enum CodingKeys: String, CodingKey {
        case result = "Result"
        case grade = "Grade"
        case grade11ResponseClass = "Class"
    }
}

// MARK: - Class
struct Class: Codable {
    let preCalculus30S, appliedMath30S, essentialMath40S, chemistry: [String]
    let english, worldOfReligions, history, gym: [String]
    let biology30S, biology40S, french, art: [String]
    let band, law30S: [String]
    let computerScience30S, firstNations: String
    let pyhsics: [String]

    enum CodingKeys: String, CodingKey {
        case preCalculus30S = "Pre-Calculus 30S"
        case appliedMath30S = "Applied Math 30S"
        case essentialMath40S = "Essential Math 40S"
        case chemistry = "Chemistry"
        case english = "English"
        case worldOfReligions = "World of Religions"
        case history = "History"
        case gym = "Gym"
        case biology30S = "Biology 30S"
        case biology40S = "Biology 40S"
        case french = "French"
        case art = "Art"
        case band = "Band"
        case law30S = "Law 30S"
        case computerScience30S = "Computer Science 30S"
        case firstNations = "First Nations"
        case pyhsics = "Pyhsics"
    }
}

struct CallingResult: Codable {
    let result: String

    enum CodingKeys: String, CodingKey {
        case result = "Result"
    }
}

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
    enum APICallingError: Error{
        case Fatal
        case InvalidURL
    }

    public func loadData(extensionvar: String) async throws -> CallingResult {
        guard let url = URL(string: "https://cae5-24-76-193-238.ngrok.io/\(extensionvar)") else {
            print("Invalid url...")
            throw APICallingError.InvalidURL
        }
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("123456", forHTTPHeaderField: "ngrok-skip-browser-warning")
        do {
            let (data, _) = try await URLSession.shared.data(for: request)
            if let decodedResponse = try? JSONDecoder().decode(CallingResult.self, from: data) {
                return decodedResponse
            }
        } catch {
            print(String(describing: error))
            throw APICallingError.Fatal
        }
        throw APICallingError.Fatal
    }
    public func LoadDataJsonEcoder(extensionvar: String) async throws -> Grade11Response {
        guard let url = URL(string: "https://cae5-24-76-193-238.ngrok.io/\(extensionvar)") else {
            print("Invalid url...")
            throw APICallingError.InvalidURL
        }
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("123456", forHTTPHeaderField: "ngrok-skip-browser-warning")
        do {
            let (data, _) = try await URLSession.shared.data(for: request)
            if let decodedResponse = try? JSONDecoder().decode(Grade11Response.self, from: data) {
                return decodedResponse
            }
        } catch {
            print(String(describing: error))
            throw APICallingError.Fatal
        }
        throw APICallingError.Fatal
    }
}

