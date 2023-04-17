//
//  PasswordView.swift
//  Pauly
//
//  Created by Andrew Mainella on 2023-03-18.
//

import SwiftUI
import MSAL
import FirebaseCore
import FirebaseAuth
import FirebaseFirestore
import AVFoundation




struct CreateNewUserPageOneView: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    @Binding var SelectedCourseViewPage: CourseViewPage
    @Binding var SelectedLoginMethod: LoginMethod
    @Binding var MicrosoftCredential: AuthCredential?
    
    @State var TextSize: CGSize = CGSize(width: 0.0, height: 0.0)
    @State var showingAlert = false
    @State var alertMessage = ""
    @State var RectangleOffset: Double = 400
    @State var CustomShapeTrim: Double = 1
    @State var ImageSize: CGSize = CGSize(width: 0, height: 0)
    
    var microsoftProvider : OAuthProvider?
    
    
    init(SelectedCourseViewPage: Binding<CourseViewPage>, SelectedLoginMethod: Binding<LoginMethod>, MicrosoftCredential: Binding<AuthCredential?>){
        self.microsoftProvider = OAuthProvider(providerID: "microsoft.com")
        self._SelectedCourseViewPage = SelectedCourseViewPage
        self._SelectedLoginMethod = SelectedLoginMethod
        self._MicrosoftCredential = MicrosoftCredential
    }
    
    var body: some View{
        GeometryReader{ geo in
            VStack{
                Spacer()
                ZStack{
                    Image("PaulyTextNew")
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .padding(.top)
                        .padding(.top)
                        .padding(.top)
                        .padding(.top)
                        .saveSize(in: $ImageSize)
                        .offset(x: RectangleOffset, y: 0)
                        .clipped() /// use this to prevent circle from going past borders
                            .onAppear {
                                withAnimation(.linear(duration: 2)) {
                                    RectangleOffset = 0
                                }
                            }
                   
                }
                Spacer()
                Button(){
                    signIn()
                } label: {
                    HStack{
                        Image("MicrosoftLogo")
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .frame(height: TextSize.height * 2)
                            .padding(.trailing)
                        VStack{
                            HStack{
                                Text("CONTINUE WITH MICROSFT")
                                    .font(.system(size: 17))
                                    .fontWeight(.bold)
                                    .foregroundColor(.black)
                                    .saveSize(in: $TextSize)
                                Spacer()
                            }
                            HStack{
                                Image(systemName: "exclamationmark.circle")
                                    .aspectRatio(contentMode: .fit)
                                    .foregroundColor(.orange)
                                Text("Recommended")
                                    .foregroundColor(.orange)
                                Spacer()
                            }
                        }
                    }.frame(minWidth: 0, maxWidth: .infinity)
                    .padding()
                    .background(
                        RoundedRectangle(cornerRadius: 25)
                            .fill(Color.white)
                            .shadow(color: .gray, radius: 2, x: 0, y: 2)
                    )
                    .padding()
                }
                Button(){
                    SelectedCourseViewPage = .PageTwoFirebase
                    SelectedLoginMethod = .Firebase
                } label: {
                    VStack{
                        Text("CONTINUE WITHOUT MICROSOFT")
                            .font(.system(size: 17))
                            .fontWeight(.bold)
                            .foregroundColor(.black)
                        HStack{
                            Image(systemName: "exclamationmark.circle")
                                .foregroundColor(.red)
                            Text("Features require a microsoft account!")
                                .foregroundColor(.red)
                        }
                    }.frame(minWidth: 0, maxWidth: .infinity)
                        .padding()
                        .background(
                            RoundedRectangle(cornerRadius: 25)
                                .fill(Color.white)
                                .shadow(color: .gray, radius: 2, x: 0, y: 2)
                        )
                        .padding()
                }
                Button(){
                    WindowMode.SelectedWindowMode = .PasswordWindow
                } label: {
                    Text("BACK")
                        .font(.system(size: 17))
                        .fontWeight(.bold)
                        .foregroundColor(.black)
                        .frame(minWidth: 0, maxWidth: .infinity)
                        .padding()
                        .background(
                            RoundedRectangle(cornerRadius: 25)
                                .fill(Color.white)
                                .shadow(color: .gray, radius: 2, x: 0, y: 2)
                        )
                        .padding()
                        .padding(.bottom)
                        .padding(.bottom)
                        .padding(.bottom)
                }
            }.background(Color.marron)
            .edgesIgnoringSafeArea(.all)
            .alert(isPresented: $showingAlert) {
                Alert(title: Text("Error"), message: Text(alertMessage), dismissButton: .default(Text("OK")))
            }
        }
    }
    func signIn () {
        self.microsoftProvider?.getCredentialWith(_: nil){credential, error in
                   if error != nil {
                       let castedError = error! as NSError
                       print(castedError)
                       // Handle error.

                   }
                   if let credential = credential {
                       SelectedCourseViewPage = .PageTwoMicrosoft
                       SelectedLoginMethod = .Microsoft
                       MicrosoftCredential = credential
                   }
               }
    }
}

