import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import "react-pdf/dist/esm/Page/TextLayer.css"
import styles from "./Cards.module.css"
import PDFCanvasView from './PDFCanvasView';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface PDFViewerProps {
  dataUrl: string;
  width: number
}

const PDFViewer: React.FC<PDFViewerProps> = ({ dataUrl, width }) => {
  const [numPages, setNumPages] = React.useState(0);
  const [blob, setBlob] = React.useState<Blob | null>(null);
 
  React.useEffect(() => {
    const fetchPDFBlob = async () => {
      const response = await fetch(dataUrl);
      const data = await response.blob();
      console.log("Data Bold", data)
      setBlob(data);
    };

    fetchPDFBlob();
  }, [dataUrl]);

  useEffect(() => {
    console.log("Width", width)
  }, [width])

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  if (!blob) {
    // Render a loading state while the PDF blob is being fetched
    return <div>Loading...</div>;
  }

  return (
    <div style={{width: "100%", height: "100%"}}>
        <Document file={dataUrl} onLoadSuccess={onDocumentLoadSuccess}>
            {
              Array.from(Array(numPages), (e, i) => {
                return <PDFCanvasView width={width} index={i} />
              })
            }
        </Document>
    </div>
  );
};

function PDFViewContainer({fileUrl}:{fileUrl: string}) {
  const [pageWidth, setPageWidth] = useState<number>(0)
  const containerRef = useRef(null)
  useEffect(() => {
    setPageWidth(containerRef.current?.offsetWidth - 20)
    console.log("Updated To", containerRef.current?.offsetWidth - 20)
  }, [containerRef.current?.offsetWidth])
  return(
    <div ref={containerRef} style={{height: "100%", width: "100%"}}>
      <PDFViewer width={pageWidth} dataUrl={fileUrl}/>
    </div>
  )
}



export default PDFViewContainer;