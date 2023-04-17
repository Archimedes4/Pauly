//
//  GovernmentViewCommissions.swift
//  Pauly
//
//  Created by Andrew Mainella on 2023-04-07.
//

import SwiftUI
import FirebaseFirestore
import CoreLocation
import MapKit
import UIKit

struct GovernmentCommissionsView: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    @Binding var SelectedGovernmentViewMode: GovernmentViewModes
    @State var AvaliableCommitions: [CommitionType] = []
    @State var CommissionsLoaded: Bool = false
    @Environment(\.colorScheme) var colorScheme
    var body: some View{
        NavigationView(){
            VStack{
                HStack{
                    Button(){
                        SelectedGovernmentViewMode = .Home
                    } label: {
                        HStack {
                            Image(systemName: "chevron.backward")
                                .padding(.leading)
                            Text("Back")
                        }
                    }
                    Spacer()
                }
                Text("Commission")
                if CommissionsLoaded{
                    ScrollView{
                        ForEach(AvaliableCommitions, id: \.FirebaseID){ Commission in
                            NavigationLink(destination: GovernmentEditCommissionsView(SelectedCommission: Commission).environmentObject(WindowMode)){
                                VStack{
                                    HStack{
                                        Text(Commission.Title)
                                            .font(.headline)
                                            .foregroundColor(colorScheme == .light ? Color.black:Color.white)
                                        Spacer()
                                    }
                                    HStack{
                                        Text(Commission.Caption)
                                            .font(.caption)
                                            .foregroundColor(colorScheme == .light ? Color.black:Color.white)
                                        Spacer()
                                    }
                                }.padding()
                                .padding()
                                .background(
                                        RoundedRectangle(cornerRadius: 25)
                                            .foregroundColor(colorScheme == .dark ? Color.black:Color.white)
                                )
                                .padding()
                            }
                        }
                    }
                } else {
                    Spacer()
                    ProgressView()
                        .onAppear(){
                            FetchCommitions()
                        }
                    Spacer()
                }
                NavigationLink(destination: GovernmentAddCommissionsView()){
                    HStack{
                        Text("Add Commission")
                            .font(.system(size: 17))
                            .fontWeight(.bold)
                            .foregroundColor(colorScheme == .light ? Color.black:Color.white)
                        Spacer()
                    }
                    .frame(minWidth: 0, maxWidth: .infinity)
                    .padding([.top, .bottom])
                    .padding()
                    .background(
                        RoundedRectangle(cornerRadius: 25)
                            .foregroundColor(colorScheme == .dark ? Color.black:Color.white)
                            .shadow(color: .gray, radius: 2, x: 0, y: 2)
                    )
                    .padding()
                }
            }.background(Color.marron)
        }
    }
    func FetchCommitions() {
        Task{
            do{
                let db = Firestore.firestore()

                let docRef = db.collection("Commissions")
                docRef.getDocuments { (snapshot, error) in
                    guard let snapshot = snapshot, error == nil else {
                     //handle error
                     return
                   }
                   snapshot.documents.forEach({ (documentSnapshot) in
                       let documentData = documentSnapshot.data()

                       let CardID = documentData["FirebaseID"] as? Int ?? 0
                       
                       if CardID != 0 {
                           let CardStartStamp = documentData["StartDate"] as! Timestamp
                           let CardStart = CardStartStamp.dateValue()
                           let CardTitle = documentData["Title"] as? String ?? "Error"
                           let CardCaption = documentData["Caption"] as? String ?? "Error"
                           let CardEndStamp = documentData["EndDate"] as? Timestamp
                           let CardEnd = CardEndStamp!.dateValue()
                           let CardHidden = documentData["Hidden"] as? Bool
                           let CardValue = documentData["Value"] as? Int
                           let CardSelectedCards = documentData["SelectedCards"] as! NSArray as? [Int]
                           let CardProximity = documentData["Proximity"] as? Double
                           let CardCoordinate = documentData["Coordinate"] as? GeoPoint
                           var CardLocation: CLLocation?
                           if CardCoordinate != nil{
                               CardLocation = CLLocation(latitude: CardCoordinate!.latitude, longitude: CardCoordinate!.longitude)
                           }
                           let CardScore = documentData["Points"] as? Int ?? 0

                           AvaliableCommitions.append(CommitionType(Title: CardTitle, Caption: CardCaption, StartDate: CardStart, EndDate: CardEnd, Cards: CardSelectedCards!, Hidden: CardHidden!, FirebaseID: CardID, Value: CardValue!, Score: CardScore, Location: CardLocation, Proximity: CardProximity))
                       }
                       
                   })
                    CommissionsLoaded = true
                 }
            } catch {
                print("Error")
            }
        }
    }
}

