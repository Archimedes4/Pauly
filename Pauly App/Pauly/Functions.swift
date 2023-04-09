//
//  Functions.swift
//  Pauly
//
//  Created by Andrew Mainella on 2023-02-25.
//

import Foundation
import FirebaseFirestore

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
    func getDay(value: Int, startdate: Int) -> Int?{
        var offset: Int = 0
        let var1: Double = Double(value)/5.0
        let var2: Int = Int(floor(var1))
        let var4: Int = var2 * 2
        offset += var4
        let result: Int = ((value - startdate) + 2) + offset
        let DayInt = Calendar.current.dateComponents([.day], from: Date().endOfMonth()).day
        if result >= (DayInt! + 1) {
            return nil
        }
        return result
    }
    func GetCardData(CardIds: [Int], completion: @escaping([CardType])->()) {
        var outputCards: [CardType] = []
        
        let db = Firestore.firestore()
        
        for x in CardIds{
            let docRef = db.collection("Cards").document("\(x)")
            docRef.getDocument { (document, error) in
                guard error == nil else {
                    print("error", error ?? "")
                    return
                }
                
                if let document = document, document.exists {
                    let data = document.data()
                    if let data = data {
                        let cardDataValueFire = data["CardData"] as! [String]
                        let cardDataNameFire = data["CardDataName"] as! [String]
                        let BackgroundStyle = data["BackgroundStyle"] as! Int
                        let Opacity = data["Opacity"] as! String
                        let cardDataTypeFire: [String] = data["CardDataType"] as? NSArray as? [String] ?? []
                        var CardDataIn: [DataIdType] = []
                        let Use = data["Use"] as! String
                        for y in 0..<cardDataNameFire.count{
                            CardDataIn.append(DataIdType(Name: cardDataNameFire[y], Id: cardDataValueFire[y], FileType: cardDataTypeFire[y]))
                        }
                        if BackgroundStyle == 0{
                            let captionFire = data["Caption"] as! String
                            let titleFire = data["Title"] as! String
                            let ColorFire = data["Color"] as! String
                            outputCards.append(CardType(Use: Use, Title: titleFire, Caption: captionFire, ColorType: ColorFire, ImageRef: nil, LongText: nil, BackgroundStyle: BackgroundStyle, FirebaseID: x, Opacity: Double(Opacity)!, CardData: CardDataIn))
                        } else {
                            if BackgroundStyle == 1{
                                let ImageRefFire = data["ImageRef"] as! String
                                outputCards.append(CardType(Use: Use, Title: nil, Caption: nil, ColorType: nil, ImageRef: ImageRefFire, LongText: nil, BackgroundStyle: BackgroundStyle, FirebaseID: x, Opacity: Double(Opacity)!, CardData: CardDataIn))
                            } else {
                                if BackgroundStyle == 2{
                                    let captionFire = data["Caption"] as! String
                                    let titleFire = data["Title"] as! String
                                    let ImageRefFire = data["ImageRef"] as! String
                                    outputCards.append(CardType(Use: Use, Title: titleFire, Caption: captionFire, ColorType: nil, ImageRef: ImageRefFire, LongText: nil, BackgroundStyle: BackgroundStyle, FirebaseID: x, Opacity: Double(Opacity)!, CardData: CardDataIn))
                                } else {
                                    if BackgroundStyle == 3{
                                        let ColorFire = data["Color"] as! String
                                        let LongTextFire = data["Text"] as! String
                                        outputCards.append(CardType(Use: Use, Title: nil, Caption: nil, ColorType: ColorFire, ImageRef: nil, LongText: LongTextFire, BackgroundStyle: BackgroundStyle, FirebaseID: x, Opacity: Double(Opacity)!, CardData: CardDataIn))
                                    }
                                }
                            }
                        }
                    }
                }
                completion(outputCards)
            }
        }//mark
    }
}

extension Date {
    func startOfMonth() -> Date {
        return Calendar.current.date(from: Calendar.current.dateComponents([.year, .month], from: Calendar.current.startOfDay(for: self)))!
    }
    
    func endOfMonth() -> Date {
        return Calendar.current.date(byAdding: DateComponents(month: 1, day: -1), to: self.startOfMonth())!
    }
}

