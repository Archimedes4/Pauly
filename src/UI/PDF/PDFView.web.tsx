import { View, Text, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import * as PDFJS from "pdfjs-dist"

import { useSelector } from 'react-redux'
import { RootState } from '../../Redux/store'
import { DocumentInitParameters } from 'pdfjs-dist/types/src/display/api'

PDFJS.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${PDFJS.version}/legacy/build/pdf.worker.min.js`

//https://stackoverflow.com/questions/18650168/convert-blob-to-base64
function blobToBase64(blob: Blob) {
  return new Promise((resolve: (item: string | undefined) => void) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result !== 'string') {
        resolve(undefined)
      } else {
        resolve(reader.result)
      }
    };
    reader.readAsBinaryString(blob)
  });
}


export default function PDFView() {
  const [images, setImages] = useState<string[]>([])
  const [pageIndex, setPageIndex] = useState<number>(0)
  const {powerpointBlob} = useSelector((state: RootState) => state.paulyData)
  
  async function convertPdfToImages(url: string) {
    const images: string[] = [];
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
          images.push(canvas.toDataURL());
        }
      }
      canvas.remove();
      setImages(images)
    }
  }

  useEffect(() => {
    convertPdfToImages(powerpointBlob)
  }, [powerpointBlob])
  
  return (
    <>
      { (pageIndex < images.length) ?
        <Image source={{uri: images[pageIndex], width: 200, height: 100}} height={100} width={100}/>:null
      }
    </>
  )
}