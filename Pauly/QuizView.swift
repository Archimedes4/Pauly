//
//  QuizView.swift
//  Pauly
//
//  Created by Andrew Mainella on 2023-03-02.
//

import Foundation
import SwiftUI

enum GradesEnum{
    case Unselected
    case Grade9
    case Grade10
    case Grade11
    case Grade12
}

struct Course {
    let CourseName: String
    let Grade: [Int]
    let Teacher: String
}

let Grade11Coures = [
    Course(CourseName: "Intro To Calculus and Advanced Math", Grade: [11, 12], Teacher: "Mr. Christopher Regeher"),
    Course(CourseName: "Computer Science", Grade: [11], Teacher: "Mrs. Latimer")
]

struct FactoringBinomials: View{
    @Binding var SelectedMode: SelectedModeCalculusEnum
    @State var FactorDisplay: AttributedString = AttributedString("")
    @State var ShowAns: Bool = false
    @State var Soloution: String = ""
    var body: some View{
        VStack{
            Button("Back"){
                SelectedMode = .Select
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
    case Select
    case FactoringBinomials
    case Else
}

struct CalculusView: View{
    @Binding var SelectedClass: Grade11Classes
    @State var SelectedMode: SelectedModeCalculusEnum = .Select
    var body: some View{
        if SelectedMode == .Select{
            Button("Back"){
                SelectedClass = .SelectClass
            }
            Text("Calculus View")
            Button("Factoring Binomials"){
                SelectedMode = .FactoringBinomials
            }
        } else {
            if SelectedMode == .FactoringBinomials{
                FactoringBinomials(SelectedMode: $SelectedMode)
            }
        }
    }
}

enum Grade9Classes{
    case SelectClass
    case SocialStudies
    case English
    case Religion
    case Math
    case French
    case Gym
}

enum Grade11Classes{
    case SelectClass
    case ComputerScience
    case Calculus
    case English
    case French
    case Religion
    case History
    case Physics
    case Chemistry
    case Math
}

struct Grade11View: View{
    @State var SelectedClass: Grade11Classes = .SelectClass
    @State var ShowingErrorMessage: Bool = false
    @State var ErrorMessage = ""
    var body: some View{
        if SelectedClass == .SelectClass{
            VStack{
                Text("Select Class")
                ForEach(Grade11Coures, id: \.CourseName) { Course in
                    Button{
                        SelectedClass = .Calculus
                    } label: {
                        HStack{
                            Text(Course.CourseName)
                            Text(Course.Teacher)
                        }
                    }
                }
            }.onAppear(){
                Task{
                    let response = try await Functions().LoadDataJsonEcoder(extensionvar: "Classes/11")
                    print(response.result)
                    if response.result == "Success"{
                        response.grade11ResponseClass
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
        }
        if SelectedClass == .Calculus{
            CalculusView(SelectedClass: $SelectedClass)
        }
    }
}

struct QuizView: View{
    @Binding var WindowMode: WindowSrceens
    @State var SelectedUserGrade: GradesEnum = .Unselected
    var body: some View{
        if SelectedUserGrade == .Unselected{
            VStack{
                Button("Grade 9"){
                    SelectedUserGrade = .Grade9
                }
                Button("Grade 10"){
                    SelectedUserGrade = .Grade10
                }
                Button("Grade 11"){
                    SelectedUserGrade = .Grade11
                }
                Button("Grade 12"){
                    SelectedUserGrade = .Grade12
                }
            }
        }
        if SelectedUserGrade == .Grade9{
            Button("Back"){
                WindowMode = .HomePage
            }
        }
        if SelectedUserGrade == .Grade10{
            Button("Back"){
                WindowMode = .HomePage
            }
        }
        if SelectedUserGrade == .Grade11 {
            Grade11View()
        }
        if SelectedUserGrade == .Grade12{
            Button("Back"){
                WindowMode = .HomePage
            }
        }
    }
}