struct GovernmentEditCommissionsView: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    @State var SelectedCommission: CommitionType
    @State var Cards: [Int] = []
    @State var Hidden: Bool = false
    @State var FirebaseID: Int = 0
    @State var Value: Int = 1
    @State var Score: Int = 0
    @State var Location: CLLocation?
    @State var Proximity: Double?
    @State var ShowingStartDate: Bool = false
    @State var ShowingEndDate: Bool = false
    @State var presentAlert: Bool = false
    var body: some View{
        ZStack{
            Rectangle()
                .foregroundColor(Color.marron)
                .ignoresSafeArea()
            VStack{
                Text("Edit Commission")
                TextField("Title", text: $SelectedCommission.Title)
                    .padding()
                TextField("Caption", text: $SelectedCommission.Caption)
                    .padding()
                Button(){
                    ShowingStartDate = true
                } label: {
                    HStack{
                        Text("Pick Start Date")
                            .font(.system(size: 17))
                            .fontWeight(.bold)
                            .foregroundColor(.black)
                        Spacer()
                    }
                    .frame(minWidth: 0, maxWidth: .infinity)
                    .padding()
                    .background(
                        RoundedRectangle(cornerRadius: 25)
                            .fill(Color.white)
                            .shadow(color: .gray, radius: 2, x: 0, y: 2)
                    )
                    .padding()
                }.sheet(isPresented: $ShowingStartDate){
                    HStack{
                        Button(){
                            ShowingStartDate = false
                        } label: {
                            HStack {
                                Image(systemName: "chevron.backward")
                                    .padding(.leading)
                                Text("Back")
                            }
                        }
                        Spacer()
                    }
                    DatePicker("Enter Start Date", selection: $SelectedCommission.StartDate)
                        .datePickerStyle(GraphicalDatePickerStyle())
                        .frame(maxHeight: 400)
                }
                
                Button(){
                    ShowingEndDate = true
                } label: {
                    HStack{
                        Text("Pick End Date")
                            .font(.system(size: 17))
                            .fontWeight(.bold)
                            .foregroundColor(.black)
                        Spacer()
                    }
                    .frame(minWidth: 0, maxWidth: .infinity)
                    .padding()
                    .background(
                        RoundedRectangle(cornerRadius: 25)
                            .fill(Color.white)
                            .shadow(color: .gray, radius: 2, x: 0, y: 2)
                    )
                    .padding()
                }.sheet(isPresented: $ShowingEndDate){
                    HStack{
                        Button(){
                            ShowingEndDate = false
                        } label: {
                            HStack {
                                Image(systemName: "chevron.backward")
                                    .padding(.leading)
                                Text("Back")
                            }
                        }
                        Spacer()
                    }
                    DatePicker("Enter End Date", selection: $SelectedCommission.EndDate)
                        .datePickerStyle(GraphicalDatePickerStyle())
                        .frame(maxHeight: 400)
                }
                
                NavigationLink(destination: GovernmentSelectedCardsView(Cards: $SelectedCommission.Cards)){
                    HStack{
                        Text("Selected Cards")
                            .font(.system(size: 17))
                            .fontWeight(.bold)
                            .foregroundColor(.black)
                        Spacer()
                    }
                    .frame(minWidth: 0, maxWidth: .infinity)
                    .padding()
                    .background(
                        RoundedRectangle(cornerRadius: 25)
                            .fill(Color.white)
                            .shadow(color: .gray, radius: 2, x: 0, y: 2)
                    )
                    .padding()
                }
                NavigationLink(destination: GovernmentAddCardsView(Cards: $SelectedCommission.Cards).environmentObject(WindowMode)){
                    HStack{
                        Text("Add Cards")
                            .font(.system(size: 17))
                            .fontWeight(.bold)
                            .foregroundColor(.black)
                        Spacer()
                    }
                    .frame(minWidth: 0, maxWidth: .infinity)
                    .padding()
                    .background(
                        RoundedRectangle(cornerRadius: 25)
                            .fill(Color.white)
                            .shadow(color: .gray, radius: 2, x: 0, y: 2)
                    )
                    .padding()
                }
                Picker("Choose Commission Type", selection: $SelectedCommission.Value){
                    Text("Select").tag(0)
                }
                Button(){
                    presentAlert = true
                } label: {
                    HStack{
                        Text("Delete Commission")
                            .font(.system(size: 17))
                            .fontWeight(.bold)
                            .foregroundColor(.black)
                        Spacer()
                    }
                    .frame(minWidth: 0, maxWidth: .infinity)
                    .padding()
                    .background(
                        RoundedRectangle(cornerRadius: 25)
                            .fill(Color.white)
                            .shadow(color: .gray, radius: 2, x: 0, y: 2)
                    )
                    .padding()
                }.alert("Are you sure?", isPresented: $presentAlert, actions: {
                    // 1
                    Button("Cancel", role: .cancel, action: {})
                    
                    Button("PERMANATLY DELETE COMMISSION", role: .destructive, action: {
                        let db = Firestore.firestore()
                        
                        db.collection("Commissions").document("\(SelectedCommission.FirebaseID)").delete() { err in
                          if let err = err {
                            print("Error removing document: \(err)")
                          }
                          else {
                            print("Document successfully removed!")
                          }
                        }
                    })
                }, message: {
                    Text("THIS WILL PERMANATLY DELETE YOUR ACCOUNT")
                })
                Spacer()
            }
        }
    }
}

