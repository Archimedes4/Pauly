import { View, Text, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import * as PDFJS from "pdfjs-dist"
import { useSelector } from 'react-redux'
import { RootState } from '../../Redux/store'
import { DocumentInitParameters } from 'pdfjs-dist/types/src/display/api'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'

PDFJS.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${PDFJS.version}/legacy/build/pdf.worker.min.js`


export default function PDFView({width}:{width: number}) {
  const [images, setImages] = useState<string[]>([])
  const [pageIndex, setPageIndex] = useState<number>(0)
  const {powerpointBlob} = useSelector((state: RootState) => state.paulyData)
  const [imageHeight, setImageHeight] = useState<number>(0)
  
  async function convertPdfToImages(url: string) {
    const images: string[] = [];
    const dataResult = await fetch(url)
    if (dataResult.ok) {
      const blob = await dataResult.blob()
      var file = new Blob([blob], {type: 'application/pdf'});
      var fileURL = URL.createObjectURL(file);
      var docInitParams: DocumentInitParameters = {url: fileURL}
      
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
  
  const singleTap = Gesture.Tap().onEnd((_event, success) => {
    if (success) {
      if ((pageIndex + 1) < images.length) {
        setPageIndex(pageIndex + 1)
      } else {
        setPageIndex(0)
      }
    }
  });
  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((_event, success) => {
      if (success) {
        if ((pageIndex - 1) >= 1) {
          setPageIndex(pageIndex - 1)
        } else {
          setPageIndex(images.length)
        }
      }
  });

  const taps = Gesture.Exclusive(doubleTap, singleTap);
  
  const fling = Gesture.Fling().onEnd(() => {
    if ((pageIndex + 1) < images.length) {
      setPageIndex(pageIndex + 1)
    } else {
      setPageIndex(0)
    }
  })

  const compound = Gesture.Simultaneous(
    fling, taps
  )


  return (
    <>
      { (pageIndex < images.length) ?
       <GestureDetector gesture={compound}>
        <Image source={{uri: images[pageIndex], width: width}} style={{borderRadius: 15, width: width, height: imageHeight}} height={imageHeight} width={width}/>
       </GestureDetector>:null
      }
    </>
  )
}