//#if DEBUG
//struct CreateNewUserPageOnePreview: PreviewProvider {
//    static var previews: some View {
//        CreateNewUserPageOneView(SelectedCourseViewPage: .constant(.PageOne), SelectedLoginMethod: .constant(.Microsoft), MicrosoftCredential: .constant(.none))
//    }
//}
//#endif

struct CreateNewUserPageTwoViewFirebase: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    
    @Binding var SelectedCourseViewPage: CourseViewPage
    @Binding var UsernameIn: String
    @Binding var GradeIn: Int
    @State var Username: String = ""
    @Binding var Password: String
    @State var ConfirmPassword: String = ""
    @State var SelectedGrade: String = "9"
    @State var ShowingErrorMessage: Bool = false
    @State var ErrorMessage: String = ""
    @State var Grades: [String] = ["9", "10", "11", "12"]
    @State var showingPasswordsDoNotMatch: Bool = false
    @State var showingPleaseEnterAEmail: Bool = false
    @State var showingPleaseEnterAPassword: Bool = false
    
    enum CreateNewUserFocus{
        case Username, Password, ConfirmPassword
    }
    
    @FocusState private var focusedField: CreateNewUserFocus?
    
    var body: some View{
        GeometryReader{ value in
            ScrollView(.vertical, showsIndicators: false){
                VStack{
                    Group{
                        Spacer()
                        Spacer()
                        Spacer()
                        Text("Create New User")
                            .font(.custom("Chalkboard SE", size: 45.0, relativeTo: .largeTitle))
                            .padding()
                        Button{
                            focusedField = .Username
                        } label: {
                            TextField("", text: $Username)
                                .multilineTextAlignment(.leading)
                                .textContentType(.username)
                                .keyboardType(.default)
                                .placeholder(when: Username.isEmpty) {
                                        Text("Email").foregroundColor(.black)
                                }
                                .autocapitalization(.none)
                                .frame(width: value.size.width * 0.83, height: value.size.height * 0.1, alignment: .leading)
                                .cornerRadius(15)
                                .padding()
                                .background(
                                    RoundedRectangle(cornerRadius: 25)
                                        .fill(Color.white)
                                        .shadow(color: .gray, radius: 2, x: 0, y: 2)
                                )
                                .onAppear(){
                                    focusedField = .Username
                                }
                                .focused($focusedField, equals: .Username)
                        }
                    }
                    
                    if showingPleaseEnterAEmail{
                        HStack{
                            Image(systemName: "exclamationmark.circle")
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                                .foregroundColor(.red)
                            Text("Please Enter A Email!")
                                .foregroundColor(.red)
                        }.frame(height: value.size.height * 0.035)
                    }
                    
                    Button{
                        focusedField = .Password
                    } label: {
                        TextField("", text: $Password)
                            .multilineTextAlignment(.leading)
                            .textContentType(.newPassword)
                            .keyboardType(.default)
                            .placeholder(when: Password.isEmpty) {
                                    Text("Password").foregroundColor(.black)
                            }
                            .autocapitalization(.none)
                            .frame(width: value.size.width * 0.83, height: value.size.height * 0.1, alignment: .leading)
                            .padding()
                            .background(
                                RoundedRectangle(cornerRadius: 25)
                                    .fill(Color.white)
                                    .shadow(color: .gray, radius: 2, x: 0, y: 2)
                            )
                            .focused($focusedField, equals: .Password)
                    }
                    .padding(.top)
                    
                    if showingPleaseEnterAPassword{
                        HStack{
                            Image(systemName: "exclamationmark.circle")
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                                .foregroundColor(.red)
                            Text("Please Enter A Password!")
                                .foregroundColor(.red)
                        }.frame(height: value.size.height * 0.035)
                    }
                    
                    Button{
                        focusedField = .ConfirmPassword
                    } label: {
                        SecureField("", text: $ConfirmPassword)
                            .multilineTextAlignment(.leading)
                            .textContentType(.newPassword)
                            .keyboardType(.default)
                            .placeholder(when: ConfirmPassword.isEmpty) {
                                    Text("Confirm Password").foregroundColor(.black)
                            }
                            .autocapitalization(.none)
                            .frame(width: value.size.width * 0.83, height: value.size.height * 0.1, alignment: .leading)
                            .padding()
                            .background(
                                RoundedRectangle(cornerRadius: 25)
                                    .fill(Color.white)
                                    .shadow(color: .gray, radius: 2, x: 0, y: 2)
                            )
                            .padding(.top)
                            .focused($focusedField, equals: .ConfirmPassword)
                    }
                    
                    if showingPasswordsDoNotMatch{
                        HStack{
                            Image(systemName: "exclamationmark.circle")
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                                .foregroundColor(.red)
                            Text("Passwords Do Not Match!")
                                .foregroundColor(.red)
                        }.frame(height: value.size.height * 0.035)
                    }
                    
                    Button{
                        
                    } label: {
                        Menu{
                            Picker(selection: $SelectedGrade) {
                                ForEach(Grades, id: \.self) {
                                    Text($0)
                                }
                            } label: {
                                EmptyView()
                            }.pickerStyle(.automatic)
                        } label: {
                            Text(SelectedGrade)
                                .padding(.leading, value.size.width * 0.05)
                                .frame(width: value.size.width * 0.83, height: value.size.height * 0.1, alignment: .leading)
                                .padding()
                                .foregroundColor(.black)
                                .background(
                                    RoundedRectangle(cornerRadius: 25)
                                        .fill(Color.white)
                                        .shadow(color: .gray, radius: 2, x: 0, y: 2)
                                )
                        }
                    }
                    .padding(.top)
                    
                    Button(){
                        if Username != "" {
                            showingPleaseEnterAEmail = false
                            if Password != ""{
                                showingPleaseEnterAPassword = false
                                if Password == ConfirmPassword{
                                    GradeIn = Int(SelectedGrade) ?? 8
                                    UsernameIn = Username
                                    SelectedCourseViewPage = .PageThree
                                } else {
                                    showingPasswordsDoNotMatch = true
                                }
                            } else {
                                showingPleaseEnterAPassword = true
                            }
                        } else {
                            showingPleaseEnterAEmail = true
                        }
                        //TO DO Next
                    } label: {
                        Text("NEXT")
                            .font(.system(size: 17))
                            .fontWeight(.bold)
                            .foregroundColor(.black)
                            .frame(minWidth: 0, maxWidth: .infinity)
                            .padding()
                            .background(
                                RoundedRectangle(cornerRadius: 25)
                                    .fill(Color.white)
                                    .shadow(color: .gray, radius: 2, x: 0, y: 2)
                            )
                            .padding()
                    }
                    Button{
                        SelectedCourseViewPage = .PageOne
                    } label: {
                        Text("BACK")
                            .font(.system(size: 17))
                            .fontWeight(.bold)
                            .foregroundColor(.black)
                            .frame(minWidth: 0, maxWidth: .infinity)
                            .padding()
                            .background(
                                RoundedRectangle(cornerRadius: 25)
                                    .fill(Color.white)
                                    .shadow(color: .gray, radius: 2, x: 0, y: 2)
                            )
                            .padding()
                    }.padding(.top, -15)
                }
            }.background(Color.marron)
            .frame(width: value.size.width * 1.0)
            .edgesIgnoringSafeArea(.all)
        }
    }
}

