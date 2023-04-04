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
    
    
    public func CallData(ItemId: String, accessToken: String) async throws -> Data {
        let url = URL(string: "https://graph.microsoft.com/v1.0/sites/gocrusadersca.sharepoint.com/drive/items/\(ItemId)")
        var request = URLRequest(url: url!)
        // Set the Authorization header for the request. We use Bearer tokens, so we specify Bearer + the token we got from the result
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        do{
            let (data, _) = try await URLSession.shared.data(for: request)
            do {
                // make sure this JSON is in the format we expect
                if let json = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any] {
                    
                    let Results = (json["@microsoft.graph.downloadUrl"] as? String)!
                    
                    guard let url = URL(string: Results) else {
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
            } catch let error as NSError {
                print("Failed to load: \(error.localizedDescription)")
            }
            return data
        } catch{
            throw GraphCallingErrors.APICallFailed
        }
    }
}
