//
//  LocationServices.swift
//  Pauly
//
//  Created by Andrew Mainella on 2023-03-31.
//

import SwiftUI
import FirebaseFirestore

import Foundation
import CoreLocation

class LocationDataManager : NSObject, ObservableObject, CLLocationManagerDelegate {
    var locationManager = CLLocationManager()
    @Published var authorizationStatus: CLAuthorizationStatus?
    
    override init() {
        super.init()
        locationManager.delegate = self
    }
    
    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        switch manager.authorizationStatus {
        case .authorizedWhenInUse:  // Location services are available.
            // Insert code here of what should happen when Location services are authorized
            authorizationStatus = .authorizedWhenInUse
            locationManager.requestLocation()
            break
            
        case .restricted:  // Location services currently unavailable.
            // Insert code here of what should happen when Location services are NOT authorized
            authorizationStatus = .restricted
            break
            
        case .denied:  // Location services currently unavailable.
            // Insert code here of what should happen when Location services are NOT authorized
            authorizationStatus = .denied
            break
            
        case .notDetermined:        // Authorization not determined yet.
            authorizationStatus = .notDetermined
            manager.requestWhenInUseAuthorization()
            break
            
        default:
            break
        }
    }
    
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        // Insert code to handle location updates
    }
    
    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        print("error: \(error.localizedDescription)")
    }
    
    
}

struct LocationServices: View {
    @EnvironmentObject var WindowMode: SelectedWindowMode
    @StateObject var locationDataManager = LocationDataManager()
    @Binding var SelectedCommision: CommitionType
    @State var PaulyRecieved: Bool = false
    @Binding var SheetPresented: Bool
    @Binding var isCommissionComplete: Bool?
    var body: some View {
        VStack {
            switch locationDataManager.locationManager.authorizationStatus {
            case .authorizedWhenInUse:  // Location services are available.
                // Insert code here of what should happen when Location services are authorized

                let coordinate1 = CLLocation(latitude: Double((locationDataManager.locationManager.location?.coordinate.latitude.description)!)!, longitude: Double((locationDataManager.locationManager.location?.coordinate.longitude.description)!)!) //TO DO HANDLE THIS ERROR IF CANNOT FIND LOCATION

                
                let distanceInMeters = coordinate1.distance(from: SelectedCommision.Location!) //TO DO ERROR HANDLING
                
                if distanceInMeters <= SelectedCommision.Proximity!{
                    //Success
                    if PaulyRecieved{
                        VStack{
                            Text("Congradulations You Pauly Points have been added.")
                            Button(){
                                SheetPresented = false
                            } label: {
                                Text("OK")
                            }
                        }
                    } else {
                        ProgressView("Telling Pauly You have complete the commission")
                            .onAppear(){
                                let db = Firestore.firestore()

                                let docRef = db.collection("Users").document(WindowMode.UsernameIn)
                                
                                print(SelectedCommision.Score)
                                docRef.updateData(["Score": FieldValue.increment(Int64(SelectedCommision.Score)), "CompletedCommissions":FieldValue.arrayUnion([SelectedCommision.FirebaseID])]) { error in
                                    if let error = error {
                                        print("Error updating document: \(error)")
                                        //TO DO HANDLE ERROR
                                    } else {
                                        PaulyRecieved = true
                                        isCommissionComplete = true
                                    }
                                }
                            }
                    }
                } else {
                    //Failure
                    Text("You are not close enough to claim this")
                        .onAppear(){
                            print(distanceInMeters)
                        }
                }
            case .restricted, .denied:  // Location services currently unavailable.
                // Insert code here of what should happen when Location services are NOT authorized
                Text("Current location data was restricted or denied.")
            case .notDetermined:        // Authorization not determined yet.
                Text("Finding your location...")
                ProgressView()
            default:
                ProgressView()
            }
        }
    }
}
