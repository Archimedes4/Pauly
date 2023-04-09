//
//  LectureView.swift
//  Pauly
//
//  Created by Andrew Mainella on 2023-03-03.
//

import Foundation
import SwiftUI
import WebKit

struct DataIdType{
    let id: UUID = UUID()
    var Name: String
    var Id: String
    var FileType: String
}

struct YouTubeView: UIViewRepresentable {
    let videoId: String
    func makeUIView(context: Context) ->  WKWebView {
        return WKWebView()
    }
    func updateUIView(_ uiView: WKWebView, context: Context) {
        guard let demoURL = URL(string: "https://www.youtube.com/embed/\(videoId)") else { return }
        uiView.scrollView.isScrollEnabled = false
        uiView.load(URLRequest(url: demoURL))
    }
}

struct LetureHomePage: View{
    @State var Vidoe: DataIdType
    var body: some View{
        YouTubeView(videoId: Vidoe.Id)
    }
}

//struct LecutureSelectionView: View {
//    @Binding var SelectedVideoID: String
//    @Binding var SelectedLectureMode: LectureMode
//    @Binding var Vidoes: [DataIdType]?
////    [DataIdType(Name: "Hot Food", Id: "Akwm2UZJ34o"), DataIdType(Name: "Why Europ is Building", Id: "kc29axOAzRs"), DataIdType(Name: "Why the world most", Id: "WMRip0eRER8"), DataIdType(Name: "Moll", Id: "dQw4w9WgXcQ")]
//    @State private var searchText = ""
//    var body: some View {
//        ZStack {
//            Rectangle()
//                .fill(Color.marron)
//                .edgesIgnoringSafeArea(.all)
//            VStack{
//                HStack{
//                    Spacer()
//                    Text("lectureHomePage")
//                        .padding(.leading)
//                    Spacer()
//                }
//                TextField("Search", text: $searchText)
//                List {
//                    ForEach(searchResults, id:\.Name) {idData in
//                        Button(idData.Name){
//                            SelectedVideoID = idData.Id
//                            SelectedLectureMode = .YoutubeView
//                        }
//                    }
//                }.searchable(text: $searchText)
//            }
//        }
//    }
//    var searchResults: [DataIdType] {
//            if searchText.isEmpty {
//                return Vidoes!
//            } else {
//                return Vidoes!.filter { $0.Name.contains(searchText) }
//            }
//        }
//}