struct CreateNewUserPageTwoMicrosoft: View{
    @Binding var SelectedCourseViewPage: CourseViewPage
    @Binding var GradeIn: Int
    @Binding var SelectedSection: Int
    
    @State var showingAlert = false
    @State var alertMessage = ""
    
    @State var SelectedGrade: Int = 9
    @State var Grades: [Int] = [9, 10, 11, 12]
    
    
    let AvaliableSections: [Int] = [1, 2, 3, 4, 5, 6, 7]
    
    var body: some View{
        GeometryReader{ value in
            VStack{
                Spacer()
                Image("LoginToMicrosoft")
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                Spacer()
                Button{
                    
                } label: {
                    Menu{
                        Picker(selection: $SelectedGrade) {
                            ForEach(Grades, id: \.self) {
                                Text("\($0)")
                            }
                        } label: {
                            EmptyView()
                        }.pickerStyle(.automatic)
                    } label: {
                        Text("Grade: \(SelectedGrade)")
                            .padding(.leading, value.size.width * 0.05)
                            .frame(width: value.size.width * 0.83, height: value.size.height * 0.1, alignment: .leading)
                            .padding()
                            .foregroundColor(.black)
                            .background(
                                RoundedRectangle(cornerRadius: 25)
                                    .fill(Color.white)
                                    .shadow(color: .gray, radius: 2, x: 0, y: 2)
                            )
                    }
                }
                .padding(.top)
                Button{
                    
                } label: {
                    Menu{
                        Picker("Please choose a Section", selection: $SelectedSection) {
                            ForEach(AvaliableSections, id: \.self) {
                                Text("\($0)")
                            }
                        }.frame(width: value.size.width * 0.76, height: value.size.height * 0.055, alignment: .leading)
                        .padding()
                        .foregroundColor(.black)
                        .pickerStyle(.automatic)
                    } label: {
                        Text("Section: \(SelectedSection)")
                            .padding(.leading, value.size.width * 0.05)
                            .frame(width: value.size.width * 0.83, height: value.size.height * 0.1, alignment: .leading)
                            .padding()
                            .foregroundColor(.black)
                            .background(
                                RoundedRectangle(cornerRadius: 25)
                                    .fill(Color.white)
                                    .shadow(color: .gray, radius: 2, x: 0, y: 2)
                            )
                    }

                }.background(
                    RoundedRectangle(cornerRadius: 25)
                        .fill(Color.white)
                        .shadow(color: .gray, radius: 2, x: 0, y: 2)
                )
                .padding(.top)
                
                Button(){
                    SelectedCourseViewPage = .PageFour
                    GradeIn = SelectedGrade
                } label: {
                    Text("NEXT")
                        .font(.system(size: 17))
                        .fontWeight(.bold)
                        .foregroundColor(.black)
                        .frame(minWidth: 0, maxWidth: .infinity)
                        .padding()
                        .background(
                            RoundedRectangle(cornerRadius: 25)
                                .fill(Color.white)
                                .shadow(color: .gray, radius: 2, x: 0, y: 2)
                        )
                        .padding()
                }
                
                Button{
                    SelectedCourseViewPage = .PageOne
                } label: {
                    Text("BACK")
                        .font(.system(size: 17))
                        .fontWeight(.bold)
                        .foregroundColor(.black)
                        .frame(minWidth: 0, maxWidth: .infinity)
                        .padding()
                        .background(
                            RoundedRectangle(cornerRadius: 25)
                                .fill(Color.white)
                                .shadow(color: .gray, radius: 2, x: 0, y: 2)
                        )
                        .padding()
                }.padding(.top, -15)
            } .alert(isPresented: $showingAlert) {
                Alert(title: Text("Error"), message: Text(alertMessage), dismissButton: .default(Text("OK")))
            }
            .background(Color.marron)
        }
    }
}

