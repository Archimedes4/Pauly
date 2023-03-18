//
//  QuizView.swift
//  Pauly
//
//  Created by Andrew Mainella on 2023-03-02.
//

import Foundation
import SwiftUI
import PDFKit
import MSAL
import FirebaseFirestore

// Defining Custom Types
enum GradesEnum: String, CaseIterable{
    case Grade_9 = "Grade 9"
    case Grade_10 = "Grade 10"
    case Grade_11 = "Grade 11"
    case Grade_12 = "Grade 12"
}

enum SelectedModeCalculusEnum{
    case Home
    case FactoringBinomials
    case PDFView
    case MSLFView
    case YouTube
    case Else
}

struct Course {
    let CourseName: String
    let Teacher: [String]
}

struct CardType: Hashable, Identifiable {
    let id = UUID()
    //Card Face
    let Title: String
    let Caption: String
    
    //Card Destintation
    let Destination: Int
    let CardData: [String]
    let CardDataName: [String]
}
//Defineing Cutom types end
struct AnErrorHasOcurredView: View{
    var body: some View{
        Text("An Error has Occured")
    }
}

//Factori
struct FactoringBinomials: View{
    @Binding var SelectedMode: SelectedModeCalculusEnum
    @State var FactorDisplay: AttributedString = AttributedString("")
    @State var ShowAns: Bool = false
    @State var Soloution: String = ""
    
    @Environment(\.colorScheme) var colorScheme
    
    var body: some View{
        VStack{
            Button("Back"){
                SelectedMode = .Home
            }
            Text(FactorDisplay)
                .foregroundColor(colorScheme == .dark ? Color.black : Color.white)
                .onAppear(){
                    let NewResult = BinomialFactoring()
                    FactorDisplay = AttributedString(NewResult.0)
                    Soloution = NewResult.1
                }
            Button("Make New Equation"){
                let NewResult = BinomialFactoring()
                FactorDisplay = AttributedString(NewResult.0)
                Soloution = NewResult.1
                ShowAns = false
            }
            Button(){
                ShowAns.toggle()
            } label: {
                if ShowAns {
                    Text("Hide Solution")
                } else {
                    Text("Show Solution")
                }
            }
            if ShowAns{
                Text(Soloution)
                    .foregroundColor(colorScheme == .dark ? Color.black : Color.white)
            }
        }
    }
    func BinomialFactoring() -> (NSAttributedString, String){
        let A1: Int = Int.random(in: 1..<5)
        let A2: Int = Int.random(in: 1..<5)
        let rnd1: Bool = Bool.random()
        let B1: Int = Int.random(in: 1..<5)
        let B2: Int = Int.random(in: 1..<5)
        let rnd2: Bool = Bool.random()
        
        var S1: Int = 0
        var S2: Int = 0
        if rnd1{
            S1 = 1
        } else {
            S1 = -1
        }
        if rnd2{
            S2 = 1
        } else {
            S2 = -1
        }
        if ((A1 + (S2 * B2)) + (B1 + (S1 * A2))) >= 0{
            if ((S1*A2)*(S2*B2)) >= 0{
                var result = NSMutableAttributedString()
                result.append(NSAttributedString(string: "\(A1 * B1)x"))
                result.append(NSAttributedString(string: "2", attributes: [NSAttributedString.Key.baselineOffset: 5]))
                result.append(NSAttributedString(string: "+\((A1 * (S2 * B2)) + (B1 * (S1 * A2)))x+\((S1*A2)*(S2*B2))"))
                if (S1 * A2) >= 0{
                    return (result, "(\(A1)x+\(S1 * A2))(\(B1)x+\(S2 * B2))")
                } else {
                    return (result, "(\(A1)x\(S1 * A2))(\(B1)x+\(S2 * B2))")
                }
            } else{
                var result = NSMutableAttributedString()
                result.append(NSAttributedString(string: "\(A1 * B1)x"))
                result.append(NSAttributedString(string: "2", attributes: [NSAttributedString.Key.baselineOffset: 5]))
                result.append(NSAttributedString(string: "+\((A1 * (S2 * B2)) + (B1 * (S1 * A2)))x\((S1*A2)*(S2*B2))"))
                if (S1 * A2) >= 0{
                    return (result, "(\(A1)x+\(S1 * A2))(\(B1)x+\(S2 * B2))")
                } else {
                    return (result, "(\(A1)x\(S1 * A2))(\(B1)x+\(S2 * B2))")
                }
            }
        } else {
            if ((S1*A2)*(S2*B2)) >= 0{
                var result = NSMutableAttributedString()
                result.append(NSAttributedString(string: "\(A1 * B1)x"))
                result.append(NSAttributedString(string: "2", attributes: [NSAttributedString.Key.baselineOffset: 5]))
                result.append(NSAttributedString(string: "\((A1 * (S2 * B2)) + (B1 * (S1 * A2)))x+\((S1*A2)*(S2*B2))"))
                if (S1 * A2) >= 0{
                    return (result, "(\(A1)x+\(S1 * A2))(\(B1)x+\(S2 * B2))")
                } else {
                    return (result, "(\(A1)x\(S1 * A2))(\(B1)x+\(S2 * B2))")
                }
            } else{
                var result = NSMutableAttributedString()
                result.append(NSAttributedString(string: "\(A1 * B1)x"))
                result.append(NSAttributedString(string: "2", attributes: [NSAttributedString.Key.baselineOffset: 5]))
                result.append(NSAttributedString(string: "\((A1 * (S2 * B2)) + (B1 * (S1 * A2)))x\((S1*A2)*(S2*B2))"))
                if (S1 * A2) >= 0{
                    return (result, "(\(A1)x+\(S1 * A2))(\(B1)x+\(S2 * B2))")
                } else {
                    return (result, "(\(A1)x\(S1 * A2))(\(B1)x+\(S2 * B2))")
                }
            }
        }
    }
}

