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

struct AnimatedCheckmarkView: View {
    var animationDuration: Double = 0.75
    var shouldScale = true
    var size: CGSize = .init(width: 300, height: 300)
    var innerShapeSizeRatio: CGFloat = 1/3
    var fromColor: Color = .blue
    var toColor: Color = .green
    var strokeStyle: StrokeStyle = .init(lineWidth: 24, lineCap: .round, lineJoin: .round)
    var animateOnTap = true
    var outerShape: AnyShape = .init(Circle())
    var onAnimationFinish: (() -> Void)?
    
    @State private var outerTrimEnd: CGFloat = 0
    @State private var innerTrimEnd: CGFloat = 0
    @State private var strokeColor = Color.blue
    @State private var scale = 1.0
    
    var body: some View {
        ZStack {
            outerShape
                .trim(from: 0.0, to: outerTrimEnd)
                .stroke(strokeColor, style: strokeStyle)
                .rotationEffect(.degrees(-90))
            
            Checkmark()
                .trim(from: 0, to: innerTrimEnd)
                .stroke(strokeColor, style: strokeStyle)
                .frame(width: size.width * innerShapeSizeRatio,
                       height: size.height * innerShapeSizeRatio)
        }
        .frame(width: size.width, height: size.height)
        .scaleEffect(scale)
        .onAppear() {
            strokeColor = fromColor
            animate()
        }
        .onTapGesture {
            if animateOnTap {
                outerTrimEnd = 0
                innerTrimEnd = 0
                strokeColor = fromColor
                scale = 1
                animate()
            }
        }
    }
    
    
    func animate() {
        if shouldScale {
            withAnimation(.linear(duration: 0.4 * animationDuration)) {
                outerTrimEnd = 1.0
            }
            
            withAnimation(
                .linear(duration: 0.3 * animationDuration)
                .delay(0.4 * animationDuration)
            ) {
                innerTrimEnd = 1.0
            }
            
            withAnimation(
                .linear(duration: 0.2 * animationDuration)
                .delay(0.7 * animationDuration)
            ) {
                strokeColor = toColor
                scale = 1.1
            }
            
            withAnimation(
                .linear(duration: 0.1 * animationDuration)
                .delay(0.9 * animationDuration)
            ) {
                scale = 1
            }
        } else {
            withAnimation(.linear(duration: 0.5 * animationDuration)) {
                outerTrimEnd = 1.0
            }
            withAnimation(
                .linear(duration: 0.3 * animationDuration)
                .delay(0.5 * animationDuration)
            ) {
                innerTrimEnd = 1.0
            }
            
            withAnimation(
                .linear(duration: 0.2 * animationDuration)
                .delay(0.8 * animationDuration)
            ) {
                strokeColor = toColor
            }
        }
        
        DispatchQueue.main.asyncAfter(deadline: .now() + animationDuration) {
            onAnimationFinish?()
        }
    }
}


struct Checkmark: Shape {
    func path(in rect: CGRect) -> Path {
        let width = rect.size.width
        let height = rect.size.height
        
        var path = Path()
        path.move(to: .init(x: 0 * width, y: 0.5 * height))
        path.addLine(to: .init(x: 0.4 * width, y: 1.0 * height))
        path.addLine(to: .init(x: 1.0 * width, y: 0 * height))
        return path
    }
}


struct AnyShape: Shape {
    private var path: (CGRect) -> Path
    
    init<S>(_ shape: S) where S: Shape {
        path = shape.path(in:)
    }
    
    func path(in rect: CGRect) -> Path {
        return path(rect)
    }
}


struct AnimatedCheckmarkView_Previews: PreviewProvider {
    static var previews: some View {
        AnimatedCheckmarkView()
        
//        AnimatedCheckmarkView(size: .init(width: 50, height: 50),
//                              innerShapeSizeRatio: 1/2)
        
//        AnimatedCheckmarkView(fromColor: .red, toColor: .mint)
        
//        AnimatedCheckmarkView(outerShape: AnyShape(RoundedRectangle(cornerRadius: 12)))
    }
}


struct LocationServices: View {
    @StateObject var locationDataManager = LocationDataManager()
    @Binding var SelectedCommision: CommitionType
    @Binding var Success: Bool?
    var body: some View {
        VStack {
            switch locationDataManager.locationManager.authorizationStatus {
            case .authorizedWhenInUse:  // Location services are available.
                // Insert code here of what should happen when Location services are authorized

                let coordinate1 = CLLocation(latitude: Double((locationDataManager.locationManager.location?.coordinate.latitude.description)!)!, longitude: Double((locationDataManager.locationManager.location?.coordinate.longitude.description)!)!) //TO DO HANDLE THIS ERROR IF CANNOT FIND LOCATION

                
                let distanceInMeters = coordinate1.distance(from: SelectedCommision.Location!) //TO DO ERROR HANDLING
                
                if distanceInMeters <= SelectedCommision.Proximity!{
                    //Success
                    ProgressView()
                        .onAppear(){
                            Success = true
                        }
                } else {
                    ProgressView()
                        .onAppear(){
                            Success = false
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