struct GovernmentAddCommissionsView: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    @State var Title: String = ""
    @State var Caption: String = ""
    @State var StartDate: Date = Date.now
    @State var EndDate: Date = Date.now
    @State var Cards: [Int] = []
    @State var Hidden: Bool = false
    @State var FirebaseID: Int = 0
    @State var Value: Int = 1
    @State var Score: Int = 0
    @State var Location: CLLocation?
    @State var Proximity: Double = 0
    @State var ShowingStartDate: Bool = false
    @State var ShowingEndDate: Bool = false
    @State var CommissionLoading: Bool = false
    @Environment(\.presentationMode) var presentationMode
    var body: some View{
        GeometryReader{ geo in
            ZStack{
                Rectangle()
                    .fill(Color.marron)
                    .ignoresSafeArea()
                ScrollView{
                    VStack{
                        Group{
                            Text("Add Commission")
                                .font(.title)
                            TextField("", text: $Title)
                                .padding([.top, .bottom])
                                .placeholder(when: Title.isEmpty) {
                                    Text("Title").foregroundColor(.black)
                                }
                            TextField("", text: $Caption)
                                .padding([.top, .bottom])
                                .placeholder(when: Caption.isEmpty) {
                                    Text("Caption").foregroundColor(.black)
                                }
                        }
                        Picker("Points", selection: $Score){
                            ForEach(0..<1001){ value in
                                Text("\(value)")
                            }
                        }.pickerStyle(.wheel)
                        Button(){
                            ShowingStartDate = true
                        } label: {
                            HStack{
                                Text("Pick Start Date")
                                    .font(.system(size: 17))
                                    .fontWeight(.bold)
                                    .foregroundColor(.black)
                                Spacer()
                            }
                            .frame(minWidth: 0, maxWidth: .infinity)
                            .padding([.top, .bottom])
                            .padding()
                            .background(
                                RoundedRectangle(cornerRadius: 25)
                                    .fill(Color.white)
                                    .shadow(color: .gray, radius: 2, x: 0, y: 2)
                            )
                            .padding()
                        }.sheet(isPresented: $ShowingStartDate){
                            HStack{
                                Button(){
                                    ShowingStartDate = false
                                } label: {
                                    HStack {
                                        Image(systemName: "chevron.backward")
                                            .padding(.leading)
                                        Text("Back")
                                    }
                                }
                                Spacer()
                            }
                            DatePicker("Enter Start Date", selection: $StartDate)
                                .datePickerStyle(GraphicalDatePickerStyle())
                                .frame(maxHeight: 400)
                        }
                        Button(){
                            ShowingEndDate = true
                        } label: {
                            HStack{
                                Text("Pick End Date")
                                    .font(.system(size: 17))
                                    .fontWeight(.bold)
                                    .foregroundColor(.black)
                                Spacer()
                            }
                            .frame(minWidth: 0, maxWidth: .infinity)
                            .padding([.top, .bottom])
                            .padding()
                            .background(
                                RoundedRectangle(cornerRadius: 25)
                                    .fill(Color.white)
                                    .shadow(color: .gray, radius: 2, x: 0, y: 2)
                            )
                            .padding()
                        }.sheet(isPresented: $ShowingEndDate){
                            HStack{
                                Button(){
                                    ShowingEndDate = false
                                } label: {
                                    HStack {
                                        Image(systemName: "chevron.backward")
                                            .padding(.leading)
                                        Text("Back")
                                    }
                                }
                                Spacer()
                            }
                            DatePicker("Enter End Date", selection: $EndDate)
                                .datePickerStyle(GraphicalDatePickerStyle())
                                .frame(maxHeight: 400)
                        }
                        NavigationLink(destination: GovernmentSelectedCardsView(Cards: $Cards)){
                            HStack{
                                Text("Selected Cards")
                                    .font(.system(size: 17))
                                    .fontWeight(.bold)
                                    .foregroundColor(.black)
                                Spacer()
                            }
                            .frame(minWidth: 0, maxWidth: .infinity)
                            .padding([.top, .bottom])
                            .padding()
                            .background(
                                RoundedRectangle(cornerRadius: 25)
                                    .fill(Color.white)
                                    .shadow(color: .gray, radius: 2, x: 0, y: 2)
                            )
                            .padding()
                        }
                        NavigationLink(destination: GovernmentAddCardsView(Cards: $Cards).environmentObject(WindowMode)){
                            HStack{
                                Text("Add Cards")
                                    .font(.system(size: 17))
                                    .fontWeight(.bold)
                                    .foregroundColor(.black)
                                Spacer()
                            }
                            .frame(minWidth: 0, maxWidth: .infinity)
                            .padding([.top, .bottom])
                            .padding()
                            .background(
                                RoundedRectangle(cornerRadius: 25)
                                    .fill(Color.white)
                                    .shadow(color: .gray, radius: 2, x: 0, y: 2)
                            )
                            .padding()
                        }
                        Picker("Choose Commission Type", selection: $Value){
                            Text("Select").tag(0)
                            Text("President").tag(1)
                            Text("Location").tag(2)
                            Text("Image").tag(3)
                            Text("Location - Image").tag(4)
                            Text("QR Code").tag(5)
                        }.pickerStyle(.wheel)
                        if Value == 2{
                            VStack{
                                GovernmentLocationCommissionsView(Proximity: $Proximity)
                            }.frame(height: geo.size.height * 0.5)
                        } else {
                            Spacer()
                        }
                        Button(){
                            if Title != nil && EndDate >= StartDate{
                                ConfirmCommission()
                            }
                        } label: {
                            if CommissionLoading{
                                ProgressView()
                                .frame(minWidth: 0, maxWidth: .infinity)
                                .padding([.top, .bottom])
                                .padding()
                                .background(
                                    RoundedRectangle(cornerRadius: 25)
                                        .fill(Color.white)
                                        .shadow(color: .gray, radius: 2, x: 0, y: 2)
                                )
                                .padding()
                            } else {
                                HStack{
                                    Text("Confirm")
                                        .font(.system(size: 17))
                                        .fontWeight(.bold)
                                        .foregroundColor(.black)
                                    Spacer()
                                }
                                .frame(minWidth: 0, maxWidth: .infinity)
                                .padding([.top, .bottom])
                                .padding()
                                .background(
                                    RoundedRectangle(cornerRadius: 25)
                                        .fill(Color.white)
                                        .shadow(color: .gray, radius: 2, x: 0, y: 2)
                                )
                                .padding()
                            }
                        }
                    }.background(Color.marron)
                }
            }.navigationBarBackButtonHidden(true)
                .navigationBarItems(leading: Button("Back"){self.presentationMode.wrappedValue.dismiss()})
        }
    }
    func ConfirmCommission() {
        CommissionLoading = true
        let db = Firestore.firestore()
        
        let docRef = db.collection("Commissions").document("CommissionsCount")
        
        docRef.getDocument() { (document, error) in
            guard error == nil  else {
                return
            }
            
            if let document = document, document.exists {
                let data = document.data()
                if let data = data {
                    guard let CommissionCount = data["CommissionsCount"] as? Int else{
                        return
                    }
                    let commisionDocRef = db.collection("Commissions").document("\(CommissionCount + 1)")
                    var InputData = [
                        "Title":Caption,
                        "Caption":Title,
                        "StartDate":StartDate,
                        "EndDate":EndDate,
                        "Hidden":Hidden,
                        "Points":Score,
                        "Value":Value,
                        "SelectedCards":Cards,
                        "FirebaseID":(CommissionCount + 1)
                    ] as [String : Any]
                    
                    if Value == 2{
                        InputData["Proximity"] = Proximity
                        InputData["Coordinate"] = Location
                    }
                    commisionDocRef.setData(InputData)
                    docRef.updateData(["CommissionsCount": (CommissionCount + 1)])
                    CommissionLoading = false
                }
            }
            
        }
    }
}