struct PDFSelectionView: View{
    @Binding var SelectedMode: SelectedModeCalculusEnum
    let PDFLinks: [String] = ["https://gocrusadersca-my.sharepoint.com/personal/maina24_gocrusaders_ca/Documents/This%20is%20a%20Test%20For%20OneDrive.pdf", "https://www.africau.edu/images/default/sample.pdf", "https://gocrusadersca-my.sharepoint.com/personal/maina24_gocrusaders_ca/_layouts/15/download.aspx?UniqueId=7ecfcae2-44f1-462c-b3a0-be8c0b54ba66&Translate=false&tempauth=eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0.eyJhdWQiOiIwMDAwMDAwMy0wMDAwLTBmZjEtY2UwMC0wMDAwMDAwMDAwMDAvZ29jcnVzYWRlcnNjYS1teS5zaGFyZXBvaW50LmNvbUBkOWFkM2M4OS02YWVkLTQ3ODMtOTNjZS0yMTJiNzFlZTk4ZjMiLCJpc3MiOiIwMDAwMDAwMy0wMDAwLTBmZjEtY2UwMC0wMDAwMDAwMDAwMDAiLCJuYmYiOiIxNjc4NjM5ODQ0IiwiZXhwIjoiMTY3ODY0MzQ0NCIsImVuZHBvaW50dXJsIjoiVzk1STlRYmhZZlRiRkx4Y2F3bUpRcVgrSzhiMUhiWmJ1Yksxa0I4UnVQdz0iLCJlbmRwb2ludHVybExlbmd0aCI6IjE1OSIsImlzbG9vcGJhY2siOiJUcnVlIiwiY2lkIjoiTlRWbE5UTTFNVGd0WkdNellpMDBabUZrTFdFek5EUXRZV1kxT1RSbE5tSTBOVEF4IiwidmVyIjoiaGFzaGVkcHJvb2Z0b2tlbiIsInNpdGVpZCI6Ik9HWTJZV1F6WkRndE56STRaQzAwWWpVNExUazJNREl0TkRjMU4yTmxZak5rWkRCaSIsImFwcF9kaXNwbGF5bmFtZSI6IlBhdWx5IiwiZ2l2ZW5fbmFtZSI6IkFuZHJldyIsImZhbWlseV9uYW1lIjoiTWFpbmVsbGEiLCJzaWduaW5fc3RhdGUiOiJbXCJrbXNpXCJdIiwiYXBwaWQiOiI4MmY1MmJhZS04ZDExLTRlZDAtYjFkMS04M2Q3NmQyZTYwNWMiLCJ0aWQiOiJkOWFkM2M4OS02YWVkLTQ3ODMtOTNjZS0yMTJiNzFlZTk4ZjMiLCJ1cG4iOiJtYWluYTI0QGdvY3J1c2FkZXJzLmNhIiwicHVpZCI6IjEwMDMyMDAwRDA2MkMyMzgiLCJjYWNoZWtleSI6IjBoLmZ8bWVtYmVyc2hpcHwxMDAzMjAwMGQwNjJjMjM4QGxpdmUuY29tIiwic2NwIjoiYWxsZmlsZXMucmVhZCBhbGxwcm9maWxlcy5yZWFkIiwidHQiOiIyIiwidXNlUGVyc2lzdGVudENvb2tpZSI6bnVsbCwiaXBhZGRyIjoiMjAuMTkwLjEzOS4xNzEifQ.VmpqRjFIVHlEZlNJMFNuRit6RDY5NzVEaW5BQ0ttbDFaSUc4M0hMaTJIQT0&ApiVersion=2.0"]
    @State var LetSelectedPDF: String = "https://www.africau.edu/images/default/sample.pdf"
    @State var DataInput: Data?
    var body: some View{
        if DataInput == nil{
            HStack{
                Button(){
                    SelectedMode = .Home
                } label: {
                    HStack {
                        Image(systemName: "chevron.backward")
                            .padding(.leading)
                        Text("Back")
                    }
                }
                Spacer()
            }
            Text("PDF View")

            List(){
                ForEach(PDFLinks, id: \.self) { value in
                    Button{
                        LetSelectedPDF = value
                        Task{
                            do{
                                DataInput = try await PDFKitFunction().CallData(URLInputString: LetSelectedPDF)
                                print(DataInput)
                            } catch {
                                print("Oh No an error")
                                //TO DO HANDEL ERROR
                            }
                        }
                    } label: {
                        Text(value)
                    }
                }
            }
        } else {
            if DataInput != nil {
                HStack{
                    Button(){
                        DataInput = nil
                    } label: {
                        HStack {
                            Image(systemName: "chevron.backward")
                                .padding(.leading)
                            Text("Back")
                        }
                    }
                    Spacer()
                }
                PDFKitRepresentedView(DataInput!)
            }
        }
    }
}

