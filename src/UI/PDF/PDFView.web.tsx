import { View, Text, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import PDFJS from "pdfjs-dist"
import { useSelector } from 'react-redux'
import { RootState } from '../../Redux/store'

export default function PDFView() {
  const [images, setImages] = useState<string[]>([])
  const [pageIndex, setPageIndex] = useState<number>(0)
  const {powerpointBlob} = useSelector((state: RootState) => state.paulyData)
  
  async function convertPdfToImages(url: string) {
    const images: string[] = [];
    console.log("fetch")
    const dataResult = await fetch(url)
    if (dataResult.ok) {
      const data = await dataResult.blob()
      const arrayBuffer = await data.arrayBuffer()
      console.log(arrayBuffer)
      const pdf = await PDFJS.getDocument(url).promise;
      const canvas = document.createElement("canvas");
      for (let i = 0; i < pdf.numPages; i++) {
        const page = await pdf.getPage(i + 1);
        const viewport = page.getViewport({ scale: 1 });
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;
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
      <Text>Hre</Text>
      { (pageIndex < images.length) ?
        <>
          <Text>Rendering {images[pageIndex]}</Text>
          <Image source={{uri: images[pageIndex]}} height={100} width={100}/>
        </>:null
      }
    </>
  )
}