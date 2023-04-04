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
import FirebaseStorage

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

struct CardType: Identifiable {
    
    let id = UUID()
    //Card Face
    let Title: String?
    let Caption: String?
    let ColorType: String?
    let ImageRef: String?
    let LongText: String?
    let BackgroundStyle: Int
    
    let Opacity: Double
    
    //Card Destintation
    let Destination: Int
    let CardData: [DataIdType]
}
//Defineing Cutom types end
struct AnErrorHasOcurredView: View{
    var body: some View{
        Text("An Error has Occured")
    }
}

//Factoring
struct FactoringBinomials: View{
    @Binding var SelectedMode: SelectedModeCalculusEnum?
    @State var FactorDisplay: AttributedString = AttributedString("")
    @State var ShowAns: Bool = false
    @State var Soloution: String = ""
    
    @State var DarkMode: Bool = false
    
    @Environment(\.colorScheme) var colorScheme
    
    var body: some View{
        VStack{
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
            Text(FactorDisplay)
                .foregroundColor(DarkMode ? Color.white : Color.black)
                .onAppear(){
                    let NewResult = BinomialFactoring()
                    FactorDisplay = AttributedString(NewResult.0)
                    Soloution = NewResult.1
                    if colorScheme == .dark{
                        DarkMode = true
                    } else {
                        DarkMode = false
                    }
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
                    .foregroundColor(DarkMode ? Color.white : Color.black)
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
    @Binding var SelectedMode: SelectedModeCalculusEnum?
    @Binding var PDFs: [DataIdType]?
    @State var LetSelectedPDF: String = "https://www.africau.edu/images/default/sample.pdf"
    @State var DataInput: Data?
    @Binding var AccessToken: String?
    
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
                ForEach(PDFs!, id: \.Id) { value in
                    Button{
                        LetSelectedPDF = value.Id
                        Task{
                            do{
                                DataInput = try await PDFKitFunction().CallData(ItemId: value.Id, accessToken: AccessToken!)
                                print(DataInput)
                            } catch {
                                print("Oh No an error")
                                //TO DO HANDEL ERROR
                            }
                        }
                    } label: {
                        Text(value.Name)
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


//the home page of the selected course
struct ClassHomePageView: View{
    @Binding var SelectedQuizViewMode: QuizViewMode
    @Binding var SelectedCourse: CourseSelectedType
    
    @Binding var SelectedMode: SelectedModeCalculusEnum?
    @Binding var GradeIn: Int
    @Binding var Vidoes: [DataIdType]?
    @State var Teacher = ""
    @State var AvaliableCards: [CardType] = []
    @State var BackgroundType: Int = 2
    @State var CardIds: [Int] = []
    var body: some View{
        GeometryReader{ value in
            ZStack(alignment: .leading){
                CourseBackground(BackgroundType: BackgroundType)
                    .edgesIgnoringSafeArea(.all)
                VStack(){
                    HStack{
                        Button(){
                            SelectedQuizViewMode = .SelectedGrade
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
                        
                        Card(SelectedMode: $SelectedMode, SelectedCardMode: .Quizes, Vidoes: $Vidoes, TextColor: Color.black, SelectedCard: card)
                            .frame(width: value.size.width * 0.9, height: value.size.height * 0.3)
                            .cornerRadius(25)
                    }
                    Spacer()
            }
            }.onAppear(){
                Task{
                    do{
                        let db = Firestore.firestore()
                        
                        var SectionID: String = ""
                        
                        if SelectedCourse.Section == 0{
                            SectionID = "0"
                        } else {
                            SectionID = "\(SelectedCourse.Section)-\(SelectedCourse.Year)"
                        }
                        
                        var docRef = db.collection("Grade\(GradeIn)Courses").document("\(SelectedCourse.Name)").collection("Sections").document(SectionID)
                        docRef.getDocument { (document, error) in
                            guard error == nil else {
                                print("error", error ?? "")
                                return
                            }
                            
                            if let document = document, document.exists {
                                let data = document.data()
                                if let data = data {
                                    let NumberOfCards = data["NumberOfPages"] as! Int
                                    Teacher = data["Teacher"] as! String
                                    CardIds = data["Page Info"] as! NSArray as! [Int]
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
                                                    let destinationFire = data["Destination"] as! Int
                                                    let cardDataValueFire = data["CardData"] as! [String]
                                                    let cardDataNameFire = data["CardDataName"] as! [String]
                                                    let BackgroundStyle = data["BackgroundStyle"] as! Int
                                                    let Opacity = data["Opacity"] as! String
                                                    let cardDataTypeFire: [String] = data["CardDataType"] as? NSArray as? [String] ?? []
                                                    if BackgroundStyle == 0{
                                                        let captionFire = data["Caption"] as! String
                                                        let titleFire = data["Title"] as! String
                                                        let ColorFire = data["Color"] as! String
                                                        var CardDataIn: [DataIdType] = []
                                                        for y in 0..<cardDataNameFire.count{
                                                            if cardDataTypeFire.count != 0{
                                                                CardDataIn.append(DataIdType(Name: cardDataNameFire[y], Id: cardDataValueFire[y], FileType: cardDataTypeFire[y]))
                                                            } else {
                                                                CardDataIn.append(DataIdType(Name: cardDataNameFire[y], Id: cardDataValueFire[y], FileType: nil))
                                                            }
                                                        }
                                                        AvaliableCards.append(CardType(Title: titleFire, Caption: captionFire, ColorType: ColorFire, ImageRef: nil, LongText: nil, BackgroundStyle: BackgroundStyle, Opacity: Double(Opacity)!, Destination: destinationFire, CardData: CardDataIn))
                                                    } else {
                                                        if BackgroundStyle == 1{
                                                            let ImageRefFire = data["ImageRef"] as! String
                                                            var CardDataIn: [DataIdType] = []
                                                            for y in 0..<cardDataNameFire.count{
                                                                if cardDataTypeFire.count != 0{
                                                                    CardDataIn.append(DataIdType(Name: cardDataNameFire[y], Id: cardDataValueFire[y], FileType: cardDataTypeFire[y]))
                                                                } else {
                                                                    CardDataIn.append(DataIdType(Name: cardDataNameFire[y], Id: cardDataValueFire[y], FileType: nil))
                                                                }
                                                            }
                                                            AvaliableCards.append(CardType(Title: nil, Caption: nil, ColorType: nil, ImageRef: ImageRefFire, LongText: nil, BackgroundStyle: BackgroundStyle, Opacity: Double(Opacity)!, Destination: destinationFire, CardData: CardDataIn))
                                                        } else {
                                                            if BackgroundStyle == 2{
                                                                let captionFire = data["Caption"] as! String
                                                                let titleFire = data["Title"] as! String
                                                                let ImageRefFire = data["ImageRef"] as! String
                                                                var CardDataIn: [DataIdType] = []
                                                                for y in 0..<cardDataNameFire.count{
                                                                    if cardDataTypeFire.count != 0{
                                                                        CardDataIn.append(DataIdType(Name: cardDataNameFire[y], Id: cardDataValueFire[y], FileType: cardDataTypeFire[y]))
                                                                    } else {
                                                                        CardDataIn.append(DataIdType(Name: cardDataNameFire[y], Id: cardDataValueFire[y], FileType: nil))
                                                                    }
                                                                }
                                                                AvaliableCards.append(CardType(Title: titleFire, Caption: captionFire, ColorType: nil, ImageRef: ImageRefFire, LongText: nil, BackgroundStyle: BackgroundStyle, Opacity: Double(Opacity)!, Destination: destinationFire, CardData: CardDataIn))
                                                            } else {
                                                                if BackgroundStyle == 3{
                                                                    let ColorFire = data["Color"] as! String
                                                                    let LongTextFire = data["Text"] as! String
                                                                    var CardDataIn: [DataIdType] = []
                                                                    for y in 0..<cardDataNameFire.count{
                                                                        if cardDataTypeFire.count != 0{
                                                                            CardDataIn.append(DataIdType(Name: cardDataNameFire[y], Id: cardDataValueFire[y], FileType: cardDataTypeFire[y]))
                                                                        } else {
                                                                            CardDataIn.append(DataIdType(Name: cardDataNameFire[y], Id: cardDataValueFire[y], FileType: nil))
                                                                        }
                                                                    }
                                                                    AvaliableCards.append(CardType(Title: nil, Caption: nil, ColorType: ColorFire, ImageRef: nil, LongText: LongTextFire, BackgroundStyle: BackgroundStyle, Opacity: Double(Opacity)!, Destination: destinationFire, CardData: CardDataIn))
                                                                }
                                                            }
                                                        }
                                                    }
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
            }//Mark
        }
    }
}

//The view controller for the the selected course
struct CourseView: View{

    @Binding var SelectedQuizViewMode: QuizViewMode
    
    @Binding var SelectedCourse: CourseSelectedType
    @Binding var GradeIn: Int
    
    @Binding var AccessToken: String?
    
    @State var SelectedMode: SelectedModeCalculusEnum? = .Home
    @State var InputData: [DataIdType]? = []
    var body: some View{
        if SelectedMode == .Home{
            ClassHomePageView(SelectedQuizViewMode: $SelectedQuizViewMode, SelectedCourse: $SelectedCourse, SelectedMode: $SelectedMode, GradeIn: $GradeIn, Vidoes: $InputData)
        } else {
            if SelectedMode == .FactoringBinomials{
                FactoringBinomials(SelectedMode: $SelectedMode)
            } else {
                if SelectedMode == .PDFView{
                    PDFSelectionView(SelectedMode: $SelectedMode, PDFs: $InputData, AccessToken: $AccessToken)
                } else {
                    if SelectedMode == .YouTube{
                        LetureHomePage(SelectedMode: $SelectedMode, Vidoes: $InputData)
                    }
                }
            }
        }
    }
}

struct CoursePersonalOverviewView: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    @Environment(\.colorScheme) var colorScheme
    @Binding var OverrideSelectionView: Bool
    
    @Binding var SelectedCourse: CourseSelectedType
    @Binding var SelectedQuizViewMode: QuizViewMode
    @Binding var OverrideCourseView: Bool
    
    
    var body: some View{
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
            }
            Text("Welcome, \(WindowMode.FirstName) \(WindowMode.LastName)")
                .font(.largeTitle)
                .foregroundColor(colorScheme == .dark ? Color.black : Color.white)
            List(){
                Section{
                    ForEach(WindowMode.SelectedCourses, id: \.id){ course in
                        Button(){
                            SelectedCourse = course
                            SelectedQuizViewMode = .CourseView
                        } label: {
                            Text(course.Name)
                        }
                    }
                }
                Section{
                    Button(){
                        OverrideCourseView = false
                        SelectedQuizViewMode = .CourseOverview
                    } label: {
                        Text("Choose a different \(WindowMode.GradeIn) course")
                    }
                    Button(){
                        OverrideSelectionView = false
                        SelectedQuizViewMode = .SelectedGrade
                    } label: {
                        Text("See other courses in a different grade")
                    }
                }
            }.background(Color.marron)
            .scrollContentBackground(.hidden)
        }.background(Color.marron)
    }
}

//Picks a course
struct CourseSelectionView: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    
    @Binding var SelectedCourse: CourseSelectedType
    @Binding var SelectedQuizViewMode: QuizViewMode
    @Binding var ShowingSelectionView: Bool
    @Binding var OverrideSelectionView: Bool
    @State var AvaliableCourses: [String] = []
    @State var ShowingErrorMessage: Bool = false
    @State var ErrorMessage = ""
    @State var SelectedClass: GradesEnum
    @Environment(\.colorScheme) var colorScheme

    var body: some View{
        if AvaliableCourses.count == 0{
            ProgressView()
                .onAppear(){
                    Task{
                        do{
                            let db = Firestore.firestore()
                            
                            let docRef = db.collection("Grade\(WindowMode.GradeIn)Courses")
                            docRef.getDocuments { (snapshot, error) in
                                guard let snapshot = snapshot, error == nil else {
                                 //handle error
                                 return
                               }
                               snapshot.documents.forEach({ (documentSnapshot) in
                                   let documentData = documentSnapshot.data()
                                   let CourseNameNewUser = documentData["CourseName"] as? String
                                   AvaliableCourses.append(CourseNameNewUser ?? "Error")
                               })
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
                    List{
                        ForEach(AvaliableCourses, id: \.self) {  course in
                            Button{
                                SelectedQuizViewMode = .CourseView
                                SelectedCourse = CourseSelectedType(Name: course, Section: 0, Year: 0)
                            } label: {
                                Text(course)
                            }.buttonStyle(.plain)
                        }
                    }.background(Color.marron)
                    .scrollContentBackground(.hidden)
                }.background(Color.marron)
            }
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

enum QuizViewMode{
    case SelectedGrade
    case CourseOverview
    case PersonalizedOverview
    case CourseView
}

//Handeler for MSAL
//Checks if grade selected
//Sends to course selector view
struct QuizView: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    
    @State var SelectedUserGrade: GradesEnum = .Grade_9
    @State var ShowingSelectionView: Bool = true
    @State var OverrideSelectionView: Bool = true
    @State var OverrideCourseView: Bool = true
    @State var isTheirSelectedClasess: Bool = false
    @State var SelectedCourse: CourseSelectedType = CourseSelectedType(Name: "Error", Section: 0, Year: 0)
    
    @Binding var accessToken: String?
    @Binding var MSALAccount: MSALAccount?
    @StateObject var msalModel: MSALScreenViewModel = MSALScreenViewModel()
    
    @State var SelectedQuizViewMode: QuizViewMode = .SelectedGrade
    
    var body: some View{
        if MSALAccount == nil{
            if accessToken == nil{
                MSALView()
                    .environmentObject(WindowMode)
            } else {
                switch SelectedQuizViewMode {
                case .SelectedGrade:
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
                                SelectedQuizViewMode = .CourseOverview
                            }
                        }
                    }
                    .environmentObject(WindowMode)
                case .CourseOverview:
                    CourseSelectionView(SelectedCourse: $SelectedCourse, SelectedQuizViewMode: $SelectedQuizViewMode, ShowingSelectionView: $ShowingSelectionView, OverrideSelectionView: $OverrideSelectionView, SelectedClass: SelectedUserGrade)
                        .environmentObject(WindowMode)
                        .onAppear(){
                            if OverrideCourseView{
                                print(WindowMode.SelectedCourses)
                                if WindowMode.SelectedCourses.count >= 1{
                                    SelectedQuizViewMode = .PersonalizedOverview
                                }
                            }
                        }
                case .PersonalizedOverview:
                    CoursePersonalOverviewView(OverrideSelectionView: $OverrideSelectionView, SelectedCourse: $SelectedCourse, SelectedQuizViewMode: $SelectedQuizViewMode, OverrideCourseView: $OverrideCourseView)
                        .environmentObject(WindowMode)
                case .CourseView:
                    CourseView(SelectedQuizViewMode: $SelectedQuizViewMode, SelectedCourse: $SelectedCourse, GradeIn: $WindowMode.GradeIn, AccessToken: $accessToken)
                }
            }
        } else {
            if accessToken == nil{
                Text("Please Wait One moment well Pauly gets everything ready")
                    .onAppear(){
                        if accessToken?.count ?? 0 <= 10{
                            msalModel.acquireTokenSilently(MSALAccount!, AccountMode: WindowMode.SelectedWindowMode, Grade: WindowMode.GradeIn, UsernameIn: WindowMode.UsernameIn, FirstName: WindowMode.FirstName, LastName: WindowMode.LastName, SelectedCourses: WindowMode.SelectedCourses)
                        }
                    }
                MSALScreenView_UI(viewModel: msalModel, AccountValue: $MSALAccount)
                    .frame(width: 1, height: 1, alignment: .bottom)
            } else {
                switch SelectedQuizViewMode {
                case .SelectedGrade:
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
                                SelectedQuizViewMode = .CourseOverview
                            }
                        }
                    }
                    .environmentObject(WindowMode)
                case .CourseOverview:
                    CourseSelectionView(SelectedCourse: $SelectedCourse, SelectedQuizViewMode: $SelectedQuizViewMode, ShowingSelectionView: $ShowingSelectionView, OverrideSelectionView: $OverrideSelectionView, SelectedClass: SelectedUserGrade)
                        .environmentObject(WindowMode)
                        .onAppear(){
                            if OverrideCourseView{
                                print(WindowMode.SelectedCourses)
                                if WindowMode.SelectedCourses.count >= 1{
                                    SelectedQuizViewMode = .PersonalizedOverview
                                }
                            }
                        }
                case .PersonalizedOverview:
                    CoursePersonalOverviewView(OverrideSelectionView: $OverrideSelectionView, SelectedCourse: $SelectedCourse, SelectedQuizViewMode: $SelectedQuizViewMode, OverrideCourseView: $OverrideCourseView)
                        .environmentObject(WindowMode)
                case .CourseView:
                    CourseView(SelectedQuizViewMode: $SelectedQuizViewMode, SelectedCourse: $SelectedCourse, GradeIn: $WindowMode.GradeIn, AccessToken: $accessToken)
                }
            }
        }
    }
}