//Background for course home page
struct CourseBackground: View{
    let BackgroundType: Int
    var body: some View{
        if BackgroundType == 1{
            Rectangle()
                .fill(
                    LinearGradient(gradient: Gradient(colors: [.purple, .blue, .orange]), startPoint: .top, endPoint: .bottom)
                )
        } else {
            if BackgroundType == 2{
                Rectangle()
                    .fill(
                        Color.gray
                    )
            }
        }
    }
}

//The default card
struct Card: View{
    @Binding var SelectedMode: SelectedModeCalculusEnum
    let Title: String
    let Caption: String
    let TextColor: Color
    let Destination: Int
    let CardData: [String]
    let CardDataName: [String]
    var body: some View{
        Button{
            if Destination == 0{
                SelectedMode = .FactoringBinomials
            } else {
                if Destination == 1{
                    SelectedMode = .YouTube
                } else {
                    if Destination == 2{
                        SelectedMode = .PDFView
                    }
                }
            }
        } label: {
            ZStack{
                Rectangle()
                    .foregroundColor(.green)
                VStack{
                    Text(Title)
                        .font(.title)
                        .foregroundColor(TextColor)
                    Text(Caption)
                        .font(.caption2)
                        .foregroundColor(TextColor)
                }
            }
        }.padding()
            .cornerRadius(25)
    }
}