struct Location: Identifiable {
    let id = UUID()
    let name: String
    let coordinate: CLLocationCoordinate2D
}

struct GovernmentLocationCommissionsView: View{
    @StateObject var locationDataManager = LocationDataManager()
    @State private var region = MKCoordinateRegion(
                center: CLLocationCoordinate2D(
                    latitude: 49.856991,
                    longitude: -97.226865),
                span: MKCoordinateSpan(
                    latitudeDelta: 0.03,
                    longitudeDelta: 0.03)
                )
    @State var SelectedPoint: CLLocationCoordinate2D = CLLocationCoordinate2D(latitude: 49.856991, longitude: -97.226865)
    @State var PointChanged: Bool = false
    
    @State var locations = [Location(name: "SPHS", coordinate: CLLocationCoordinate2D(latitude: 49.856991, longitude: -97.226865))]
    
    
    @Binding var Proximity: Double
    
    var body: some View{
        VStack {
            switch locationDataManager.locationManager.authorizationStatus {
            case .authorizedWhenInUse:  // Location services are available.
                // Insert code here of what should happen when Location services are authorized
                VStack{
                    if PointChanged{
                        Text("Distance: \(Proximity) Meters")
                        GeometryReader{ geo in
                            
                            Map(coordinateRegion: $region, annotationItems: locations) { location in
                                MapAnnotation(coordinate: location.coordinate) {
                                    if location.name == "Proxy"{
                                        let meterSize = (geo.size.height/region.spanLatitude.value)
                                        Circle()
                                            .fill(Color.blue)
                                            .frame(width: meterSize * Proximity, height: meterSize * Proximity)
                                    } else {
                                        Circle()
                                            .fill(Color.red)
                                            .frame(width: 44, height: 44)
                                    }
                                }
                            }.onAppear(){
                                region = MKCoordinateRegion(
                                    center: CLLocationCoordinate2D(
                                        latitude: Double(SelectedPoint.latitude.description)!,
                                        longitude: Double(SelectedPoint.longitude.description)!
                                        ),
                                    span: MKCoordinateSpan(
                                        latitudeDelta: 0.03,
                                        longitudeDelta: 0.03)
                                    )
                                locations = [Location(name: "Location", coordinate: CLLocationCoordinate2D(
                                    latitude: Double(SelectedPoint.latitude.description)!,
                                    longitude: Double(SelectedPoint.longitude.description)!
                                    )), Location(name: "Proxy", coordinate: CLLocationCoordinate2D(
                                        latitude: Double(SelectedPoint.latitude.description)!,
                                        longitude: Double(SelectedPoint.longitude.description)!
                                        ))]
                            }
                        }
                        Slider(value: $Proximity, in: 0...10000)
                            .padding([.leading, .trailing])
                        Button(){
                            PointChanged = false
                        } label: {
                            Text("Pick a new point")
                        }
                    } else {
                        MapView(SelectedPoint: $SelectedPoint, PointChanged: $PointChanged)
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

extension MKCoordinateRegion{
    ///Identify the length of the span in meters north to south
    var spanLatitude: Measurement<UnitLength>{
        let loc1 = CLLocation(latitude: center.latitude - span.latitudeDelta * 0.5, longitude: center.longitude)
        let loc2 = CLLocation(latitude: center.latitude + span.latitudeDelta * 0.5, longitude: center.longitude)
        let metersInLatitude = loc1.distance(from: loc2)
        return Measurement(value: metersInLatitude, unit: UnitLength.meters)
    }
}

struct MapView: UIViewRepresentable {

    typealias UIViewType = MKMapView
    @State private var myMapView: MKMapView?
    
    @Binding var SelectedPoint: CLLocationCoordinate2D
    @Binding var PointChanged: Bool
    
    class Coordinator: NSObject, MKMapViewDelegate {
        var control: MapView

        let sfCoord =  CLLocationCoordinate2D(latitude: 49.856991, longitude: -97.226865)

        @Binding var SelectedPoint: CLLocationCoordinate2D
        @Binding var PointChanged: Bool
        
        init(_ control: MapView, SelectedPoint: Binding<CLLocationCoordinate2D>, PointChanged: Binding<Bool>) {
            self.control = control
            self._SelectedPoint = SelectedPoint
            self._PointChanged = PointChanged
        }

        func mapView(_ mapView: MKMapView, didAdd views: [MKAnnotationView]) {
            if let annotationView = views.first {
                if let annotation = annotationView.annotation {
                    if annotation is MKUserLocation {
                        let region = MKCoordinateRegion(center: annotation.coordinate, latitudinalMeters: 2000, longitudinalMeters: 2000)
                        mapView.setRegion(region, animated: true)
                    }
                }
            }
        }//did add

        @objc func addAnnotationOnTapGesture(sender: UITapGestureRecognizer) {
            if sender.state == .ended {
                let point = sender.location(in: control.myMapView)
                let coordinate = control.myMapView?.convert(point, toCoordinateFrom: control.myMapView)
                
                let annotation = MKPointAnnotation()
                annotation.coordinate = coordinate ?? sfCoord
                annotation.title = "Location"
                control.myMapView?.addAnnotation(annotation)
                SelectedPoint = coordinate!
                PointChanged = true
            }
        }
    }//coord

    func makeUIView(context: Context) -> MKMapView {
        let map = MKMapView()
        map.showsUserLocation = true
        map.delegate = context.coordinator
    
        DispatchQueue.main.async {
            self.myMapView = map
        }
    
        let gRecognizer = UITapGestureRecognizer(target: context.coordinator, action: #selector(Coordinator.addAnnotationOnTapGesture(sender:)))
        map.addGestureRecognizer(gRecognizer)

        return map
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(self, SelectedPoint: $SelectedPoint, PointChanged: $PointChanged)
    }

    func updateUIView(_ uiView: MKMapView, context: Context) {

    }
}//struct MapView
