import { View, Text, Platform } from 'react-native'
import React, { useState } from 'react'
import WebView from 'react-native-webview'

export default function WebViewCross({html, width}:{html: string | undefined, width: number}) {
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
                  body {font-weight: normal; font-family: Arial; font-size: 55px}
                  div {font-weight: normal; font-family: Arial}
                </style>
              </head>
              <body>
                <div id="pauly-main">
                  ${html}
                </div>
              </body>
              </html>`}} 
              style={{margin: 10, height: height + 10, width: width}}
              automaticallyAdjustContentInsets={false} 
              javaScriptEnabled={true}
              injectedJavaScript={jsCode}
              onMessage={event => setHeight(parseFloat(event.nativeEvent.data)/3)}
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