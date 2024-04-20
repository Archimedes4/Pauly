/*
  Pauly
  Andrew Mainella
  November 10 2023
*/
import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect, useState } from 'react';
import { Image, View, Text } from 'react-native';
import WebView from 'react-native-webview';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { pdfDataSlice } from '@redux/reducers/pdfDataReducer';
import store, { RootState } from '@redux/store';
import ProgressView from '../ProgressView';

export default function PDFView({ width }: { width: number }) {
  const { images, pageNumber } = useSelector(
    (state: RootState) => state.pdfData,
  );
  const [imageHeight, setImageHeight] = useState<number>(0);

  function tapChangePage() {
    if (pageNumber + 1 < images.length) {
      store.dispatch(pdfDataSlice.actions.increasePageNumber());
    } else {
      store.dispatch(pdfDataSlice.actions.setPageNumber(0));
    }
  }

  function doubleTapChangePage() {
    if (pageNumber - 1 >= 1) {
      store.dispatch(pdfDataSlice.actions.decreasePageNumber());
    } else if (images.length >= 1) {
      store.dispatch(pdfDataSlice.actions.setPageNumber(images.length - 1));
    }
  }

  function flingChangePage() {
    if (pageNumber + 1 < images.length) {
      store.dispatch(pdfDataSlice.actions.increasePageNumber());
    } else {
      store.dispatch(pdfDataSlice.actions.setPageNumber(pageNumber - 1));
    }
  }

  const singleTap = Gesture.Tap().onEnd((_event, success) => {
    if (success) {
      runOnJS(tapChangePage)()
    }
  });
  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((_event, success) => {
      if (success) {
        runOnJS(doubleTapChangePage)();
      }
    });

  const taps = Gesture.Exclusive(doubleTap, singleTap);

  const fling = Gesture.Fling().onEnd(() => {
    runOnJS(flingChangePage)();
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
      <GestureDetector gesture={compound} >
        <Image
          source={{ uri: images[pageNumber] }}
          style={{ width, height: imageHeight, borderRadius: 15 }}
        />
      </GestureDetector>
    );
  }
  return (
    <>
      <WebViewInject />
      <View
        style={{
          width,
          height: width * (9 / 16),
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ProgressView width={100} height={100} />
        <Text>Loading</Text>
      </View>
    </>
  );
}

function WebViewInject() {
  const { powerpointShare } = useSelector(
    (state: RootState) => state.paulyData,
  );
  const dispatch = useDispatch();
  const [imageResult, setImageResult] = useState<string[]>([])

  return (
    <WebView
      source={{
        html: `<!DOCTYPE html>
        <html>
        <head>
          
        </head>
        <body>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.min.js" integrity="sha512-Z8CqofpIcnJN80feS2uccz+pXWgZzeKxDsDNMD/dJ6997/LSRY+W4NmEt9acwR+Gt9OHN0kkI1CTianCwoqcjQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
          <script>
            async function loadData() {
              const dataResult = await fetch("https://graph.microsoft.com/v1.0/shares/${powerpointShare}/driveItem/content?format=pdf", {
                headers: {
                  "Authorization":"Bearer ${
                    store.getState().authenticationToken
                  }"
                }
              })
              if (!dataResult.ok) {window.ReactNativeWebView.postMessage('failed'); return};
              const data = await dataResult.blob();

              let fileURL = URL.createObjectURL(data);
              let docInitParams = {url: fileURL}

              try {
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.worker.min.js';
                let pdf = await pdfjsLib.getDocument(docInitParams).promise;
          
                let totalPages = pdf.numPages
  
                let canvas = document.createElement('canvas');
  
                for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
                  const page = await pdf.getPage(pageNumber);
                  let viewport = page.getViewport({ scale: 1 });
        
                  // Prepare canvas using PDF page dimensions
                  let context = canvas.getContext('2d');
                  canvas.height = viewport.height;
                  canvas.width = viewport.width;
        
                  // Render PDF page into canvas context
                  let renderContext = { canvasContext: context, viewport: viewport };
        
                  await page.render(renderContext).promise;
                  
                  window.ReactNativeWebView.postMessage(canvas.toDataURL('image/png'));
                }
                window.ReactNativeWebView.postMessage("done");
              } catch (e) {
                window.ReactNativeWebView.postMessage('failed')
              } 
            }
            loadData()
          </script>
          <canvas id="canvas" style='width: 100; height: 100'></canvas>
        </body>
        </html>`,
      }}
      style={{ width: 0, height: 0 }}
      onMessage={e => {
        if (e.nativeEvent.data.length >= 7) {
          setImageResult([...imageResult, e.nativeEvent.data])
        } else if (e.nativeEvent.data === "done") {
          dispatch(pdfDataSlice.actions.setImages(imageResult));
        }
      }}
    />
  );
}
