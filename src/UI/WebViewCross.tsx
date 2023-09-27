import { View, Text, Platform } from 'react-native'
import React, { useState } from 'react'
import WebView from 'react-native-webview'

export default function WebViewCross({html}:{html: string | undefined}) {
  const jsCode = "window.ReactNativeWebView.postMessage(document.getElementById('pauly-main').clientHeight)"
  //document.getElementById('pauly-main').innerHTML
  const [height, setHeight] = useState<number>(0)
  return (
    <>
      { (html !== undefined) ?
        <>
          { (Platform.OS !== "web") ?
            <WebView source={{html: 
              `<!DOCTYPE html>
              <html>
              <head>
                <style>
                  body {font-size: 24px}
                  div {font-size: 24px}
                </style>
              </head>
              <body>
                <div id="pauly-main">
                  ${html}
                </div>
              </body>
              </html>`}} 
              style={{margin: 10, height: height, width: 900}} automaticallyAdjustContentInsets={false} 
              javaScriptEnabled={true}
              injectedJavaScript={jsCode}
              
              onMessage={event => setHeight(parseFloat(event.nativeEvent.data))}
            />:
            <View style={{margin: 10}}>
              <div dangerouslySetInnerHTML={{__html: html}}/>
            </View>
          }
        </>:null
      }
    </>
  )
}