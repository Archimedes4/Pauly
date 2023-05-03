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

struct Course {
    let CourseName: String
    let Teacher: [String]
}

struct CardType: Identifiable {
    
    let id = UUID()
    
    var Use: String
    //Card Face
    var Title: String?
    var Caption: String?
    var ColorType: String?
    var ImageRef: String?
    var LongText: String?
    var BackgroundStyle: Int
    let FirebaseID: Int
    var Opacity: Double
    
    //Card Destintation
    var CardData: [DataIdType]
    var Hidden: Bool
    var Contributers: [String]
    var Owners: [String]
}
//Defineing Cutom types end
struct AnErrorHasOcurredView: View{
    var body: some View{
        Text("An Error has Occured")
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
    @Binding var accessToken: String?
    @Binding var GradeIn: Int
    @State var Teacher = ""
    @State var AvaliableCards: [CardType] = []
    @State var BackgroundType: Int = 2
    @State var CardIds: [Int] = []
    var body: some View{
        GeometryReader{ value in
            NavigationView(){
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
                        ForEach($AvaliableCards, id: \.id) { card in
                            Card(TextColor: Color.black, accessToken: $accessToken, SelectedCard: card)
                                .frame(width: value.size.width * 0.9, height: value.size.height * 0.3)
                                .cornerRadius(25)
                        }
                        Spacer()
                    }
                }.onAppear(){
                    Task{
                        do{
                            AvaliableCards = []
                            
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
                                                        let cardDataValueFire = data["CardData"] as! [String]
                                                        let cardDataNameFire = data["CardDataName"] as! [String]
                                                        let BackgroundStyle = data["BackgroundStyle"] as! Int
                                                        let Opacity = data["Opacity"] as! String
                                                        let cardDataTypeFire: [String] = data["CardDataType"] as? NSArray as? [String] ?? []
                                                        let Use = data["Use"] as! String
                                                        var CardDataIn: [DataIdType] = []
                                                        for y in 0..<cardDataNameFire.count{
                                                            CardDataIn.append(DataIdType(Name: cardDataNameFire[y], Id: cardDataValueFire[y], FileType: cardDataTypeFire[y]))
                                                        }
                                                        guard let Hidden = data["Hidden"] as? Bool else {
                                                            return
                                                        }
                                                        guard let Permissions = data["Permissions"] as? NSArray as? [String] else {
                                                            return
                                                        }
                                                        guard let Owners = data["Owners"] as? NSArray as? [String] else {
                                                            return
                                                        }
                                                        if BackgroundStyle == 0{
                                                            let captionFire = data["Caption"] as! String
                                                            let titleFire = data["Title"] as! String
                                                            let ColorFire = data["Color"] as! String
                                                            AvaliableCards.append(CardType(Use: Use, Title: titleFire, Caption: captionFire, ColorType: ColorFire, ImageRef: nil, LongText: nil, BackgroundStyle: BackgroundStyle, FirebaseID: x, Opacity: Double(Opacity)!, CardData: CardDataIn, Hidden: Hidden, Contributers: Permissions, Owners: Owners))
                                                        } else {
                                                            if BackgroundStyle == 1{
                                                                let ImageRefFire = data["ImageRef"] as! String
                                                                AvaliableCards.append(CardType(Use: Use, Title: nil, Caption: nil, ColorType: nil, ImageRef: ImageRefFire, LongText: nil, BackgroundStyle: BackgroundStyle, FirebaseID: x, Opacity: Double(Opacity)!, CardData: CardDataIn, Hidden: Hidden, Contributers: Permissions, Owners: Owners))
                                                            } else {
                                                                if BackgroundStyle == 2{
                                                                    let captionFire = data["Caption"] as! String
                                                                    let titleFire = data["Title"] as! String
                                                                    let ImageRefFire = data["ImageRef"] as! String
                                                                    AvaliableCards.append(CardType(Use: Use, Title: titleFire, Caption: captionFire, ColorType: nil, ImageRef: ImageRefFire, LongText: nil, BackgroundStyle: BackgroundStyle, FirebaseID: x, Opacity: Double(Opacity)!, CardData: CardDataIn, Hidden: Hidden, Contributers: Permissions, Owners: Owners))
                                                                } else {
                                                                    if BackgroundStyle == 3{
                                                                        let ColorFire = data["Color"] as! String
                                                                        let LongTextFire = data["Text"] as! String
                                                                        AvaliableCards.append(CardType(Use: Use, Title: nil, Caption: nil, ColorType: ColorFire, ImageRef: nil, LongText: LongTextFire, BackgroundStyle: BackgroundStyle, FirebaseID: x, Opacity: Double(Opacity)!, CardData: CardDataIn, Hidden: Hidden, Contributers: Permissions, Owners: Owners))
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }//mark
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
}

struct AssignmentTypeQuiz{
    let id: UUID = UUID()
    let Title: String
    let Description: String
    let DueDate: Date?
    let AssignmentEnum: Int
    let DocumentRef:String
    let Class: CourseSelectedType
    let AssignmentDuringClass: Bool
    let SelectedMonth: Int?
    let SelectedDay: Int?
}

struct CoursePersonalOverviewView: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    @Environment(\.colorScheme) var colorScheme
    @Binding var OverrideSelectionView: Bool
    
    @Binding var SelectedCourse: CourseSelectedType
    @Binding var SelectedQuizViewMode: QuizViewMode
    @Binding var OverrideCourseView: Bool
    
    @State var StudentAssignments: [AssignmentTypeQuiz] = []
    
    @State var AssignmentsLoading: Bool = true
    
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
                
                Section{
                    if AssignmentsLoading{
                        ProgressView()
                            .onAppear(){
                                GetAssignments()
                            }
                    } else {
                        ForEach(StudentAssignments, id: \.id) { assignmentValue in
                            Text(assignmentValue.Title)
                        }
                    }
                }
            }.background(Color.marron)
            .scrollContentBackground(.hidden)
        }.background(Color.marron)
    }
    func GetAssignments() {
        let db = Firestore.firestore()
        
        var Index = 0
        for x in WindowMode.SelectedCourses{
            print(x)
            let docRef = db.collection("Grade\(x.Grade)Courses").document("\(x.Name)").collection("Sections").document("\(x.Section)-\(x.Year)").collection("Assignment")
            docRef.getDocuments { (snapshot, error) in
                guard let snapshot = snapshot, error == nil else {
                 //handle error
                 return
               }
               snapshot.documents.forEach({ (documentSnapshot) in
                   let documentData = documentSnapshot.data()
                   let documentID = documentSnapshot.documentID
                   
                   guard let AssignmentEnum = documentData["AssignmentType"] as? Int else {
                       return
                   }
                   guard let AssignmentDescription = documentData["Description"] as? String else {
                       return
                   }
                   guard let AssignmentTitle = documentData["Title"] as? String else {
                       return
                   }
                   guard let AssignmentDuringClass = documentData["AssignmentDuringClass"] as? Bool else {
                       return
                   }
                   
                   if AssignmentDuringClass{
                       guard let AssignmentMonth = documentData["Month"] as? Int else {
                           return
                       }
                       guard let AssignmentDay = documentData["Day"] as? Int else {
                           return
                       }
                    
                       StudentAssignments.append(AssignmentTypeQuiz(Title: AssignmentTitle, Description: AssignmentDescription, DueDate: nil, AssignmentEnum: AssignmentEnum, DocumentRef: documentID, Class: x, AssignmentDuringClass: AssignmentDuringClass, SelectedMonth: AssignmentMonth, SelectedDay: AssignmentDay))
                   } else {
                       guard let AssignmentDueDateTime = documentData["DueDate"] as? Timestamp else {
                           return
                       }
                       let AssignmentDueDate = AssignmentDueDateTime.dateValue()
                       StudentAssignments.append(AssignmentTypeQuiz(Title: AssignmentTitle, Description: AssignmentDescription, DueDate: AssignmentDueDate, AssignmentEnum: AssignmentEnum, DocumentRef: documentID, Class: x, AssignmentDuringClass: AssignmentDuringClass, SelectedMonth: nil, SelectedDay: nil))
                   }
               })
                Index += 1
                if Index == WindowMode.SelectedCourses.count{
                    AssignmentsLoading = false
                }
             }
        }
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
                                SelectedCourse = CourseSelectedType(Name: course, Section: 0, Year: 0, Grade: 0)
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
    @State var SelectedCourse: CourseSelectedType = CourseSelectedType(Name: "Error", Section: 0, Year: 0, Grade: 0)
    
    @Binding var accessToken: String?
    @Binding var MSALAccount: MSALAccount?
    @StateObject var msalModel: MSALScreenViewModel = MSALScreenViewModel()
    
    @State var SelectedQuizViewMode: QuizViewMode = .SelectedGrade
    
    var body: some View{
        if MSALAccount == nil{
            if accessToken?.count ?? 0 <= 10{
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
                    ClassHomePageView(SelectedQuizViewMode: $SelectedQuizViewMode, SelectedCourse: $SelectedCourse, accessToken: $accessToken, GradeIn: $WindowMode.GradeIn)
                }
            }
        } else {
            if accessToken == nil{
                Text("Please Wait One moment well Pauly gets everything ready")
                    .onAppear(){
                        if accessToken?.count ?? 0 <= 10{
                            print("Here")
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
                    ClassHomePageView(SelectedQuizViewMode: $SelectedQuizViewMode, SelectedCourse: $SelectedCourse, accessToken: $accessToken, GradeIn: $WindowMode.GradeIn)
                }
            }
        }
    }
}
