import { useDispatch, useSelector } from 'react-redux';
import store, { RootState } from '../../Redux/store';
import { useEffect, useState } from "react";
import React from "react";
import { Platform, Text, Image } from "react-native";
import WebView from "react-native-webview";
import { ScrollView } from 'react-native-gesture-handler';
import { pdfDataSlice } from '../../Redux/reducers/pdfDataReducer';

//https://stackoverflow.com/questions/18650168/convert-blob-to-base64
function blobToBase64(blob: Blob) {
  return new Promise((resolve: (item: string | undefined) => void) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob)
    reader.onloadend = () => {
      if (typeof reader.result !== 'string') {
        resolve(undefined)
      } else {
        resolve(reader.result)
      }
    };
  });
}

export default function PDFView() {
  const {width, height} = useSelector((state: RootState) => state.dimentions)
  const {powerpointBlob} = useSelector((state: RootState) => state.paulyData)
  const {inject, images} = useSelector((state: RootState) => state.pdfData)
  const [page, setPage] = useState<number>(1)
  const dispatch = useDispatch()

  async function loadData() {
    const dataResult = await fetch(powerpointBlob)
    if (dataResult.ok) {
      const blob = await dataResult.blob()
      var file = new Blob([blob], {type: 'application/pdf'});
      var fileURL = URL.createObjectURL(file);
      dispatch(pdfDataSlice.actions.setInject(fileURL))
      console.log("logged")
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <>
      { (powerpointBlob !== "" && inject !== "") ?
        <WebViewInject/>:null 
      }
     
          { (images !== "failed" && images !== "") ?
           <Image source={{uri: images}} style={{width: 100, height: 100}}/>:<Text>Failed</Text>
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
            window.ReactNativeWebView.postMessage('this')
            async function loadData() {
              window.ReactNativeWebView.postMessage('that')
              const dataResult = await fetch("https://graph.microsoft.com/v1.0/shares/${powerpointShare}/driveItem/content?format=pdf", {
                headers: {
                  "Authorization":"Bearer ${store.getState().authenticationToken}"
                }
              })
              window.ReactNativeWebView.postMessage('that 1')
              if (!dataResult.ok) {window.ReactNativeWebView.postMessage('failed'); return}
              const data = await dataResult.blob()
              window.ReactNativeWebView.postMessage('that 3')
              
              window.ReactNativeWebView.postMessage('that 4')
              var fileURL = URL.createObjectURL(data);
              var docInitParams = {url: fileURL}
              window.ReactNativeWebView.postMessage('ran')
              window.ReactNativeWebView.postMessage('that 2')
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
                      if (totalPages == data.length) {
                        window.ReactNativeWebView.postMessage(data[0]);
                      }
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
      onMessage={(e) => {dispatch(pdfDataSlice.actions.setImages(e.nativeEvent.data))}}
    />
  )
}

//`https://graph.microsoft.com/v1.0/shares/${data["powerpointId"]}/driveItem/content?format=pdf`