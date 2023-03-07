//
//  QuizView.swift
//  Pauly
//
//  Created by Andrew Mainella on 2023-03-02.
//

import Foundation
import SwiftUI

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

struct FactoringBinomials: View{
    @Binding var SelectedMode: SelectedModeCalculusEnum
    @State var FactorDisplay: AttributedString = AttributedString("")
    @State var ShowAns: Bool = false
    @State var Soloution: String = ""
    var body: some View{
        VStack{
            Button("Back"){
                SelectedMode = .Home
            }
            Text(FactorDisplay)
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
                result.append(NSAttributedString(string: "+\((A1 + (S2 * B2)) + (B1 + (S1 * A2)))x+\((S1*A2)*(S2*B2))"))
                if (S1 * A2) >= 0{
                    return (result, "(\(A1)x+\(S1 * A2))(\(B1)x+\(S2 * B2))")
                } else {
                    return (result, "(\(A1)x\(S1 * A2))(\(B1)x+\(S2 * B2))")
                }
            } else{
                var result = NSMutableAttributedString()
                result.append(NSAttributedString(string: "\(A1 * B1)x"))
                result.append(NSAttributedString(string: "2", attributes: [NSAttributedString.Key.baselineOffset: 5]))
                result.append(NSAttributedString(string: "+\((A1 + (S2 * B2)) + (B1 + (S1 * A2)))x\((S1*A2)*(S2*B2))"))
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
                result.append(NSAttributedString(string: "\((A1 + (S2 * B2)) + (B1 + (S1 * A2)))x+\((S1*A2)*(S2*B2))"))
                if (S1 * A2) >= 0{
                    return (result, "(\(A1)x+\(S1 * A2))(\(B1)x+\(S2 * B2))")
                } else {
                    return (result, "(\(A1)x\(S1 * A2))(\(B1)x+\(S2 * B2))")
                }
            } else{
                var result = NSMutableAttributedString()
                result.append(NSAttributedString(string: "\(A1 * B1)x"))
                result.append(NSAttributedString(string: "2", attributes: [NSAttributedString.Key.baselineOffset: 5]))
                result.append(NSAttributedString(string: "\((A1 + (S2 * B2)) + (B1 + (S1 * A2)))x\((S1*A2)*(S2*B2))"))
                if (S1 * A2) >= 0{
                    return (result, "(\(A1)x+\(S1 * A2))(\(B1)x+\(S2 * B2))")
                } else {
                    return (result, "(\(A1)x\(S1 * A2))(\(B1)x+\(S2 * B2))")
                }
            }
        }
    }
}
    
enum SelectedModeCalculusEnum{
    case Home
    case FactoringBinomials
    case Else
}

struct CourseView: View{
    @Binding var ShowingSelectClassView: Bool
    @Binding var SelectedCourse: Course
    @State var SelectedMode: SelectedModeCalculusEnum = .Home
    var body: some View{
        if SelectedMode == .Home{
            VStack{
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
                HStack{
                    Text("\(SelectedCourse.CourseName)")
                        .scaledToFit()
                    Spacer()
                }
                HStack{
                    ForEach(SelectedCourse.Teacher, id: \.self){ teacher in
                        Text(teacher)
                    }
                    Spacer()
                }
                Button("Factoring Binomials"){
                    SelectedMode = .FactoringBinomials
                }
                Spacer()
            }
        } else {
            if SelectedMode == .FactoringBinomials{
                FactoringBinomials(SelectedMode: $SelectedMode)
            }
        }
    }
}

struct CourseSelectionView: View{
    @Binding var ShowingSelectionView: Bool
    @State var AvaliableCourses: [Course] = []
    @State var ShowingSelectClassView: Bool = true
    @State var ShowingErrorMessage: Bool = false
    @State var ErrorMessage = ""
    @State var SelectedClass: GradesEnum
    @State var SelectedCourse: Course = Course(CourseName: "Error", Teacher: ["Error"])
    var body: some View{
        if ShowingSelectClassView{
            if AvaliableCourses.count == 0{
                ProgressView()
                    .onAppear(){
                        Task{
                            var grade: Int = 9
                            if SelectedClass == .Grade_9{
                                grade = 9
                            }
                            if SelectedClass == .Grade_10{
                                grade = 10
                            }
                            if SelectedClass == .Grade_11{
                                grade = 11
                            }
                            if SelectedClass == .Grade_12{
                                grade = 12
                            }
                            let response = try await Functions().LoadDataJsonEcoder(extensionvar: "Classes/\(grade)")
                            print(response.result)
                            if response.result == "Success"{
                                for x in response.classes{
                                    let CourseName: String = x.name
                                    let Teachers: [String] = x.teachers
                                    AvaliableCourses.append(Course(CourseName: CourseName, Teacher: Teachers))
                                }
                            } else {
                                if response.result == "Invalid Parameter"{
                                    ShowingErrorMessage = true
                                    ErrorMessage = "Invalid Parameters"
                                } else {
                                    print(response)
                                }
                            }
                        }
                    }
            } else {
                GeometryReader{ geo in
                    VStack{
                        HStack(){
                            Button{
                                ShowingSelectionView = true
                            } label: {
                                HStack{
                                    Image(systemName: "chevron.backward")
                                    Text("Back")
                                }
                            }.padding(.leading)
                            Spacer()
                            Text("Select \(SelectedClass.rawValue) Class")
                            Spacer()
                            Spacer()
                            Spacer()
                            
                        }
                        List(AvaliableCourses, id: \.CourseName) { course in
                            Button{
                                ShowingSelectClassView = false
                                SelectedCourse = course
                            } label: {
                                Text(course.CourseName)
                            }.buttonStyle(.plain)
                        }.background(Color.marron)
                    }
                }
            }
        } else {
            CourseView(ShowingSelectClassView: $ShowingSelectClassView, SelectedCourse: $SelectedCourse)
        }
    }
}

struct GradeSelectionView: View{
    @Binding var WindowMode: WindowSrceens
    @Binding var SelectedUserGrade: GradesEnum
    @Binding var ShowingSelectionView: Bool
    var body: some View{
        HStack(){
            GeometryReader{ geo in
                HStack{
                    Spacer()
                    VStack(){
                        HStack{
                            Button {
                                WindowMode = .HomePage
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

struct QuizView: View{
    @Binding var WindowMode: WindowSrceens
    @State var SelectedUserGrade: GradesEnum = .Grade_9
    @State var ShowingSelectionView: Bool = true
    var body: some View{
        if ShowingSelectionView{
            GradeSelectionView(WindowMode: $WindowMode, SelectedUserGrade: $SelectedUserGrade, ShowingSelectionView: $ShowingSelectionView)
        } else {
            CourseSelectionView(ShowingSelectionView: $ShowingSelectionView, SelectedClass: SelectedUserGrade)
        }
    }
}