struct CreateNewUserPageThreeView: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    
    @Binding var SelectedCourseViewPage: CourseViewPage
    @Binding var UsernameIn: String
    @Binding var GradeIn: Int
    @Binding var Password: String
    @Binding var FirstName: String
    @Binding var LastName: String
    @Binding var SelectedSection: Int
    
    @State var ConfirmPassword: String = ""
    @State var SelectedGrade: String = "9"
    @State var ShowingErrorMessage: Bool = false
    @State var ErrorMessage: String = ""
    @State var Grades: [String] = ["9", "10", "11", "12"]
    @State var showingPasswordsDoNotMatch: Bool = false
    @State var showingPleaseEnterAEmail: Bool = false
    @State var showingPleaseEnterAPassword: Bool = false
    
    let AvaliableSections: [Int] = [1, 2, 3, 4, 5, 6, 7]
    
    var body: some View{
        GeometryReader{ value in
            ScrollView(.vertical, showsIndicators: false){
                VStack{
                    Group{
                        Spacer()
                        Spacer()
                        Spacer()
                        Text("Create New User")
                            .font(.custom("Chalkboard SE", size: 45.0))
                            .padding()
                        Button{
                            
                        } label: {
                            ZStack{
                                TextField("", text: $FirstName)
                                    .multilineTextAlignment(.leading)
                                    .textContentType(.username)
                                    .keyboardType(.default)
                                    .placeholder(when: FirstName.isEmpty) {
                                            Text("First Name").foregroundColor(.black)
                                    }
                                    .autocapitalization(.none)
                                    .background(Color.white)
                                    .frame(width: value.size.width * 0.76, height: value.size.height * 0.075, alignment: .leading)
                                    .cornerRadius(15)
                                    .padding()
                            }.padding()
                        }.background(
                            RoundedRectangle(cornerRadius: 25)
                                .fill(Color.white)
                                .shadow(color: .gray, radius: 2, x: 0, y: 2)
                        )
                    }
                    
                    if showingPleaseEnterAEmail{
                        HStack{
                            Image(systemName: "exclamationmark.circle")
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                                .foregroundColor(.red)
                            Text("Please Enter A First Name!")
                                .foregroundColor(.red)
                        }
                    }
                    
                    Button{
                        
                    } label: {
                        ZStack{
                            TextField("", text: $LastName)
                                .multilineTextAlignment(.leading)
                                .textContentType(.newPassword)
                                .keyboardType(.default)
                                .placeholder(when: LastName.isEmpty) {
                                        Text("Last Name").foregroundColor(.black)
                                }
                                .autocapitalization(.none)
                                .background(Color.white)
                                .frame(width: value.size.width * 0.76, height: value.size.height * 0.075, alignment: .leading)
                                .cornerRadius(15)
                                .padding()
                        }.padding()
                    }.background(
                        RoundedRectangle(cornerRadius: 25)
                            .fill(Color.white)
                            .shadow(color: .gray, radius: 2, x: 0, y: 2)
                    )
                    .padding(.top)
                    
                    if showingPleaseEnterAPassword{
                        HStack{
                            Image(systemName: "exclamationmark.circle")
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                                .foregroundColor(.red)
                            Text("Please Enter A Last Name!")
                                .foregroundColor(.red)
                        }
                    }
                    
                    Button{
                        
                    } label: {
                        ZStack{
                            Picker("Please choose a Section", selection: $SelectedSection) {
                                ForEach(AvaliableSections, id: \.self) {
                                    Text("\($0)")
                                }
                            }.frame(width: value.size.width * 0.76, height: value.size.height * 0.055, alignment: .leading)
                            .padding()
                            .foregroundColor(.black)
                            .pickerStyle(.menu)
                        }.padding()
                    }.background(
                        RoundedRectangle(cornerRadius: 25)
                            .fill(Color.white)
                            .shadow(color: .gray, radius: 2, x: 0, y: 2)
                    )
                    .padding(.top)
                    
                    Button(){
                        SelectedCourseViewPage = .PageFour
                    } label: {
                        Text("NEXT")
                            .font(.system(size: 17))
                            .fontWeight(.bold)
                            .foregroundColor(.black)
                            .frame(minWidth: 0, maxWidth: .infinity)
                            .padding()
                            .background(
                                RoundedRectangle(cornerRadius: 25)
                                    .fill(Color.white)
                                    .shadow(color: .gray, radius: 2, x: 0, y: 2)
                            )
                            .padding()
                    }
                    Button{
                        SelectedCourseViewPage = .PageTwoFirebase
                    } label: {
                        Text("BACK")
                            .font(.system(size: 17))
                            .fontWeight(.bold)
                            .foregroundColor(.black)
                            .frame(minWidth: 0, maxWidth: .infinity)
                            .padding()
                            .background(
                                RoundedRectangle(cornerRadius: 25)
                                    .fill(Color.white)
                                    .shadow(color: .gray, radius: 2, x: 0, y: 2)
                            )
                            .padding()
                    }.padding(.top, -15)
                }
            }.background(Color.marron)
            .frame(width: value.size.width * 1.0)
            .edgesIgnoringSafeArea(.all)
        }
    }
}

