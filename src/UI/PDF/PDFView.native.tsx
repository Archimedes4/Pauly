import { useDispatch, useSelector } from 'react-redux';
import store, { RootState } from '../../Redux/store';
import { useEffect, useState } from "react";
import React from "react";
import { Platform, Text, Image } from "react-native";
import WebView from "react-native-webview";
import { GestureDetector, ScrollView, Gesture } from 'react-native-gesture-handler';
import { pdfDataSlice } from '../../Redux/reducers/pdfDataReducer';
import { runOnJS } from 'react-native-reanimated';

export default function PDFView({width}:{width: number}) {
  const {powerpointBlob} = useSelector((state: RootState) => state.paulyData)
  const {inject, images, pageNumber} = useSelector((state: RootState) => state.pdfData)
  const [imageHeight, setImageHeight] = useState<number>(0)
  const dispatch = useDispatch()

  async function loadData() {
    const dataResult = await fetch(powerpointBlob)
    if (dataResult.ok) {
      const blob = await dataResult.blob()
      var file = new Blob([blob], {type: 'application/pdf'});
      var fileURL = URL.createObjectURL(file);
      dispatch(pdfDataSlice.actions.setInject(fileURL))
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  function tapChangePage() {
    if ((pageNumber + 1) < images.length) {
      store.dispatch(pdfDataSlice.actions.increasePageNumber())
    } else {
      store.dispatch(pdfDataSlice.actions.setPageNumber(0))
    }
  }

  function doubleTapChangePage() {
    if ((pageNumber - 1) >= 1) {
      store.dispatch(pdfDataSlice.actions.decreasePageNumber())
    } else if (images.length >= 1) {
      store.dispatch(pdfDataSlice.actions.setPageNumber(images.length - 1))
    }
  }

  function flingChangePage() {
    if ((pageNumber + 1) < images.length) {
      store.dispatch(pdfDataSlice.actions.increasePageNumber())
    } else {
      store.dispatch(pdfDataSlice.actions.setPageNumber(pageNumber - 1))
    }
  }
  
  const singleTap = Gesture.Tap().onEnd((_event, success) => {
    if (success) {
      runOnJS(tapChangePage)
    }
  });
  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((_event, success) => {
      if (success) {
        runOnJS(doubleTapChangePage)
      }
  });

  const taps = Gesture.Exclusive(doubleTap, singleTap);
  
  const fling = Gesture.Fling().onEnd(() => {
    runOnJS(flingChangePage)
  })

  const compound = Gesture.Simultaneous(
    fling, taps
  )

  useEffect(() => {
    if (pageNumber < images.length) {
      Image.getSize(images[pageNumber], (imageMeasureWidth, imageMeasureHeight) => {
        const heightPerWidth = imageMeasureHeight/imageMeasureWidth
        setImageHeight(width * heightPerWidth)
      })
    }
  }, [pageNumber, images])

  return (
    <>
      { (powerpointBlob !== "" && inject !== "") ?
        <WebViewInject/>:null 
      }
      { (pageNumber < images.length) ?
        <GestureDetector gesture={compound}>
          <Image source={{uri: images[pageNumber]}} style={{width: width, height: imageHeight, borderRadius: 15}}/>
        </GestureDetector>:null
      }
    </>
  )
}

function WebViewInject() {
  const {width, height} = useSelector((state: RootState) => state.dimentions)
  const {powerpointShare} = useSelector((state: RootState) => state.paulyData)
  const {inject} = useSelector((state: RootState) => state.pdfData)
  const dispatch = useDispatch()

  useEffect(() => {
    console.log("This is inject", inject)
  }, [inject])
  return (
    <WebView
      source={{html:
       `<!DOCTYPE html>
        <html>
        <head>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js" integrity="sha512-BbrZ76UNZq5BhH7LL7pn9A4TKQpQeNCHOo65/akfelcIBbcVvYWOFQKPXIrykE3qZxYjmDX573oa4Ywsc7rpTw==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
          <script src="https://npmcdn.com/pdfjs-dist/build/pdf.js"></script>
        </head>
        <body>
          <script>
            async function loadData() {
              const dataResult = await fetch("https://graph.microsoft.com/v1.0/shares/${powerpointShare}/driveItem/content?format=pdf", {
                headers: {
                  "Authorization":"Bearer ${store.getState().authenticationToken}"
                }
              })
              if (!dataResult.ok) {window.ReactNativeWebView.postMessage('failed'); return}
              const data = await dataResult.blob()

              var fileURL = URL.createObjectURL(data);
              var docInitParams = {url: fileURL}
              var url = 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf';
              var PDFJS = window['pdfjs-dist/build/pdf'];
              try {
                PDFJS.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
              } catch (e) {
                window.ReactNativeWebView.postMessage('failed')
              } 
              
              var loadingTask = PDFJS.getDocument(docInitParams);
              loadingTask.promise.then(function(pdf) {
          
                var canvasdiv = document.getElementById('canvas');
                var totalPages = pdf.numPages
                var data = [];
          
                for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
                  pdf.getPage(pageNumber).then(function(page) {
          
                    var scale = 1.5;
                    var viewport = page.getViewport({ scale: scale });
          
                    var canvas = document.createElement('canvas');
                    canvasdiv.appendChild(canvas);
          
                    // Prepare canvas using PDF page dimensions
                    var context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
          
                    // Render PDF page into canvas context
                    var renderContext = { canvasContext: context, viewport: viewport };
          
                    var renderTask = page.render(renderContext);
                    renderTask.promise.then(function() {
                      data.push(canvas.toDataURL('image/png'))
                     
                      window.ReactNativeWebView.postMessage(data);
                      
                    });
                  });
                }
          
              }, function(reason) {
                // PDF loading error
                window.ReactNativeWebView.postMessage('failed')
              });
            }
            loadData()
          </script>
          <canvas id="canvas" style='width: 100; height: 100'></canvas>
        </body>
        </html>`
      }}
      style={{width: 0, height: 0}}
      onMessage={(e) => {if (e.nativeEvent.data.length >= 7) {dispatch(pdfDataSlice.actions.addImage(e.nativeEvent.data))} else {console.log("else")}}}
    />
  )
}

//`https://graph.microsoft.com/v1.0/shares/${data["powerpointId"]}/driveItem/content?format=pdf`