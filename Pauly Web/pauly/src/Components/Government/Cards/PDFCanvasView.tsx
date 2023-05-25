import React, { useRef, useEffect } from 'react';
import { Page } from 'react-pdf';

export default function PDFCanvasView({width, index}:{width: number, index: number}) {
    const canvasRef = useRef(null)
    useEffect(() => {
        if (canvasRef.current !== null){
            canvasRef.current.style.magrin = 0
        }
    }, [canvasRef.current])
  return (
    <div>
        <Page  margin={0} width={width} pageNumber={index + 1} key={index + width} canvasRef={canvasRef}/>
    </div>
  )
}