//the home page of the selected course
struct ClassHomePageView: View{
    @Binding var ShowingSelectClassView: Bool
    @Binding var SelectedCourse: String
    @Binding var SelectedMode: SelectedModeCalculusEnum
    @Binding var GradeIn: Int
    @State var Teacher = ""
    @State var AvaliableCards: [CardType] = []
    @State var BackgroundType: Int = 2
    var body: some View{
        GeometryReader{ value in
            ZStack(alignment: .leading){
                CourseBackground(BackgroundType: BackgroundType)
                    .edgesIgnoringSafeArea(.all)
                VStack(){
                    HStack{
                        Button(){
                            ShowingSelectClassView = true
                        } label: {
                            HStack {
                                Image(systemName: "chevron.backward")
                                    .padding(.leading)
                                Text("Back")
                            }
                        }
                        Spacer()
                    }
                    ForEach(AvaliableCards, id: \.id) { card in
                        Card(SelectedMode: $SelectedMode, Title: card.Title, Caption: card.Caption, TextColor: Color.black, Destination: card.Destination, CardData: card.CardData, CardDataName: card.CardDataName)
                            .frame(width: value.size.width * 0.9, height: value.size.height * 0.3)
                            .cornerRadius(25)
                    }
                    Spacer()
            }
            }.onAppear(){
                Task{
                    do{
                        let db = Firestore.firestore()
                        
                        var docRef = db.collection("Courses").document("Grade\(GradeIn)").collection("\(SelectedCourse)-1-2023").document("Info")
                        docRef.getDocument { (document, error) in
                            guard error == nil else {
                                print("error", error ?? "")
                                return
                            }
                            
                            if let document = document, document.exists {
                                let data = document.data()
                                if let data = data {
                                    Teacher = data["Teacher"] as! String
                                }
                            }
                        }
                        docRef = db.collection("Courses").document("Grade\(GradeIn)").collection("\(SelectedCourse)-1-2023").document("Page Info")
                        docRef.getDocument { (document, error) in
                            guard error == nil else {
                                print("error", error ?? "")
                                return
                            }
                            
                            if let document = document, document.exists {
                                let data = document.data()
                                if let data = data {
                                    let NumberOfCards = data["NumberOfPages"] as! Int
                                    print("Number of Cards \(NumberOfCards)")
                                    for x in 0..<NumberOfCards{
                                        let docRef = db.collection("Courses").document("Grade\(GradeIn)").collection("\(SelectedCourse)-1-2023").document("Page Info").collection("Card\(x + 1)").document("Info")
                                        docRef.getDocument { (document, error) in
                                            guard error == nil else {
                                                print("error", error ?? "")
                                                return
                                            }
                                            
                                            if let document = document, document.exists {
                                                let data = document.data()
                                                if let data = data {
                                                    let titleFire = data["Title"] as! String
                                                    let destinationFire = data["Destination"] as! Int
                                                    let captionFire = data["Caption"] as! String
                                                    let cardDataValueFire = data["CardData"] as! [String]
                                                    let cardDataNameFire = data["CardDataName"] as! [String]
                                                    AvaliableCards.append(CardType(Title: titleFire, Caption: captionFire, Destination: destinationFire, CardData: cardDataValueFire, CardDataName: cardDataNameFire))
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    } catch {
                        print("Error")
                    }
                }
            }
        }
    }
}

//The view controller for the the selected course
struct CourseView: View{
    @Binding var ShowingSelectClassView: Bool
    @Binding var SelectedCourse: String
    @Binding var GradeIn: Int
    @State var SelectedMode: SelectedModeCalculusEnum = .Home
    var body: some View{
        if SelectedMode == .Home{
            ClassHomePageView(ShowingSelectClassView: $ShowingSelectClassView, SelectedCourse: $SelectedCourse, SelectedMode: $SelectedMode, GradeIn: $GradeIn)
        } else {
            if SelectedMode == .FactoringBinomials{
                FactoringBinomials(SelectedMode: $SelectedMode)
            } else {
                if SelectedMode == .PDFView{
                    PDFSelectionView(SelectedMode: $SelectedMode)
                } else {
                    if SelectedMode == .YouTube{
                        YouTubeView(videoId: "g0amdIcZt5I")
                    }
                }
            }
        }
    }
}

//Picks a course
struct CourseSelectionView: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    
    @Binding var ShowingSelectionView: Bool
    @Binding var OverrideSelectionView: Bool
    @State var AvaliableCourses: [String] = []
    @State var ShowingSelectClassView: Bool = true
    @State var ShowingErrorMessage: Bool = false
    @State var ErrorMessage = ""
    @State var SelectedClass: GradesEnum
    @State var SelectedCourse: String = ""
    @Environment(\.colorScheme) var colorScheme

    var body: some View{
        if ShowingSelectClassView{
            if AvaliableCourses.count == 0{
                ProgressView()
                    .onAppear(){
                        Task{
                            do{
                                let db = Firestore.firestore()
                                
                                let docRef = db.collection("Courses").document("Grade\(WindowMode.GradeIn)")
                                docRef.getDocument { (document, error) in
                                    guard error == nil else {
                                        print("error", error ?? "")
                                        return
                                    }
                                    
                                    if let document = document, document.exists {
                                        let data = document.data()
                                        if let data = data {
                                            let results = data["Courses"] as! NSArray as? [String] ?? []
                                            AvaliableCourses = results
                                        }
                                    }
                                }
                            } catch {
                                print("Error")
                            }
                        }
                    }
            } else {
                GeometryReader{ geo in
                    VStack{
                        HStack(){
                            Button{
                                WindowMode.SelectedWindowMode = .HomePage
                            } label: {
                                HStack{
                                    Image(systemName: "chevron.backward")
                                    Text("Back")
                                }
                            }.padding(.leading)
                            Spacer()
                            Text("Select \(SelectedClass.rawValue) Class")
                                .foregroundColor(colorScheme == .dark ? Color.black : Color.white)
                            Spacer()
                            Button{
                                OverrideSelectionView = false
                                ShowingSelectionView = true
                            } label: {
                                HStack{
                                    Image(systemName: "chevron.backward")
                                    Text("Choose Grade")
                                }
                            }.padding(.trailing)
                        }
                        List(AvaliableCourses, id: \.self) { course in
                            Button{
                                ShowingSelectClassView = false
                                SelectedCourse = course
                            } label: {
                                Text(course)
                            }.buttonStyle(.plain)
                        }.background(Color.marron)
                    }.background(Color.marron)
                }
            }
        } else {
            CourseView(ShowingSelectClassView: $ShowingSelectClassView, SelectedCourse: $SelectedCourse, GradeIn: $WindowMode.GradeIn)
        }
    }
}

//Grade Selector view to pick a grade
struct GradeSelectionView: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    
    @Binding var SelectedUserGrade: GradesEnum
    @Binding var ShowingSelectionView: Bool
    @Binding var OverrideSelectionView: Bool
    var body: some View{
        HStack(){
            GeometryReader{ geo in
                HStack{
                    Spacer()
                    VStack(){
                        HStack{
                            Button {
                                WindowMode.SelectedWindowMode = .HomePage
                            } label: {
                                HStack {
                                    Image(systemName: "chevron.backward")
                                    Text("Back")
                                }
                            }
                            Spacer()
                        }.padding(.bottom)
                        Text("Select Grade")
                            .font(.system(size: 55))
                            .padding(25)
                        ForEach(GradesEnum.allCases, id: \.rawValue){ grade in
                            Button{
                                OverrideSelectionView = true
                                ShowingSelectionView = false
                                SelectedUserGrade = grade
                            } label: {
                                ZStack{
                                    Rectangle()
                                        .foregroundColor(.white)
                                        .frame(width: geo.frame(in: .global).width * 0.8, height: geo.frame(in: .global).height * 0.15)
                                        .cornerRadius(15)
                                    Text(grade.rawValue)
                                        .foregroundColor(.black)
                                }
                            }.buttonStyle(.plain)
                            .frame(width: geo.frame(in: .global).width * 0.8, height: geo.frame(in: .global).height * 0.15)
                            .edgesIgnoringSafeArea(.all)
                        }
                        Spacer()
                    }
                    Spacer()
                }.background(Color.marron)
            }
        }
    }
}

//Handeler for MSAL
//Checks if grade selected
//Sends to course selector view
struct QuizView: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    
    @State var SelectedUserGrade: GradesEnum = .Grade_9
    @State var ShowingSelectionView: Bool = true
    @State var OverrideSelectionView: Bool = true
    @Binding var accessToken: String?
    @Binding var MSALAccount: MSALAccount?
    @StateObject var msalModel: MSALScreenViewModel = MSALScreenViewModel()
    
    var body: some View{
        if MSALAccount == nil{
            MSALView()
                .environmentObject(WindowMode)
        } else {
            if accessToken == nil{
                Text("Please Wait One moment well Pauly gets everything ready")
                    .onAppear(){
                        if accessToken?.count ?? 0 <= 10{
                            msalModel.acquireTokenSilently(MSALAccount!, AccountMode: WindowMode.SelectedWindowMode, Grade: WindowMode.GradeIn, UsernameIn: WindowMode.UsernameIn)
                        }
                    }
                MSALScreenView_UI(viewModel: msalModel, AccountValue: $MSALAccount)
                    .frame(width: 1, height: 1, alignment: .bottom)
            } else {
                if ShowingSelectionView{
                    GradeSelectionView(SelectedUserGrade: $SelectedUserGrade, ShowingSelectionView: $ShowingSelectionView, OverrideSelectionView: $OverrideSelectionView).onAppear(){
                        if OverrideSelectionView{
                            if WindowMode.GradeIn >= 9{
                                if WindowMode.GradeIn == 9{
                                    SelectedUserGrade = .Grade_9
                                } else {
                                    if WindowMode.GradeIn == 10{
                                        SelectedUserGrade = .Grade_10
                                    } else {
                                        if WindowMode.GradeIn == 11{
                                            SelectedUserGrade = .Grade_11
                                        } else {
                                            if WindowMode.GradeIn == 12{
                                                SelectedUserGrade = .Grade_12
                                            }
                                        }
                                    }
                                }
                                print("Here")
                                ShowingSelectionView = false
                            }
                        }
                    }
                    .environmentObject(WindowMode)
                } else {
                    CourseSelectionView(ShowingSelectionView: $ShowingSelectionView, OverrideSelectionView: $OverrideSelectionView, SelectedClass: SelectedUserGrade)
                        .environmentObject(WindowMode)
                }
            }
        }
    }
}
