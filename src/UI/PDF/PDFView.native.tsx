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
  async function getImage() {
    const options = {
      density: 100,
      saveFilename: "untitled",
      savePath: "./images",
      format: "png",
      width: 600,
      height: 600
    };
    const result = await fetch(powerpointBlob)
    if (result.ok) {
      const blob = await result.blob()
      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
     
      
      
    }
  }
  useEffect(() => {
    getImage()
  }, [powerpointBlob, page])
  
  return (
    <>
      <WebView
        style={{width: width * 0.5, height: height * 0.2}}
        source={{ html: '<embed src="' + powerpointBlob + "#page=2"+ '" width="' + width * 0.5 + 'px" height="' +  height * 0.2 + 'px" />' }}
        nestedScrollEnabled={false}
        scrollEnabled={false}
        scalesPageToFit={false}
      />
    </>
  )
}