struct CourseSelectedType{
    var id: UUID = UUID()
    let Name: String
    let Section: Int
    let Year: Int
    let Grade: Int
}

struct CreateNewUserPageFourSectionView: View{
    @State var AvaliableSections: [Int] = []
    
    @Binding var SelectedCourseViewPage: CourseViewPage
    @Binding var SelectedCourses: [CourseSelectedType]
    @Binding var Grade: Int
    @Binding var CourseName: String
    
    var body: some View{
        ZStack{
            Rectangle()
                .fill(Color.marron)
                .edgesIgnoringSafeArea(.all)
            VStack{
                HStack{
                    Button{
                        SelectedCourseViewPage = .PageFour
                    } label: {
                        HStack{
                            Image(systemName: "chevron.backward")
                            Text("Back")
                        }
                    }.padding(.leading)
                    Text("Please Choose a Section")
                }
                if AvaliableSections.count != 0{
                    List{
                        ForEach(AvaliableSections, id: \.self){ section in
                            Button(){
                                SelectedCourses.append(CourseSelectedType(Name: CourseName, Section: section, Year: 2023, Grade: Grade))   //TO DO ADD YEAR
                                SelectedCourseViewPage = .PageFour
                                
                            } label: {
                                Text("\(section)")
                            }
                        }
                    }.background(Color.marron)
                    .scrollContentBackground(.hidden)
                } else {
                    VStack{
                        Spacer()
                        ProgressView()
                        Text("If loading is taking a long time there are no sections")
                        Spacer()
                    }
                    
                }
            }.onAppear(){
                Task{
                    do{
                        let db = Firestore.firestore()
                        let docRef = db.collection("Grade\(Grade)Courses").document(CourseName).collection("Sections")
                        docRef.getDocuments { (snapshot, error) in
                            guard let snapshot = snapshot, error == nil else {
                             //handle error
                             return
                           }
                           snapshot.documents.forEach({ (documentSnapshot) in
                               let documentData = documentSnapshot.data()
                               let CoureseSectionNewUser = documentData["Section"] as? Int ?? 0
                               if CoureseSectionNewUser != 0 {
                                   AvaliableSections.append(CoureseSectionNewUser)
                               }
                           })
                         }
                    } catch {
                        print("Error")
                    }
                }
            }
        }
    }
}

