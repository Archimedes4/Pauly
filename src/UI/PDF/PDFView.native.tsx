import { useSelector } from 'react-redux';
import { RootState } from '../../Redux/store';
import { useEffect, useState } from "react";
import React from "react";
import { Platform, View } from "react-native";
import WebView from "react-native-webview";
import { DocumentInitParameters } from 'pdfjs-dist/types/src/display/api';
import * as PDFJS from "pdfjs-dist"
PDFJS.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${PDFJS.version}/legacy/build/pdf.worker.min.js`

export default function PDFView() {
  const [images, setImages] = useState<string[]>([])
  const [pageIndex, setPageIndex] = useState<number>(0)
  const {powerpointBlob} = useSelector((state: RootState) => state.paulyData)
  
  async function convertPdfToImages(url: string) {
    const images: string[] = [];
    console.log("fetch")
    const dataResult = await fetch(url)
    if (dataResult.ok) {
      const blob = await dataResult.blob()
      const base64: string | undefined = await blobToBase64(blob)
      if (base64 === undefined) {return}
      var docInitParams: DocumentInitParameters = {data: base64}
      
      const pdf = await PDFJS.getDocument(docInitParams).promise
      const canvas = document.createElement("canvas"); //Fail
      for (let i = 0; i < pdf.numPages; i++) {
        const page = await pdf.getPage(i + 1);
        const viewport = page.getViewport({ scale: 1 });
        const context = canvas.getContext("2d"); //Fail
        canvas.height = viewport.height; //Fail
        canvas.width = viewport.width; //Fail
        if (context !== null) {
          await page.render({ canvasContext: context, viewport: viewport }).promise;
          console.log(canvas.toDataURL())
          images.push(canvas.toDataURL());
        }
      }
      canvas.remove();
      setImages(images)
    }
  }
  
  return (
    <>
      <View>
        
      </View>
    </>
  )
}

function blobToBase64(blob: Blob): string | PromiseLike<string | undefined> | undefined {
  throw new Error('Function not implemented.');
}
