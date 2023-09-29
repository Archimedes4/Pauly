import { useSelector } from 'react-redux';
import { RootState } from '../../Redux/store';
import { useEffect, useState } from "react";
import React from "react";
import { Platform } from "react-native";
import WebView from "react-native-webview";

export default function PDFView() {
  const {width, height} = useSelector((state: RootState) => state.dimentions)
  const {powerpointBlob} = useSelector((state: RootState) => state.paulyData)
  const [page, setPage] = useState<number>(1)
  
  return (
    <>
      { (powerpointBlob !== "") ?
        <WebView
          style={{width: width * 0.5, height: height * 0.2}}
          source={{html: 
            `<!DOCTYPE html>
              <html>
              <head>
               
              </head>
              <body>
                <p>Test</p>
                <embed src="${powerpointBlob}" width="${width * 0.5}px" height="${height * 0.2}px" />
              </body>
              </html>`
           }}
        />:null 
      }
    </>
  )
}