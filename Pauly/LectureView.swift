//
//  LectureView.swift
//  Pauly
//
//  Created by Andrew Mainella on 2023-03-03.
//

import Foundation
import SwiftUI
import WebKit

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
    @EnvironmentObject var WindowMode: SelectedWindowMode
    
    @State var SelectedLectureMode: LectureMode = .SelectionView
    @State var SelectedVideoID: String = "dQw4w9WgXcQ"
    var body: some View{
        if SelectedLectureMode == .SelectionView{
            LecutureSelectionView(SelectedVideoID: $SelectedVideoID, SelectedLectureMode: $SelectedLectureMode)
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

enum LectureMode{
    case YoutubeView
    case SelectionView
}

struct VideoView: View {
    let VideoID: String
    var body: some View{
        YouTubeView(videoId: VideoID)
    }
}

struct LecutureSelectionView: View {
    @EnvironmentObject var WindowMode: SelectedWindowMode
    
    @Binding var SelectedVideoID: String
    @Binding var SelectedLectureMode: LectureMode
    var ids = ["Akwm2UZJ34o", "kc29axOAzRs", "WMRip0eRER8", "dQw4w9WgXcQ"]
    var body: some View {
        ZStack {
            Image("cover")
                .resizable().opacity(0.2)
            ScrollView(showsIndicators: false) {
                VStack {
                    HStack{
                        Button("Back"){
                            WindowMode.SelectedWindowMode = .HomePage
                        }
                        Spacer()
                        Text("lectureHomePage")
                        Spacer()
                    }
                    ForEach(ids, id:\.self) {idData in
                        Button(idData){
                            SelectedVideoID = idData
                            SelectedLectureMode = .YoutubeView
                        }
                    }
                }
            }
        }
    }
}
