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
    @Binding var WindowMode: WindowSrceens
    var body: some View{
        Text("lectureHomePage")
        CollectionView()
        Button("Back"){
            WindowMode = .HomePage
        }
    }
}

struct CollectionView: View {
    var ids = ["Akwm2UZJ34o", "kc29axOAzRs", "WMRip0eRER8"]
    var body: some View {
        ZStack {
            Image("cover")
                .resizable().opacity(0.2)
            ScrollView(showsIndicators: false) {
                VStack {
                    Text("Demo")
                        .font(.title)

                    ForEach(ids, id:\.self) {idData in
                        YouTubeView(videoId: idData)
                            .frame(width: 300, height: 300)
                            .padding()
                    }

                }
            }

        }
    }
}
