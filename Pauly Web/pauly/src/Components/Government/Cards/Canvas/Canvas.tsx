import React, { useCallback, useEffect, useRef, useState, useImperativeHandle, MouseEventHandler } from 'react';


export enum CanvasModeType{
    Draw,
    PickColor
}



const App = React.forwardRef(({width, height, selectedColor, onSetSelectedColor, selectedCanvasMode}:{selectedCanvasMode: CanvasModeType, width: string, height: string, selectedColor: string, onSetSelectedColor: (item: string) => void}, ref) => {
    const canvasRef = useRef(null);

    useImperativeHandle(ref, () => {
        return {
          // ... your methods ...
          async download()  {
            const result = await download()
            console.log("la la la a al a", result)
            return result
          },
          clear() {
            clear()
          }
        };
    }, []);

    const ctx = useRef(null);

    const [mouseDown, setMouseDown] = useState(false);
    const [lastPosition, setPosition] = useState({
        x: 0,
        y: 0
    });

    useEffect(() => {
        if (canvasRef.current) {
            ctx.current = canvasRef.current.getContext('2d');
        }
    }, []);

    const draw = useCallback((x: number, y: number) => {
        if (mouseDown) {
            ctx.current.beginPath();
            ctx.current.strokeStyle = selectedColor;
            ctx.current.lineWidth = 10;
            ctx.current.lineJoin = 'round';
            ctx.current.moveTo(lastPosition.x, lastPosition.y);
            ctx.current.lineTo(x, y);
            ctx.current.closePath();
            ctx.current.stroke();

            setPosition({
                x,
                y
            })
        }
    }, [lastPosition, mouseDown, selectedColor, setPosition])

    const download = async () => {
        const image = canvasRef.current.toDataURL('image/png');
        const blob = await (await fetch(image)).blob();
        const blobURL = URL.createObjectURL(blob);
        return blobURL
    }

    const clear = () => {
        ctx.current.clearRect(0, 0, ctx.current.canvas.width, ctx.current.canvas.height)
    }

    const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        if (selectedCanvasMode === CanvasModeType.Draw){
            setPosition({
                x: e.clientX - canvasRef.current?.getBoundingClientRect().left,
                y: e.clientY - canvasRef.current?.getBoundingClientRect().top
            })
            setMouseDown(true)
        } else if (selectedCanvasMode === CanvasModeType.PickColor){
            console.log("Running Code Right Here. Does this thing work.")
            const x = e.clientX - canvasRef.current?.getBoundingClientRect().left
            const y = e.clientY - canvasRef.current?.getBoundingClientRect().top
            var imageData = ctx.current.getImageData(x, y, 1, 1).data;
            const rgbaColor = 'rgba(' + imageData[0] + ',' + imageData[1] + ',' + imageData[2] + ',1)';
            onSetSelectedColor(rgbaColor)
        }
    }

    const onMouseUp = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        setMouseDown(false)
    }

    const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        if (selectedCanvasMode === CanvasModeType.Draw){
            draw(e.clientX - canvasRef.current?.getBoundingClientRect().left, e.clientY - canvasRef.current?.getBoundingClientRect().top)
        }
    }

    return (
        <div className="App">
        <canvas
            style={{
            border: "1px solid #000"
            }}
            width={width}
            height={height}
            ref={canvasRef}
            onMouseDown={(e) => {onMouseDown(e)}}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onMouseMove={onMouseMove}
        />
        </div>
    );
})

export default App;