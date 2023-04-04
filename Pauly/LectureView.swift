//
//  LectureView.swift
//  Pauly
//
//  Created by Andrew Mainella on 2023-03-03.
//

import Foundation
import SwiftUI
import WebKit

enum LectureMode{
    case YoutubeView
    case SelectionView
}

struct DataIdType{
    let Name: String
    let Id: String
    let FileType: String?
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
    @Binding var SelectedMode: SelectedModeCalculusEnum?
    @Binding var Vidoes: [DataIdType]?
    @State var SelectedLectureMode: LectureMode = .SelectionView
    @State var SelectedVideoID: String = "dQw4w9WgXcQ"
    var body: some View{
        if SelectedLectureMode == .SelectionView{
            LecutureSelectionView(SelectedMode: $SelectedMode, SelectedVideoID: $SelectedVideoID, SelectedLectureMode: $SelectedLectureMode, Vidoes: $Vidoes)
        } else {
            if SelectedLectureMode == .YoutubeView{
                Button("Back"){
                    SelectedLectureMode = .SelectionView
                }
                YouTubeView(videoId: SelectedVideoID)
            }
        }
    }
}

struct VideoView: View {
    let VideoID: String
    var body: some View{
        YouTubeView(videoId: VideoID)
    }
}

struct LecutureSelectionView: View {
    @Binding var SelectedMode: SelectedModeCalculusEnum?
    @Binding var SelectedVideoID: String
    @Binding var SelectedLectureMode: LectureMode
    @Binding var Vidoes: [DataIdType]?
//    [DataIdType(Name: "Hot Food", Id: "Akwm2UZJ34o"), DataIdType(Name: "Why Europ is Building", Id: "kc29axOAzRs"), DataIdType(Name: "Why the world most", Id: "WMRip0eRER8"), DataIdType(Name: "Moll", Id: "dQw4w9WgXcQ")]
    @State private var searchText = ""
    var body: some View {
        ZStack {
            Rectangle()
                .fill(Color.marron)
                .edgesIgnoringSafeArea(.all)
            VStack{
                HStack{
                    Button{
                        SelectedMode = .Home
                    } label: {
                        HStack{
                            Image(systemName: "chevron.backward")
                            Text("Back")
                        }
                    }
                    Text("lectureHomePage")
                        .padding(.leading)
                    Spacer()
                }
                TextField("Search", text: $searchText)
                List {
                    ForEach(searchResults, id:\.Name) {idData in
                        Button(idData.Name){
                            SelectedVideoID = idData.Id
                            SelectedLectureMode = .YoutubeView
                        }
                    }
                }.searchable(text: $searchText)
            }
        }
    }
    var searchResults: [DataIdType] {
            if searchText.isEmpty {
                return Vidoes!
            } else {
                return Vidoes!.filter { $0.Name.contains(searchText) }
            }
        }
}
