//
//  HTMLTextView.swift
//  Pauly
//
//  Created by Andrew Mainella on 2023-04-03.
//

import Foundation
//https://stackoverflow.com/questions/56892691/how-to-show-html-or-markdown-in-a-swiftui-text
import WebKit
import SwiftUI

struct HTMLStringView: UIViewRepresentable {
    let htmlContent: String

    func makeUIView(context: Context) -> WKWebView {
        let WebView = WKWebView()
   
        WebView.frame.size = WebView.sizeThatFits(CGSize.zero)
        WebView.scrollView.isScrollEnabled = false
        WebView.scrollView.bounces = false
        return WebView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {
        uiView.loadHTMLString(htmlContent, baseURL: nil)
        uiView.scrollView.zoomScale = 100.0
//        uiView.frame.size.height = 1
//        uiView.frame.size = uiView.sizeThatFits(CGSize.zero)
    }
}

extension WKWebView {

    func zoom(to zoomAmount: CGFloat) {
        evaluateJavaScript("document.body.style.zoom = '\(zoomAmount)'", completionHandler: nil)
    }

}
