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
    @State private var sourceType: UIImagePickerController.SourceType = .photoLibrary
    @State private var selectedImage: UIImage?
    @Binding var ImageSubmission: Bool
    @State var CommissionID: Int
    @State var CommissionProcessStarted: Bool = false
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
                        CommissionProcessStarted = true
                        let Uid = Auth.auth().currentUser!.uid
                        let storage = Storage.storage()
                        let storageRef = storage.reference().child("\(CommissionID)-\(Uid)")
                        let resizedImage = selectedImage?.scalePreservingAspectRatio(width: 200, height: 200)
                        let data = resizedImage!.jpegData(compressionQuality: 0.2)
                        let metadata = StorageMetadata()
                        metadata.contentType = "image/jpg"
                        if let data = data {
                            storageRef.putData(data, metadata: metadata) { (metadata, error) in
                                if let error = error {
                                    print("Error while uploading file: ", error)
                                }

                                if let metadata = metadata {
                                    print("Metadata: ", metadata)
                                }
                            }
                        }
                        let db = Firestore.firestore()

                        let docRef = db.collection("Users").document(WindowMode.UsernameIn)
                        
                        docRef.updateData(["CompletedCommissions":FieldValue.arrayUnion([CommissionID])]) { error in
                            if let error = error {
                                print("Error updating document: \(error)")
                                //TO DO HANDLE ERROR
                            } else {
                                ImageSubmission = false
                            }
                        }
                    } label: {
                        if CommissionProcessStarted{
                            ProgressView()
                                .frame(minWidth: 0, maxWidth: .infinity)
                                .padding([.top, .bottom])
                                .background(
                                    RoundedRectangle(cornerRadius: 25)
                                        .fill(Color.white)
                                        .shadow(color: .gray, radius: 2, x: 0, y: 2)
                                )
                                .padding()
                        } else {
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
                    if CommissionProcessStarted == false{
                        ImageSubmission = false
                    }
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
