import { View, Platform, ViewStyle } from 'react-native';
import React, { useState } from 'react';
import WebView from 'react-native-webview';

export default function WebViewCross({
  html,
  height,
  rawHtml,
  style,
  width,
}:
  | {
      html: string | undefined;
      width: number;
      rawHtml?: undefined;
      height?: undefined;
      style?: ViewStyle | undefined;
    }
  | {
      rawHtml: string | undefined;
      width: number;
      height: number;
      html?: undefined;
      style?: ViewStyle | undefined;
    }) {
  const jsCode = `
      window.ReactNativeWebView.postMessage("" + document.getElementById('pauly-main').offsetHeight);
    `;
  // document.getElementById('pauly-main').innerHTML
  const [adaptHeight, setAdaptHeight] = useState<number>(0);
  if (html === undefined && rawHtml === undefined) {
    return null;
  }

  if (Platform.OS !== 'web') {
    return (
      <WebView
        source={{
          html:
            rawHtml ||
            `<!DOCTYPE html>
            <html>
            <head>
              <meta name="viewport" content="width=${width - 20}px"/>
              <style>
                body {font-weight: normal; font-family: Arial; width: 100%}
                div {font-weight: normal; font-family: Arial; width: 100%; padding: 0; margin: 0; font-size: 15px}
                .main {
                  padding: 0;
                  margin: 0;
                  position: absolute;
                }
              </style>
            </head>
            <body>
              <div id="pauly-main" class="main">
                ${html}
              </div>
            </body>
            </html>`,
        }}
        style={[
          {
            margin: 10,
            height: height || adaptHeight + 10,
            width,
          },
          style,
        ]}
        javaScriptEnabled
        injectedJavaScript={jsCode}
        onMessage={event => {
          setAdaptHeight(parseFloat(event.nativeEvent.data));
        }}
        scalesPageToFit={false}
      />
    );
  }
  if (html !== undefined) {
    return (
      <View style={[{ margin: 10 }, style]}>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </View>
    );
  }
  if (rawHtml !== undefined) {
    return (
      <View style={[{ margin: 10 }, style]}>
        <div dangerouslySetInnerHTML={{ __html: rawHtml }} />
      </View>
    );
  }
}
