import React from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface PDFViewerProps {
  dataUrl: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ dataUrl }) => {
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

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  if (!blob) {
    // Render a loading state while the PDF blob is being fetched
    return <div>Loading...</div>;
  }

  return (
    <div style={{width: "100%"}}>
      <Document file={blob} onLoadSuccess={onDocumentLoadSuccess}>
        <Page pageNumber={1} />
      </Document>
    </div>
  );
};

export default PDFViewer;