/*
  Pauly
  Andrew Mainella
  1 January 2024
  !IMPORTANT! went updating pdfjs make sure to change imports marked !IMPORTANT! update import
  Pdf web, converts a pdf to images. Used in the home view.
*/
import { Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { DocumentInitParameters } from 'pdfjs-dist/types/src/display/api';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import store, { RootState } from '@redux/store';
import { pdfDataSlice } from '@redux/reducers/pdfDataReducer';
import Head from 'expo-router/head';

function PDFViewBody({ width }: { width: number }) {
  const { powerpointBlob } = useSelector((state: RootState) => state.paulyData);
  const { images, pageNumber } = useSelector(
    (state: RootState) => state.pdfData,
  );
  const [imageHeight, setImageHeight] = useState<number>(0);

  async function convertPdfToImages(url: string) {
    const { pdfjsLib } = globalThis;
    if (pdfjsLib !== undefined) {
/* !IMPORTANT! update import */
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        '/pdfjs-4.0.379-dist/build/pdf.worker.mjs';

      const imagesArray: string[] = [];
      const dataResult = await fetch(url);
      if (dataResult.ok) {
        const blob = await dataResult.blob();
        const file = new Blob([blob], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        const docInitParams: DocumentInitParameters = { url: fileURL };

        const pdf = await pdfjsLib.getDocument(docInitParams).promise;
        const canvas = document.createElement('canvas'); 
        for (let i = 0; i < pdf.numPages; i += 1) {
          const page = await pdf.getPage(i + 1);
          const viewport = page.getViewport({ scale: 1 });
          const context = canvas.getContext('2d'); 
          canvas.height = viewport.height; 
          canvas.width = viewport.width;
          if (context !== null) {
            await page.render({ canvasContext: context, viewport }).promise;
            imagesArray.push(canvas.toDataURL());
          }
        }
        canvas.remove();
        store.dispatch(pdfDataSlice.actions.setImages(imagesArray));
      }
    }
  }

  useEffect(() => {
    convertPdfToImages(powerpointBlob);
  }, [powerpointBlob, globalThis]);

  const singleTap = Gesture.Tap().onEnd((_event, success) => {
    if (success) {
      if (pageNumber + 1 < images.length) {
        store.dispatch(pdfDataSlice.actions.increasePageNumber());
      } else {
        store.dispatch(pdfDataSlice.actions.setPageNumber(0));
      }
    }
  });
  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((_event, success) => {
      if (success) {
        if (pageNumber - 1 >= 1) {
          store.dispatch(pdfDataSlice.actions.decreasePageNumber());
        } else if (images.length >= 1) {
          store.dispatch(pdfDataSlice.actions.setPageNumber(images.length - 1));
        }
      }
    });

  const taps = Gesture.Exclusive(doubleTap, singleTap);

  const fling = Gesture.Fling().onEnd(() => {
    if (pageNumber + 1 < images.length) {
      store.dispatch(pdfDataSlice.actions.increasePageNumber());
    } else {
      store.dispatch(pdfDataSlice.actions.setPageNumber(pageNumber - 1));
    }
  });

  const compound = Gesture.Simultaneous(fling, taps);

  useEffect(() => {
    if (pageNumber < images.length) {
      Image.getSize(
        images[pageNumber],
        (imageMeasureWidth, imageMeasureHeight) => {
          const heightPerWidth = imageMeasureHeight / imageMeasureWidth;
          setImageHeight(width * heightPerWidth);
        },
      );
    }
  }, [pageNumber, images, width]);

  if (pageNumber < images.length) {
    return (
      <GestureDetector gesture={compound}>
        <Image
          source={{ uri: images[pageNumber], width }}
          style={{ borderRadius: 15, width, height: imageHeight }}
          height={imageHeight}
          width={width}
        />
      </GestureDetector>
    );
  }
  return null;
}

export default function PDFView({ width }: { width: number }) {
  return (
    <>
      <Head>
{/* !IMPORTANT! update import */}
        <script src="/pdfjs-4.0.379-dist/build/pdf.mjs" type="module" />
      </Head>
      <PDFViewBody width={width} />
    </>
  );
}
