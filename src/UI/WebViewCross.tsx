import { View, Text, Platform } from 'react-native'
import React from 'react'
import WebView from 'react-native-webview'

export default function WebViewCross({html}:{html: string}) {
  return (
    <>
      { (Platform.OS !== "web") ?
        <WebView source={{html: html}} style={{margin: 10}} automaticallyAdjustContentInsets={false}/>:
        <View style={{margin: 10}}>
          <div dangerouslySetInnerHTML={{__html: html}}/>
        </View>
      }
    </>
  )
}