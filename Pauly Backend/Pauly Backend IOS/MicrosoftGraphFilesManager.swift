//
//  MicrosoftGraphFilesManager.swift
//  Pauly Backend
//
//  Created by Andrew Mainella on 2023-04-01.
//

import SwiftUI

enum GraphCallingErrors: Error{
    case APICallFailed
    case ConnotFindAPIInfo
}

enum MicrosoftGraphFilesManagerModes{
    case Home
    case Testing
    case Load
    case Name
}

//Root View Controller
struct MicrosoftGraphFilesManager: View {
    @Binding var AccessToken: String?
    @State var FileData: URL?
    @State var SelectedViewMode: MicrosoftGraphFilesManagerModes = .Home
    @Binding var AvaliableFiles: [GraphFileResponceType]
    var body: some View{
        switch SelectedViewMode {
        case .Home:
            MicrosoftGraphFilesManagerHome(AccessToken: $AccessToken, SelectedViewMode: $SelectedViewMode, AvaliableFiles: $AvaliableFiles)
        case .Testing:
            MicrosoftGraphFilesManagerTesting(AccessToken: $AccessToken, SelectedViewMode: $SelectedViewMode)
        case .Name:
            MicrosoftGraphFilesManagerName(AccessToken: $AccessToken, SelectedViewMode: $SelectedViewMode, FileData: $FileData)
        case .Load:
            MicrosoftGraphFilesMangerLoad(SelectedViewMode: $SelectedViewMode, FileData: $FileData)
        }
    }
}

struct GraphFileResponceType{
    var id: UUID = UUID()
    let Name: String
    let eTag: String
}

