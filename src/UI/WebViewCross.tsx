import { View, Platform, ViewStyle } from 'react-native';
import React, { useState } from 'react';
import WebView from 'react-native-webview';

export default function WebViewCross({
  html,
  height,
  rawHtml,
  style,
  width,
}:({
  html: string | undefined;
  width: number;
  rawHtml?: undefined;
  height?: undefined;
  style?: ViewStyle | undefined;
}| {rawHtml: string | undefined, width: number, height: number, html?: undefined, style?: ViewStyle | undefined;})) {
  const jsCode =
    "window.ReactNativeWebView.postMessage(document.getElementById('pauly-main').clientHeight)";
  // document.getElementById('pauly-main').innerHTML
  const [adaptHeight, setAdaptHeight] = useState<number>(0);
  return (
    <>
      {(html !== undefined || rawHtml !== undefined) ? (
        <>
          {Platform.OS !== 'web' ? (
            <WebView
              source={{
                html: rawHtml ? rawHtml:`<!DOCTYPE html>
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
                </html>`,
              }}
              style={[{ margin: 10, height: height ? height:adaptHeight + 10, width }, style]}
              automaticallyAdjustContentInsets={false}
              javaScriptEnabled
              injectedJavaScript={jsCode}
              onMessage={event =>
                setAdaptHeight(parseFloat(event.nativeEvent.data) / 3)
              }
            />
          ) : (
            <View style={[{ margin: 10 }, style]}>
              { (html !== undefined) ?
                <div dangerouslySetInnerHTML={{ __html: html }} />:
                <>
                  { (rawHtml !== undefined) ?
                    {rawHtml}:null
                  }
                </>
              }
            </View>
          )}
        </>
      ) : null}
    </>
  );
}