struct CreateNewUserPageFourView: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    
    @Environment(\.colorScheme) var colorScheme
    
    @Binding var SelectedCourseViewPage: CourseViewPage
    @Binding var Username: String
    @Binding var Password: String
    @Binding var GradeIn: Int
    @Binding var CoursesSelected: [CourseSelectedType]
    @Binding var FirstName: String
    @Binding var LastName: String
    @Binding var SelectedSection: Int
    @Binding var CourseSelected: String
    @Binding var AvaliableCourses: [String]
    @Binding var SelectedLoginMethod: LoginMethod
    @State var ManditoryCourses: [String] = []
    
    @State var CurrentSchoolYear: Int = 2023
    @State var ErrorMessage: String = ""
    @State var ShowingErrorMessage: Bool = false
    let Sections: [Int] = [1,2,3,4,5,6,7]
    
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
                                GetManditoryCourses()
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
                        Spacer()
                        Text("Select Grade \(GradeIn) Class")
                            .foregroundColor(colorScheme == .dark ? Color.black : Color.white)
                        Spacer()
                    }
                    List{
                        Section{
                            ForEach(CoursesSelected, id: \.id){ course in
                                HStack{
                                    Text("\(course.Name)    Section:\(course.Section)")
                                    Spacer()
                                    Button{
                                        if let Index = CoursesSelected.firstIndex(where: { $0.id == course.id }){
                                            CoursesSelected.remove(at: Index)
                                            AvaliableCourses.append(course.Name)
                                        }
                                    } label: {
                                        Image(systemName: "minus.circle")
                                            .foregroundColor(.red)
                                    }.buttonStyle(.plain)
                                    
                                }
                            }
                        }
                        //.shadow(color: .gray, radius: 2, x: 0, y: 2) //To DO add shadow to section
    
                        Section{
                            ForEach(AvaliableCourses, id: \.self){ course in
                                Button{
                                    CourseSelected = course
                                    SelectedCourseViewPage = .PageFourSection
                                } label: {
                                    Text(course)
                                }.buttonStyle(.plain)
                            }
                        }
                    //.shadow(color: .gray, radius: 2, x: 0, y: 2)
                    }.background(Color.marron)
                    .scrollContentBackground(.hidden)
                    Button(){
                        SelectedCourseViewPage = .PageFive
                    } label: {
                        Text("CONFIRM")
                            .font(.system(size: 17))
                            .fontWeight(.bold)
                            .foregroundColor(.black)
                            .frame(minWidth: 0, maxWidth: .infinity)
                            .padding()
                            .background(
                                RoundedRectangle(cornerRadius: 25)
                                    .fill(Color.white)
                                    .shadow(color: .gray, radius: 2, x: 0, y: 2)
                            )
                            .padding()
                    }
                    Button(){
                        if SelectedLoginMethod == .Microsoft{
                            SelectedCourseViewPage = .PageTwoMicrosoft
                        } else {
                            if SelectedLoginMethod == .Firebase{
                                SelectedCourseViewPage = .PageTwoFirebase
                            } else {
                                SelectedCourseViewPage = .PageOne
                            }
                        }
                    } label: {
                        Text("BACK")
                            .font(.system(size: 17))
                            .fontWeight(.bold)
                            .foregroundColor(.black)
                            .frame(minWidth: 0, maxWidth: .infinity)
                            .padding()
                            .background(
                                RoundedRectangle(cornerRadius: 25)
                                    .fill(Color.white)
                                    .shadow(color: .gray, radius: 2, x: 0, y: 2)
                            )
                            .padding()
                    }
                }.background(Color.marron)
            }
        }
    }
    func GetManditoryCourses() {
        Task{
            do{
                ManditoryCourses = []
                let db = Firestore.firestore()
                
                let docRef = db.collection("MandatoryCourses").document("Grade\(GradeIn)")
                docRef.getDocument { (document, error) in
                     guard error == nil else {
                         print("error", error ?? "")
                         return
                     }

                     if let document = document, document.exists {
                         let data = document.data()
                         if let data = data {
                             ManditoryCourses = data["Courses"] as! NSArray as? [String] ?? []
                             for k in ManditoryCourses{
                                 let secRef = db.collection("Grade\(GradeIn)Courses").document(k).collection("Sections").document("\(SelectedSection)-\(CurrentSchoolYear)")
                                 
                                 secRef.getDocument { (secdocument, error) in
                                     guard error == nil else {
                                         print("error", error ?? "")
                                         return
                                     }
                                     
                                     if let secdocument = secdocument, secdocument.exists {
                                         let secdata = secdocument.data()
                                         if let secdata = secdata{
                                             let Section = secdata["Section"] as? Int
                                             if Section != nil{
                                                 let CourseName = secdata["CourseName"] as? String
                                                 let SchoolYear = secdata["School Year"] as? Int
                                                 if let Index = AvaliableCourses.firstIndex(where: { $0 == CourseName }){
                                                     AvaliableCourses.remove(at: Index)
                                                     CoursesSelected.append(CourseSelectedType(Name: CourseName!, Section: Section!, Year: SchoolYear!, Grade: GradeIn))
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
    }
}

struct CreateNewUserPageFiveView: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    @Binding var SelectedLoginMethod: LoginMethod
    
    //User Info
    @Binding var Username: String
    @Binding var Password: String
    @Binding var GradeIn: Int
    @Binding var FirstName: String
    @Binding var LastName: String
    @Binding var CoursesSelected: [CourseSelectedType]
    @Binding var SelectedSection: Int
    @Binding var MicrosoftCredential: AuthCredential?
    
    //ANIMATION
    @State var AnimationStarted: Bool = false
    
    @State var rotateCheckMark = 30
    @State var showCheckMark = -60
    
    var animationDuration: Double = 2.50
    var onAnimationFinish: (() -> Void)?
    
    @State private var outerTrimEnd: CGFloat = 0
    @State private var innerTrimEnd: CGFloat = 0
    var size: CGSize = .init(width: 500, height: 500)
    var innerShapeSizeRatio: CGFloat = 1/3
    
    var body: some View{
        ZStack{
            Rectangle()
                .fill(Color.marron)
                .edgesIgnoringSafeArea(.all)
            VStack{
                if AnimationStarted{
                    Checkmark()
                        .trim(from: 0, to: innerTrimEnd)
                        .stroke(.green, style: StrokeStyle(lineWidth: 30, lineCap: .round, lineJoin: .round))
                        .frame(width: size.width * innerShapeSizeRatio,
                               height: size.height * innerShapeSizeRatio)
                } else {
                    ProgressView()
                        .onAppear(){
                            if SelectedLoginMethod == .Microsoft{
                                CreateNewUserWithMicrosoft()
                            } else {
                                if SelectedLoginMethod == .Firebase{
                                    CreateNewUserWithFirebase()
                                }
                            }
                        }
                }
            }
        }
    }
    func animate() {
            withAnimation(.linear(duration: 0.5 * animationDuration)) {
                outerTrimEnd = 1.0
            }
            withAnimation(
                .linear(duration: 0.3 * animationDuration)
                .delay(0.5 * animationDuration)
            ) {
                innerTrimEnd = 1.0
            }
        DispatchQueue.main.asyncAfter(deadline: .now() + animationDuration) {
            onAnimationFinish?()
            withAnimation(){
                WindowMode.SelectedWindowMode = .HomePage
            }
        }
    }
    func CreateNewUserWithMicrosoft() {
           Auth.auth().signIn(with: MicrosoftCredential!) { (authResult, error) in
               if error != nil {
                   let castedError = error! as NSError
                   print(castedError)
                   // Handle error.
               }

               guard let authResult = authResult else {
                   print("Couldn't get graph authResult")
                   return
               }

               // get credential and token when login successfully
               let microCredential = authResult.credential as! OAuthCredential
               let token = microCredential.accessToken!
               guard let url = URL(string: "https://graph.microsoft.com/v1.0/me") else { fatalError("Missing URL") }

               var urlRequest = URLRequest(url: url)
               urlRequest.httpMethod = "GET"
               urlRequest.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

               URLSession.shared.dataTask(with: urlRequest) { data, response, error in

                   if let error = error {
                       print("Error")
                       return
                   }
                   guard let result2 = try? JSONDecoder().decode(GraphResponce.self, from: data!) else {
                       print("OH NO REE")
                       return
                   }
                   FirstName = result2.givenName ?? "Nope"
                   LastName = result2.surname ?? "Nope"
                   Username = result2.mail ?? "Nope"
                   Task{
                       await SaveUserData()
                   }
               }.resume()
           }
    }
    func CreateNewUserWithFirebase() {
        //TO DO CHECK IF USER EXISTS IN FIREBASE BEFORE WRITE AS IN THEY CREATE TWO USERS WITH DIFFERENT EMAILS BUT SAME NAME
        if FirstName != "" && LastName != ""{
            Auth.auth().createUser(withEmail: Username, password: Password) { authResult, error in
                if error != nil{
                    print(error?.localizedDescription)
                } else {
                    Task{
                        await SaveUserData()
                    }
                }
            }
        }
    }
    func SaveUserData() async {
        let db = FirebaseFirestore.Firestore.firestore()
        
        let user = Auth.auth().currentUser
        if let user = user {
          // The user's ID, unique to the Firebase project.
          // Do NOT use this value to authenticate with your backend server,
          // if you have one. Use getTokenWithCompletion:completion: instead.
            let uid = user.uid
            WindowMode.UsernameIn = uid
            let docRef = db.collection("Users").document(uid)
            var OutputCoursesSelected: [String] = []
            for m in CoursesSelected{
                OutputCoursesSelected.append("\(m.Grade)-\(m.Name)-\(m.Section)-\(m.Year)")
            }
            
            let inputData: [String: Any] = [
                "First Name":FirstName,
                "Last Name": LastName,
                "Classes":OutputCoursesSelected,
                "Grade":GradeIn,
                "Email":Username,
                "uid":uid,
                "Groups":[] as [String],
                "Score":0,
                "Section":SelectedSection,
                "Permissions":[] as [String],
                "Title":"Student",
                "MemberGroups":[] as [String],
                "CompletedCommissions":[] as [Int]
            ]
            
            docRef.setData(inputData) { error in
                if let error = error {
                    print("Error writing document: \(error)")
                } else {
                    AudioServicesPlaySystemSound(1320)
                    AnimationStarted = true
                    animate()
   
                }
            }
        } else {
            print("Nope")
        }
    }
}


#if DEBUG
struct CreateNewUserPageFivePreview: PreviewProvider {
    static var previews: some View {
        CreateNewUserPageFiveView(SelectedLoginMethod: .constant(.Microsoft), Username: .constant("Hello"), Password: .constant("Text"), GradeIn: .constant(8), FirstName: .constant("Test"), LastName: .constant("Hello"), CoursesSelected: .constant([]), SelectedSection: .constant(2), MicrosoftCredential: .constant(nil))
    }
}
#endif

struct Checkmark: Shape {
    func path(in rect: CGRect) -> Path {
        let width = rect.size.width
        let height = rect.size.height
        
        var path = Path()
        path.move(to: .init(x: 0 * width, y: 0.5 * height))
        path.addLine(to: .init(x: 0.4 * width, y: 1.0 * height))
        path.addLine(to: .init(x: 1.0 * width, y: 0 * height))
        return path
    }
}

enum CourseViewPage{
    case PageOne
    case PageTwoFirebase
    case PageTwoMicrosoft
    case PageThree
    case PageFourSection
    case PageFour
    case PageFive
}

enum LoginMethod{
    case Microsoft
    case Firebase
}

struct CreateNewUserView: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    
    @Binding var GradeIn: Int
    
    @State var UsernameIn: String = ""
    @State var FirstName: String = ""
    @State var LastName: String = ""
    @State var Password: String = ""
    @State var SelectedCourseViewPage: CourseViewPage = .PageOne
    
    @State var CoursesSelected: [CourseSelectedType] = []
    @State var SelectedSection: Int = 1
    @State var CourseSelected: String = ""
    @State var AvaliableCourses: [String] = []
    
    @State var SelectedLoginMethod: LoginMethod = .Firebase
    
    @State var MicrosoftCredential: AuthCredential?
    
    var body: some View{
        switch SelectedCourseViewPage {
        case .PageOne:
            CreateNewUserPageOneView(SelectedCourseViewPage: $SelectedCourseViewPage, SelectedLoginMethod: $SelectedLoginMethod, MicrosoftCredential: $MicrosoftCredential)
                .environmentObject(WindowMode)
        case .PageTwoFirebase:
            CreateNewUserPageTwoViewFirebase(SelectedCourseViewPage: $SelectedCourseViewPage, UsernameIn: $UsernameIn, GradeIn: $GradeIn, Password: $Password)
                .environmentObject(WindowMode)
        case .PageTwoMicrosoft:
            CreateNewUserPageTwoMicrosoft(SelectedCourseViewPage: $SelectedCourseViewPage, GradeIn: $GradeIn, SelectedSection: $SelectedSection)
        case .PageThree:
            CreateNewUserPageThreeView(SelectedCourseViewPage: $SelectedCourseViewPage, UsernameIn: $UsernameIn, GradeIn: $GradeIn, Password: $Password, FirstName: $FirstName, LastName: $LastName, SelectedSection: $SelectedSection)
                .environmentObject(WindowMode)
        case .PageFourSection:
            CreateNewUserPageFourSectionView(SelectedCourseViewPage: $SelectedCourseViewPage, SelectedCourses: $CoursesSelected, Grade: $WindowMode.GradeIn, CourseName: $CourseSelected)
        case .PageFour:
            CreateNewUserPageFourView(SelectedCourseViewPage: $SelectedCourseViewPage, Username: $UsernameIn, Password: $Password, GradeIn: $GradeIn, CoursesSelected: $CoursesSelected, FirstName: $FirstName, LastName: $LastName, SelectedSection: $SelectedSection, CourseSelected: $CourseSelected, AvaliableCourses: $AvaliableCourses, SelectedLoginMethod: $SelectedLoginMethod)
                .environmentObject(WindowMode)
        case .PageFive:
            CreateNewUserPageFiveView(SelectedLoginMethod: $SelectedLoginMethod, Username: $UsernameIn, Password: $Password, GradeIn: $GradeIn, FirstName: $FirstName, LastName: $LastName, CoursesSelected: $CoursesSelected, SelectedSection: $SelectedSection, MicrosoftCredential: $MicrosoftCredential)
                .environmentObject(WindowMode)
        }
    }
}
