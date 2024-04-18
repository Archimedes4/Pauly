//
//  CommissionView.swift
//  Pauly App Clip
//
//  Created by Andrew Mainella on 2024-04-10.
//

import SwiftUI

enum NetworkError: Error {
    case badUrl
    case invalidRequest
    case badResponse
    case badStatus
    case failedToDecodeResponse
}

struct ListField: Codable {
    var commissionListId: String
}

struct ListItem: Codable {
    var id: String
    var fields: ListField
}

struct ListItemsResult: Codable {
    var value: [ListItem]
}

struct CommissionField: Codable {
    var Title: String;
    var commissionID: String;
    var points: Int;
    var postChannelId: String;
    var postId: String;
    var postTeamId: String;
    var value: Int;
}

struct CommissionItem: Codable {
    var id: String
    var fields: CommissionField
}

struct CommissionItemsResult: Codable {
    var value: [CommissionItem]
}


struct CommissionView: View {
    @Binding var paulyAccessToken: String
    @Binding var graphAccessToken: String
    @Binding var clipState: ClipStateEnum
    @State var loadedCommissionData: CommissionField?
    func claimCommission() async {
        do {
            clipState = ClipStateEnum.clamingCommission
            let orgWideId = "451cc145-cc7b-433a-9e52-70e646a13d50"
            let commissionId = "b01a0d4d-d94c-46a9-9d92-504a809abdeb"
            let hoomRoomId = "680a045e-7bba-439e-a5fd-57fe45d29a7e"
            guard let url = URL(string: "https://pauly-functions.azurewebsites.net/api/SubmitCommission?orgWideGroupId=\(orgWideId)&commissionId=\(commissionId)&homeroomId=\(hoomRoomId)") else { throw NetworkError.badUrl }
            var request = URLRequest(url: url)
            request.setValue("Bearer \(paulyAccessToken)", forHTTPHeaderField: "Authorization")
            let (data, response) = try await URLSession.shared.data(for: request)
            guard let response = response as? HTTPURLResponse else { throw NetworkError.badResponse }
            guard response.statusCode >= 200 && response.statusCode < 300 else { throw NetworkError.badStatus }
            let dataS = String(bytes: data, encoding: String.Encoding.utf8)
            clipState = ClipStateEnum.claimedCommission
        } catch {
            clipState = ClipStateEnum.commissionError
        }
    }
    func getCommission() async {
        do {
            let orgWideId = "451cc145-cc7b-433a-9e52-70e646a13d50"
            let commissionId = "b01a0d4d-d94c-46a9-9d92-504a809abdeb"
            
            // Get the site Id
            guard let url = URL(string: "https://graph.microsoft.com/v1.0/groups/\(orgWideId)/sites/root?$select=id") else { throw NetworkError.badUrl }
            var getSiteRequest = URLRequest(url: url)
            getSiteRequest.setValue("Bearer \(graphAccessToken)", forHTTPHeaderField: "Authorization")
            let (getSiteData, getSiteResponse) = try await URLSession.shared.data(for: getSiteRequest)
            guard let getSiteResponse = getSiteResponse as? HTTPURLResponse else { throw NetworkError.badResponse }
            guard getSiteResponse.statusCode >= 200 && getSiteResponse.statusCode < 300 else { throw NetworkError.badStatus }
            guard let groupData = try JSONSerialization.jsonObject(with: getSiteData, options: []) as? [String: Any] else { throw NetworkError.failedToDecodeResponse }
            guard let siteId = groupData["id"] as? String else { throw NetworkError.failedToDecodeResponse }
            
            // get Pauly List
            guard let url = URL(string: "https://graph.microsoft.com/v1.0/sites/\(siteId)/lists/PaulyList/items?expand=fields&$select=id") else { throw NetworkError.badUrl }
            var getPaulyListRequest = URLRequest(url: url)
            getPaulyListRequest.setValue("Bearer \(graphAccessToken)", forHTTPHeaderField: "Authorization")
            let (getPaulyListData, getPaulyListResponse) = try await URLSession.shared.data(for: getPaulyListRequest)
            guard let getPaulyListResponse = getPaulyListResponse as? HTTPURLResponse else { throw NetworkError.badResponse }
            guard getPaulyListResponse.statusCode >= 200 && getPaulyListResponse.statusCode < 300 else { throw NetworkError.badStatus }
            let decoder = JSONDecoder()
            let paulyListData = try decoder.decode(ListItemsResult.self, from: getPaulyListData)
            if (paulyListData.value.count < 1) {
                throw NetworkError.failedToDecodeResponse
            }
            let commissionListId = paulyListData.value[0].fields.commissionListId
        
            // get commission
            guard let url = URL(string: "https://graph.microsoft.com/v1.0/sites/\(siteId)/lists/\(commissionListId)/items?expand=fields($select=Title,timed,points,hidden,maxNumberOfClaims,allowMultipleSubmissions,commissionID,value,postTeamId,postChannelId,postId,id)&$filter=fields/commissionID eq '\(commissionId)'&$select=fields,id") else { throw NetworkError.badUrl }
            var getCommissionRequest = URLRequest(url: url)
            getCommissionRequest.setValue("Bearer \(graphAccessToken)", forHTTPHeaderField: "Authorization")
            let (getCommissionData, getCommissionResponse) = try await URLSession.shared.data(for: getCommissionRequest)
            guard let getCommissionResponse = getCommissionResponse as? HTTPURLResponse else { throw NetworkError.badResponse }
            guard getCommissionResponse.statusCode >= 200 && getCommissionResponse.statusCode < 300 else { throw NetworkError.badStatus }
            let commissionData = try decoder.decode(CommissionItemsResult.self, from: getCommissionData)
            if (commissionData.value.count < 1) {
                throw NetworkError.failedToDecodeResponse
            }
            loadedCommissionData = commissionData.value[0].fields
            
        } catch {
            clipState = ClipStateEnum.commissionError
        }
    }
    var body: some View {
        if (loadedCommissionData != nil) {
            VStack {
                Text("Commissions")
                    .font(.custom("Bukhari-Script", size: 70))
                    .foregroundStyle(.white)
                    .fixedSize()
                Text(loadedCommissionData!.Title)
                if (clipState != ClipStateEnum.claimedCommission) {
                    Button(action: {
                        if (clipState == ClipStateEnum.commission) {
                            Task {
                                await claimCommission()
                            }
                        }
                    }) {
                        if (clipState == ClipStateEnum.clamingCommission) {
                            ProgressView()
                                .padding()
                                .padding(.horizontal, 75)
                                .background(Color.white)
                                .clipShape(Capsule())
                                .font(Font.custom("Roboto-Bold", size: 20))
                                .foregroundStyle(.black)
                        } else {
                            Text("Claim Commission")
                                .padding()
                                .padding(.horizontal, 75)
                                .background(Color.white)
                                .clipShape(Capsule())
                                .font(Font.custom("Roboto-Bold", size: 20))
                                .foregroundStyle(.black)
                        }
                    }
                } else {
                    Button(action: {
                        clipState = ClipStateEnum.Message
                    }) {
                        Text("Continue")
                            .padding()
                            .padding(.horizontal, 75)
                            .background(Color.white)
                            .clipShape(Capsule())
                            .font(Font.custom("Roboto-Bold", size: 20))
                            .foregroundStyle(.black)
                    }
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(Color("Maroon"))
        } else {
            VStack {
                Text("Commissions")
                ProgressView()
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(Color("Maroon"))
            .onAppear(perform: {
                Task {
                    await getCommission()
                }
            })
        }
    }
}

//#Preview {
//    CommissionView()
//}
