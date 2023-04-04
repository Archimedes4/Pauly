//
//  Backgrounds.swift
//  Pauly
//
//  Created by Andrew Mainella on 2023-03-27.
//

import Foundation
import SwiftUI

struct Background4: View {
    @State private var startAniamtion: Bool = true
    var body: some View{
        ZStack{
            Rectangle()
                .fill(Color.marron)
                .edgesIgnoringSafeArea(.all)
            TimelineView(.animation(minimumInterval: 6.6, paused: false)) { _ in
                
                Canvas { context, size in
                    context.addFilter(.blur(radius: 10))
                    context.drawLayer { gc in
                        for index in 0...4 {
                            if let resolvedView = context.resolveSymbol(id: index) {
                                gc.draw(resolvedView, at: CGPoint(x: size.width / 2, y: size.height / 2))
                            }
                        }
                    }
                } symbols: {
                    
                    BackgroundCircle(offset: startAniamtion ? CGSize(width: .random(in: -180...180), height: .random(in: -240...240)) : .zero, color: .white, frame: 75)
                        .tag(1)
                        

                    BackgroundCircle(offset: startAniamtion ? CGSize(width: .random(in: -180...180), height: .random(in: -240...240)) : .zero, color: .white, frame: 130)
                        .tag(2)

                    BackgroundCircle(offset: startAniamtion ? CGSize(width: .random(in: -180...180), height: .random(in: -240...240)) : .zero, color: .white, frame: 200)
                        .tag(3)
                        
                    BackgroundCircle(offset: startAniamtion ? CGSize(width: .random(in: -180...180), height: .random(in: -240...240)) : .zero, color: .white, frame: 200)
                        .tag(4)

                }
            }
        }
    }
    @ViewBuilder func BackgroundCircle(offset: CGSize = .zero, color: Color, frame: CGFloat) -> some View {
        Circle()
            .fill(color)
            .shadow(color: .black.opacity(1), radius: 10, x: 10, y: 10)
            .frame(width: frame, height: frame)
            .offset(offset)
            .animation(.easeInOut(duration: 7), value: offset)
    }
}
    
#if DEBUG
struct BackgroundPriview: PreviewProvider {
    static var previews: some View {
        HomePage(ScrollText: "Testing")
    }
}
#endif
