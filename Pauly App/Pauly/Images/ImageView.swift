//
//  ImageView.swift
//  Pauly
//
//  Created by Andrew Mainella on 2023-04-06.
//

import SwiftUI
import UIKit
import AVFoundation
import FirebaseAuth
import FirebaseStorage
import FirebaseFirestore

struct ImageView: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    @Binding var selectedImage: UIImage?
    @Binding var ImageConfirmed: Bool
    @Binding var SheetPresented: Bool
    @State private var sourceType: UIImagePickerController.SourceType = .photoLibrary
    var body: some View{
        NavigationView{
            VStack{
                if selectedImage != nil{
                    Image(uiImage: selectedImage!)
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .cornerRadius(10)
                        .frame(width: 300, height: 300)
                    Button(){
                        selectedImage = nil
                    } label: {
                        Text("USE A DIFERENT PHOTO")
                            .font(.system(size: 17))
                            .fontWeight(.bold)
                            .foregroundColor(.black)
                            .frame(minWidth: 0, maxWidth: .infinity)
                            .padding([.top, .bottom])
                            .background(
                                RoundedRectangle(cornerRadius: 25)
                                    .fill(Color.white)
                                    .shadow(color: .gray, radius: 2, x: 0, y: 2)
                            )
                            .padding()
                    }
                    Button(){
                        ImageConfirmed = true
                    } label: {
                        Text("CONFIRM")
                            .font(.system(size: 17))
                            .fontWeight(.bold)
                            .foregroundColor(.black)
                            .frame(minWidth: 0, maxWidth: .infinity)
                            .padding([.top, .bottom])
                            .background(
                                RoundedRectangle(cornerRadius: 25)
                                    .fill(Color.white)
                                    .shadow(color: .gray, radius: 2, x: 0, y: 2)
                            )
                            .padding()
                    }
                    
                } else {
                    Spacer()
                    Text("Please Choose an Image")
                    Spacer()
                    NavigationLink(destination: ImagePickerView(selectedImage: self.$selectedImage, sourceType: self.sourceType)){
                        Text("TAKE PHOTO")
                            .font(.system(size: 17))
                            .fontWeight(.bold)
                            .foregroundColor(.black)
                            .frame(minWidth: 0, maxWidth: .infinity)
                            .padding([.top, .bottom])
                            .background(
                                RoundedRectangle(cornerRadius: 25)
                                    .fill(Color.white)
                                    .shadow(color: .gray, radius: 2, x: 0, y: 2)
                            )
                            .padding()
                    }.simultaneousGesture(TapGesture().onEnded{
                        sourceType = .camera
                    })
                    NavigationLink(destination: ImagePickerView(selectedImage: self.$selectedImage, sourceType: self.sourceType)){
                        Text("SELECT PHOTO")
                            .font(.system(size: 17))
                            .fontWeight(.bold)
                            .foregroundColor(.black)
                            .frame(minWidth: 0, maxWidth: .infinity)
                            .padding([.top, .bottom])
                            .background(
                                RoundedRectangle(cornerRadius: 25)
                                    .fill(Color.white)
                                    .shadow(color: .gray, radius: 2, x: 0, y: 2)
                            )
                            .padding()
                    }.simultaneousGesture(TapGesture().onEnded{
                        sourceType = .photoLibrary
                    })
                }
                Button(){
                    SheetPresented = false
                } label: {
                    Text("BACK")
                        .font(.system(size: 17))
                        .fontWeight(.bold)
                        .foregroundColor(.black)
                        .frame(minWidth: 0, maxWidth: .infinity)
                        .padding([.top, .bottom])
                        .background(
                            RoundedRectangle(cornerRadius: 25)
                                .fill(Color.white)
                                .shadow(color: .gray, radius: 2, x: 0, y: 2)
                        )
                        .padding()
                }
            }
        }//mark
    }
}

extension UIImage {
  func scalePreservingAspectRatio(width: Int, height: Int) -> UIImage {
    let widthRatio = CGFloat(width) / size.width
    let heightRatio = CGFloat(height) / size.height
    
    let scaleFactor = min(widthRatio, heightRatio)
    
    let scaledImageSize = CGSize(
      width: size.width * scaleFactor,
      height: size.height * scaleFactor
    )
    
    let format = UIGraphicsImageRendererFormat()
    format.scale = 1
    
    let renderer = UIGraphicsImageRenderer(
      size: scaledImageSize,
      format: format
    )
    
    let scaledImage = renderer.image { _ in
      self.draw(in: CGRect(
        origin: .zero,
        size: scaledImageSize
      ))
    }
    
    return scaledImage
  }
}

struct ImagePickerView: UIViewControllerRepresentable {
    
    @Binding var selectedImage: UIImage?
    @Environment(\.presentationMode) var isPresented
    var sourceType: UIImagePickerController.SourceType
        
    func makeUIViewController(context: Context) -> UIImagePickerController {
        let imagePicker = UIImagePickerController()
        imagePicker.sourceType = self.sourceType
        imagePicker.delegate = context.coordinator // confirming the delegate
        return imagePicker
    }

    func updateUIViewController(_ uiViewController: UIImagePickerController, context: Context) {

    }

    // Connecting the Coordinator class with this struct
    func makeCoordinator() -> Coordinator {
        return Coordinator(picker: self)
    }
}

class Coordinator: NSObject, UINavigationControllerDelegate, UIImagePickerControllerDelegate {
    var picker: ImagePickerView
    
    init(picker: ImagePickerView) {
        self.picker = picker
    }
    
    func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey : Any]) {
        guard let selectedImage = info[.originalImage] as? UIImage else { return }
        self.picker.selectedImage = selectedImage
        self.picker.isPresented.wrappedValue.dismiss()
    }
    
}