struct MicrosoftGraphFilesManagerHome: View{
    @Binding var AccessToken: String?
    @Binding var SelectedViewMode: MicrosoftGraphFilesManagerModes
    @Binding var AvaliableFiles: [GraphFileResponceType]
    @State var LoadingFiles: Bool = true
    var body: some View{
        VStack{
            Text("Files")
            List(){
                if LoadingFiles{
                    ProgressView()
                } else {
                    ForEach(AvaliableFiles, id: \.id){ File in
                        Text(File.Name)
                    }
                }
                Button(){
                    SelectedViewMode = .Home
                } label: {
                    Text("Add File")
                }
                Button(){
                    SelectedViewMode = .Testing
                } label: {
                    Text("Testing")
                }
            }.onAppear(){
                Task{
                    do{
                        try await getFilesMicrosoftGraph(accessToken: AccessToken!)
                    } catch {
                        print(error)
                    }
                }
            }
        }
    }
    func getFilesMicrosoftGraph(accessToken: String) async throws -> Data{
        let url = URL(string: "https://graph.microsoft.com/v1.0/sites/gocrusadersca.sharepoint.com/drive/items/4EFA00B7-260C-4CFC-A09C-EF5F64F40F9F/children")
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
                    // try to read out a string array
                    AvaliableFiles = []
                    let Results = json["value"] as! NSArray as! [[String: Any]]
                    for x in Results{
                        let Name = x["name"] as! String
                        let eTag = x["id"] as! String
                        AvaliableFiles.append(GraphFileResponceType(Name: Name, eTag: eTag))
                    }
                    LoadingFiles = false
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

struct MicrosoftGraphFilesMangerLoad: View{
    @Binding var SelectedViewMode: MicrosoftGraphFilesManagerModes
    @Binding var FileData: URL?
    
    @State private var showingAlert = false
    var body: some View{
        VStack{
            HStack{
                Spacer()
                Button(){
                    SelectedViewMode = .Testing
                } label: {
                    Text("Testing")
                }
            }
            Text("Add Files")
            Button {
                FileData = showOpenPanel()
            } label: {
                RoundedRectangle(cornerRadius: 8)
                    .foregroundColor(.gray.opacity(0.5))
                    .overlay {
                        VStack(spacing: 32) {
                            Image(systemName: "photo")
                                .font(.system(size: 40))
                            Text("Drag and drop image\n or\n Click to select")
                        }
                    }
                    .frame(maxWidth: 320, maxHeight: 320)
                    .padding()
                    .onDrop(of: ["public.file-url"], isTargeted: nil) { providers -> Bool in
                        providers.first?.loadDataRepresentation(forTypeIdentifier: "public.file-url", completionHandler: { (data, error) in
                            if let data = data, let path = NSString(data: data, encoding: 4), let url = URL(string: path as String) {
                                if url.pathExtension == "pdf"{
                                    FileData = url
                                } else {
                                    showingAlert = true
                                }
                            }
                        })
                        return true
                    }
            }.alert("You Can't Add that file type. The only supported file type is pdf.", isPresented: $showingAlert) {
                Button("OK", role: .cancel) { }
            }
            .buttonStyle(.borderless)
            if FileData != nil{
                Button(){
                    SelectedViewMode = .Name
                } label: {
                    Text("Continue")
                }
            }
        }
    }
    func showOpenPanel() -> URL? {
        //TO DO ERROR HANDLING
        let openPanel = NSOpenPanel()
        openPanel.allowedFileTypes = ["pdf"]
        openPanel.allowsMultipleSelection = false
        openPanel.canChooseDirectories = false
        openPanel.canChooseFiles = true
        let response = openPanel.runModal()
        return response == .OK ? openPanel.url : nil
    }
}

struct MicrosoftGraphFilesManagerName: View{
    @Binding var AccessToken: String?
    @Binding var SelectedViewMode: MicrosoftGraphFilesManagerModes
    @State var SelectedTextName: String = ""
    @State var isNotUploading: Bool = true
    @Binding var FileData: URL?
    var body: some View{
        Text("File name")
        TextField("", text: $SelectedTextName)
            .onAppear(){
                SelectedTextName = FileData?.lastPathComponent ?? ""
            }
        if SelectedTextName != ""{
            Button(){
                isNotUploading = false
                if FileData != nil{
                    let FileSize = FindFileSize(filePath: FileData!)
                    if FileSize != nil{
                        if FileSize! <= 3999999{
                            Task{
                                do{
                                    try await UploadDataSmall()
                                } catch{
                                    print(error)
                                }
                            }
                        } else {
                            Task{
                                do{
                                    try await UploadDataLarge()
                                } catch{
                                    print(error)
                                }
                            }
                        }
                    }
                }
            } label: {
                if isNotUploading{
                    Text("Upload")
                } else{
                    ProgressView()
                }
            }
        }
        Button(){
            SelectedViewMode = .Home
        } label: {
            Text("Back")
        }
    }
    func UploadDataLarge() async throws {
        let url = URL(string: "https://graph.microsoft.com/v1.0/sites/gocrusadersca.sharepoint.com/drive/items/01DNRXO756Y2GOVW7725BZO354PWSELRRZ:/\(SelectedTextName):/createUploadSession")
        var request = URLRequest(url: url!)
        // Set the Authorization header for the request. We use Bearer tokens, so we specify Bearer + the token we got from the result
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(AccessToken ?? "Error")", forHTTPHeaderField: "Authorization")
        let JsonDataBody: [String: Any] = ["item": ["@microsoft.graph.conflictBehavior": "replace", "name": "\(SelectedTextName)"] as [String : Any], "deferCommit": true]
        let jsonData = try? JSONSerialization.data(withJSONObject: JsonDataBody)
        request.httpBody = jsonData
        
        do{
            let (data, _) = try await URLSession.shared.data(for: request)
            do {
                // make sure this JSON is in the format we expect
                if let json = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any] {
                    // try to read out a string array
                    print(json)
                    let Uploadurl = json["uploadUrl"] as! String
                    let Dataurl = URL(string: Uploadurl)
                    var DataRequest = URLRequest(url: Dataurl!)
                    DataRequest.httpMethod = "PUT"
                    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
                    let UrlInoutStream = InputStream(url: FileData!)
                    do{
                        let data = try Data(reading: UrlInoutStream!)
                    } catch {
                        print(error)
                    }
                }
            } catch let error as NSError {
                print("Failed to load: \(error.localizedDescription)")
            }
            
        } catch{
            throw GraphCallingErrors.APICallFailed
        }
    }
    func UploadDataSmall() async throws {
        var urlString = SelectedTextName.addingPercentEncoding(withAllowedCharacters: CharacterSet.urlQueryAllowed)
        let url = URL(string: "https://graph.microsoft.com/v1.0/sites/gocrusadersca.sharepoint.com/drive/root:/Pauly/\(urlString!):/content")
        var request = URLRequest(url: url!)
        // Set the Authorization header for the request. We use Bearer tokens, so we specify Bearer + the token we got from the result
        request.httpMethod = "PUT"
        request.setValue("application/pdf", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(AccessToken ?? "Error")", forHTTPHeaderField: "Authorization")
        do{
            let FileDataOut = try Data(contentsOf: FileData!)
            request.httpBody = FileDataOut
        } catch {
            print(error)
        }
        
        do{
            let (data, _) = try await URLSession.shared.data(for: request)
            do {
                // make sure this JSON is in the format we expect
                if let json = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any] {
                    // try to read out a string array
                    print(json)
                    isNotUploading = true
                }
            } catch let error as NSError {
                print("Failed to load: \(error.localizedDescription)")
            }
            
        } catch{
            throw GraphCallingErrors.APICallFailed
        }
    }
    func FindFileSize(filePath: URL) -> Int? {
        do {
            //return [FileAttributeKey : Any]
            let attr = try FileManager.default.attributesOfItem(atPath: filePath.path)
            var fileSize = attr[FileAttributeKey.size] as! UInt64

            //if you convert to NSDictionary, you can get file size old way as well.
            let dict = attr as NSDictionary
            fileSize = dict.fileSize()
            return Int(exactly:fileSize)
        } catch {
            print("Error: \(error)")
        }
        return nil
    }
}

extension Data {
    init(reading input: InputStream) throws {
        self.init()
        input.open()
        defer {
            input.close()
        }

        let bufferSize = 5242880
        let buffer = UnsafeMutablePointer<UInt8>.allocate(capacity: bufferSize)
        defer {
            buffer.deallocate()
        }
        while input.hasBytesAvailable {
            let read = input.read(buffer, maxLength: bufferSize)
            if read < 0 {
                //Stream error occured
                throw input.streamError!
            } else if read == 0 {
                //EOF
                break
            }
            self.append(buffer, count: read)
        }
    }
}

struct MicrosoftGraphFilesManagerTesting: View{
    @Binding var AccessToken: String?
    @Binding var SelectedViewMode: MicrosoftGraphFilesManagerModes
    @State var GraphURL = "https://graph.microsoft.com/v1.0/sites/gocrusadersca.sharepoint.com/drive/items/01DNRXO756Y2GOVW7725BZO354PWSELRRZ:/createUploadSession"
    @State var SelectedApiMode: String = "GET"
    let ApiCallingModes = ["GET", "POST", "PUT"]
    @State var Responce: String = ""
    @State var JsonDatabody: [String: Any] = ["item": ["@microsoft.graph.conflictBehavior": "replace", "name": "Test.txt"] as [String : Any], "deferCommit": true]
    var body: some View {
        VStack{
            HStack{
                Button(){
                    SelectedViewMode = .Home
                } label: {
                    Text("Back")
                }
            }
            Text("Add Files")
            Picker("Api Mode:", selection: $SelectedApiMode){
                ForEach(ApiCallingModes, id: \.self){
                    Text("\($0)")
                }
            }.pickerStyle(.segmented)
            TextField("Input URL", text: $GraphURL)
            Button(){
                GraphURL = "https://graph.microsoft.com/v1.0/sites/gocrusadersca.sharepoint.com/drive/items/4EFA00B7-260C-4CFC-A09C-EF5F64F40F9F/"
            } label: {
                Text("Load Path")
            }
            Button(){
                GraphURL = "https://graph.microsoft.com/v1.0/sites/gocrusadersca.sharepoint.com/drive/items/01DNRXO756Y2GOVW7725BZO354PWSELRRZ:/Image.avif:/createUploadSession"
            } label: {
                Text("Load Upload Session")
            }
            Button(){
                if SelectedApiMode == "GET"{
                    Task{
                        do{
                            try await callMicrosoftGraphForFile(InputURL: GraphURL, accessToken: AccessToken!)
                        } catch{
                            print("\(error)")
                        }
                    }
                } else {
                    if SelectedApiMode == "POST"{
                        Task{
                            do{
                                try await callMicrosoftGraphForFilePOST(InputURL: GraphURL, accessToken: AccessToken!, JsonDataBody: JsonDatabody)
                            } catch{
                                print("\(error)")
                            }
                        }
                    }
                }
            } label: {
                Text("Call graph")
            }
            List(){
                Text(Responce)
                    .textSelection(.enabled)
            }
        }
    }
    func callMicrosoftGraphForFile(InputURL: String, accessToken: String) async throws -> Data{
        let url = URL(string: InputURL)
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
                    // try to read out a string array
                    Responce = "\(json)"
                    print(json)
                }
            } catch let error as NSError {
                print("Failed to load: \(error.localizedDescription)")
            }
            return data
        } catch{
            throw GraphCallingErrors.APICallFailed
        }
    }
    
    func callMicrosoftGraphForFilePOST(InputURL: String, accessToken: String, JsonDataBody: [String:Any]) async throws -> Data{
        let url = URL(string: InputURL)
        var request = URLRequest(url: url!)
        // Set the Authorization header for the request. We use Bearer tokens, so we specify Bearer + the token we got from the result
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        let jsonData = try? JSONSerialization.data(withJSONObject: JsonDataBody)
        request.httpBody = jsonData
        
        do{
            let (data, _) = try await URLSession.shared.data(for: request)
            do {
                // make sure this JSON is in the format we expect
                if let json = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any] {
                    // try to read out a string array
                    Responce = "\(json)"
                    print(json)
                }
            } catch let error as NSError {
                print("Failed to load: \(error.localizedDescription)")
            }
            return data
        } catch{
            throw GraphCallingErrors.APICallFailed
        }
    }
    
    func callMicrosoftGraphForPUT(InputURL: String, accessToken: String) async throws -> Data{
        let url = URL(string: InputURL)
        var request = URLRequest(url: url!)
        // Set the Authorization header for the request. We use Bearer tokens, so we specify Bearer + the token we got from the result
        request.httpMethod = "PUT"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        do{
            let (data, _) = try await URLSession.shared.data(for: request)
            do {
                // make sure this JSON is in the format we expect
                if let json = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any] {
                    // try to read out a string array
                    Responce = "\(json)"
                    print(json)
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
