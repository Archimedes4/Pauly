//
//  PDFview.swift
//  Pauly
//
//  Created by Andrew Mainella on 2023-03-08.
//

import Foundation

//https://stackoverflow.com/questions/65658339/how-to-implement-pdf-viewer-to-swiftui-application
import PDFKit
import SwiftUI

struct PDFKitRepresentedView: UIViewRepresentable {
    typealias UIViewType = PDFView
    
    let data: Data
    let singlePage: Bool

    init(_ data: Data, singlePage: Bool = false) {
        self.data = data
        self.singlePage = singlePage
    }

    func makeUIView(context _: UIViewRepresentableContext<PDFKitRepresentedView>) -> UIViewType {
        // Create a `PDFView` and set its `PDFDocument`.
        let pdfView = PDFView()
        pdfView.document = PDFDocument(data: data)
        pdfView.autoScales = true
        if singlePage {
            pdfView.displayMode = .singlePage
        }
        return pdfView
    }

    func updateUIView(_ pdfView: UIViewType, context _: UIViewRepresentableContext<PDFKitRepresentedView>) {
        pdfView.document = PDFDocument(data: data)
    }
}

class PDFKitFunction : ObservableObject{
    @Published var FinalData: Data?
    
    enum APICallingError: Error{
        case Fatal
        case InvalidURL
    }
    
    
    public func CallData(URLInputString: String) async throws -> Data {
        guard let url = URL(string: URLInputString) else {
            print("Invalid url...")
            throw APICallingError.InvalidURL
        }
        var request = URLRequest(url: url)
        do {
            let (data, _) = try await URLSession.shared.data(for: request)
            return data
        } catch {
            print(String(describing: error))
            throw APICallingError.Fatal
        }
        throw APICallingError.Fatal
    }
}
